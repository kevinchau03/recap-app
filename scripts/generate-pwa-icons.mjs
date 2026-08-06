import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const beeSource = path.join(root, "public", "figma", "login-bee.png");

const icons = [
  ["public/icon-192x192.png", 192],
  ["public/icon-512x512.png", 512],
  ["public/icon-maskable-192x192.png", 192, true],
  ["public/icon-maskable-512x512.png", 512, true],
  ["app/apple-icon.png", 180],
];

async function createIcon(filePath, size, maskable = false) {
  const beeSize = Math.round(size * (maskable ? 0.62 : 0.72));
  const resizedBee = await sharp(beeSource)
    .trim({ threshold: 10 })
    .resize(beeSize, beeSize, { fit: "contain" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const beePixels = resizedBee.data;
  const { width, height, channels } = resizedBee.info;
  const clearAlpha = (x, y) => {
    beePixels[(y * width + x) * channels + 3] = 0;
  };

  for (let x = 0; x < width; x += 1) {
    for (let edge = 0; edge < 10; edge += 1) {
      clearAlpha(x, edge);
      clearAlpha(x, height - 1 - edge);
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let edge = 0; edge < 10; edge += 1) {
      clearAlpha(edge, y);
      clearAlpha(width - 1 - edge, y);
    }
  }

  for (let i = 3; i < beePixels.length; i += 4) {
    if (beePixels[i] < 96) {
      beePixels[i] = 0;
    }
  }

  const bee = await sharp(beePixels, { raw: resizedBee.info }).png().toBuffer();

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#fff8c7"/>
      <circle cx="${size * 0.74}" cy="${size * 0.22}" r="${size * 0.23}" fill="#ffffff" fill-opacity="0.76"/>
      <circle cx="${size * 0.2}" cy="${size * 0.8}" r="${size * 0.28}" fill="#ffe54d" fill-opacity="0.45"/>
      <rect x="${size * 0.24}" y="${size * 0.09}" width="${size * 0.06}" height="${size * 0.25}" fill="#1a1c1e"/>
      <rect x="${size * 0.12}" y="${size * 0.22}" width="${size * 0.22}" height="${size * 0.06}" fill="#1a1c1e"/>
      <polygon points="${size * 0.22},${size * 0.09} ${size * 0.28},${size * 0.09} ${size * 0.16},${size * 0.22} ${size * 0.1},${size * 0.22}" fill="#1a1c1e"/>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .composite([
      {
        input: bee,
        left: Math.round(size * (maskable ? 0.19 : 0.14)),
        top: Math.round(size * (maskable ? 0.23 : 0.2)),
      },
    ])
    .png()
    .toFile(path.join(root, filePath));
}

await Promise.all(icons.map(([filePath, size, maskable]) => createIcon(filePath, size, maskable)));
