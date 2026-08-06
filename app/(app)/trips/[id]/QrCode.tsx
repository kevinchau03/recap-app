const VERSION = 7;
const SIZE = 21 + (VERSION - 1) * 4;
const DATA_CODEWORDS = 156;
const EC_CODEWORDS_PER_BLOCK = 20;
const BLOCKS = 2;
const FORMAT_LOW_MASK_0 = 0b111011111000100;

type Modules = {
  value: boolean[][];
  reserved: boolean[][];
};

const createMatrix = (): Modules => ({
  value: Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => false)),
  reserved: Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => false)),
});

const setModule = (matrix: Modules, row: number, col: number, value: boolean, reserved = true) => {
  if (row < 0 || col < 0 || row >= SIZE || col >= SIZE) {
    return;
  }

  matrix.value[row][col] = value;
  matrix.reserved[row][col] = reserved;
};

const addFinder = (matrix: Modules, row: number, col: number) => {
  for (let y = -1; y <= 7; y += 1) {
    for (let x = -1; x <= 7; x += 1) {
      const rr = row + y;
      const cc = col + x;
      const isDark =
        y >= 0 &&
        y <= 6 &&
        x >= 0 &&
        x <= 6 &&
        (y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4));

      setModule(matrix, rr, cc, isDark);
    }
  }
};

const addAlignment = (matrix: Modules, centerRow: number, centerCol: number) => {
  for (let y = -2; y <= 2; y += 1) {
    for (let x = -2; x <= 2; x += 1) {
      setModule(matrix, centerRow + y, centerCol + x, Math.max(Math.abs(x), Math.abs(y)) !== 1);
    }
  }
};

const addFunctionPatterns = (matrix: Modules) => {
  addFinder(matrix, 0, 0);
  addFinder(matrix, 0, SIZE - 7);
  addFinder(matrix, SIZE - 7, 0);

  for (let i = 8; i < SIZE - 8; i += 1) {
    const dark = i % 2 === 0;
    setModule(matrix, 6, i, dark);
    setModule(matrix, i, 6, dark);
  }

  for (const row of [6, 22, 38]) {
    for (const col of [6, 22, 38]) {
      if (matrix.reserved[row][col]) {
        continue;
      }

      addAlignment(matrix, row, col);
    }
  }

  setModule(matrix, SIZE - 8, 8, true);

  for (let i = 0; i < 15; i += 1) {
    const bit = ((FORMAT_LOW_MASK_0 >> i) & 1) === 1;

    if (i < 6) setModule(matrix, 8, i, bit);
    else if (i < 8) setModule(matrix, 8, i + 1, bit);
    else setModule(matrix, 8, SIZE - 15 + i, bit);

    if (i < 8) setModule(matrix, SIZE - i - 1, 8, bit);
    else if (i === 8) setModule(matrix, 7, 8, bit);
    else setModule(matrix, 14 - i, 8, bit);
  }
};

const toBits = (value: number, length: number) =>
  Array.from({ length }, (_, index) => ((value >> (length - index - 1)) & 1) === 1);

const encodeData = (text: string) => {
  const bytes = Array.from(new TextEncoder().encode(text));

  if (bytes.length > 154) {
    throw new Error("QR link is too long.");
  }

  const bits = [
    ...toBits(0b0100, 4),
    ...toBits(bytes.length, 8),
    ...bytes.flatMap((byte) => toBits(byte, 8)),
  ];
  const maxBits = DATA_CODEWORDS * 8;
  const terminatorLength = Math.min(4, maxBits - bits.length);

  bits.push(...Array.from({ length: terminatorLength }, () => false));

  while (bits.length % 8 !== 0) {
    bits.push(false);
  }

  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    data.push(bits.slice(i, i + 8).reduce((byte, bit) => (byte << 1) | (bit ? 1 : 0), 0));
  }

  for (let pad = 0xec; data.length < DATA_CODEWORDS; pad = pad === 0xec ? 0x11 : 0xec) {
    data.push(pad);
  }

  return data;
};

const multiply = (left: number, right: number) => {
  let result = 0;

  for (; right > 0; right >>>= 1) {
    if (right & 1) result ^= left;
    left = (left << 1) ^ (left & 0x80 ? 0x11d : 0);
  }

  return result;
};

const generatorPolynomial = () => {
  let result = [1];
  let root = 1;

  for (let i = 0; i < EC_CODEWORDS_PER_BLOCK; i += 1) {
    const next = Array.from({ length: result.length + 1 }, () => 0);

    result.forEach((coefficient, index) => {
      next[index] ^= multiply(coefficient, root);
      next[index + 1] ^= coefficient;
    });

    result = next;
    root = multiply(root, 2);
  }

  return result.slice(1);
};

const reedSolomonRemainder = (data: number[]) => {
  const generator = generatorPolynomial();
  const result = Array.from({ length: EC_CODEWORDS_PER_BLOCK }, () => 0);

  for (const byte of data) {
    const factor = byte ^ result.shift()!;
    result.push(0);

    generator.forEach((coefficient, index) => {
      result[index] ^= multiply(coefficient, factor);
    });
  }

  return result;
};

const createCodewords = (text: string) => {
  const data = encodeData(text);
  const blocks = Array.from({ length: BLOCKS }, (_, index) =>
    data.slice(index * 78, index * 78 + 78),
  );
  const errorBlocks = blocks.map(reedSolomonRemainder);
  const codewords = [];

  for (let i = 0; i < 78; i += 1) {
    for (const block of blocks) {
      codewords.push(block[i]);
    }
  }

  for (let i = 0; i < EC_CODEWORDS_PER_BLOCK; i += 1) {
    for (const block of errorBlocks) {
      codewords.push(block[i]);
    }
  }

  return codewords;
};

const addData = (matrix: Modules, text: string) => {
  const bits = createCodewords(text).flatMap((byte) => toBits(byte, 8));
  let bitIndex = 0;
  let upward = true;

  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1;

    for (let vertical = 0; vertical < SIZE; vertical += 1) {
      const row = upward ? SIZE - 1 - vertical : vertical;

      for (let col = right; col >= right - 1; col -= 1) {
        if (matrix.reserved[row][col]) {
          continue;
        }

        const bit = bitIndex < bits.length ? bits[bitIndex] : false;
        const masked = bit !== ((row + col) % 2 === 0);
        setModule(matrix, row, col, masked, false);
        bitIndex += 1;
      }
    }

    upward = !upward;
  }
};

const generateQrPath = (text: string) => {
  const matrix = createMatrix();
  const cells = [];

  addFunctionPatterns(matrix);
  addData(matrix, text);

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (matrix.value[row][col]) {
        cells.push(`M${col + 4} ${row + 4}h1v1h-1z`);
      }
    }
  }

  return cells.join("");
};

type QrCodeProps = {
  value: string;
};

export default function QrCode({ value }: QrCodeProps) {
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${SIZE + 8} ${SIZE + 8}`} role="img">
      <path d={generateQrPath(value)} fill="currentColor" />
    </svg>
  );
}
