"use client";

import { Camera, Keyboard, Link2, ScanQrCode } from "lucide-react";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { joinTripFromInvite } from "./actions";
import styles from "../app.module.css";

type BarcodeDetectorInstance = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
};

type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

type JoinTripFlowProps = {
  compact?: boolean;
};

export default function JoinTripFlow({ compact = false }: JoinTripFlowProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanFrameRef = useRef<number | null>(null);
  const [inviteInput, setInviteInput] = useState("");
  const [message, setMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  function stopCamera() {
    if (scanFrameRef.current) {
      cancelAnimationFrame(scanFrameRef.current);
      scanFrameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsScanning(false);
  }

  function joinFromValue(value: string) {
    const nextValue = value.trim();

    if (!nextValue || isPending) {
      return;
    }

    setMessage("Joining trip...");
    stopCamera();
    startTransition(async () => {
      const result = await joinTripFromInvite(nextValue);

      if (result?.error) {
        setMessage(result.error);
      }
    });
  }

  async function startCamera() {
    setMessage("");

    if (!window.BarcodeDetector) {
      setMessage("QR scanning is not available in this browser. Enter the invite link instead.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage("Camera access is not available. Enter the invite link instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "environment",
        },
      });
      const video = videoRef.current;

      streamRef.current = stream;

      if (!video) {
        stopCamera();
        return;
      }

      video.srcObject = stream;
      await video.play();
      setIsScanning(true);

      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

      const scan = async () => {
        if (!videoRef.current || !streamRef.current) {
          return;
        }

        try {
          const [barcode] = await detector.detect(videoRef.current);

          if (barcode?.rawValue) {
            joinFromValue(barcode.rawValue);
            return;
          }
        } catch {
          setMessage("The camera could not read the QR code.");
        }

        scanFrameRef.current = requestAnimationFrame(scan);
      };

      scanFrameRef.current = requestAnimationFrame(scan);
    } catch {
      setMessage("Camera permission was not granted. Enter the invite link instead.");
      stopCamera();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    joinFromValue(inviteInput);
  }

  return (
    <>
      <section
        className={`${styles.joinScanner} ${compact ? styles.joinScannerCompact : ""}`}
        aria-label="Scan invite QR code"
      >
        <div className={styles.joinScannerHeader}>
          <div>
            <p>Join trip</p>
            <h2>Scan QR code</h2>
          </div>
          <ScanQrCode aria-hidden="true" size={24} />
        </div>

        <div className={styles.cameraPreview}>
          <video aria-label="QR code scanner" muted playsInline ref={videoRef} />
          {isScanning ? <span className={styles.scanLine} aria-hidden="true" /> : null}
          {!isScanning ? <Camera aria-hidden="true" size={42} /> : null}
        </div>

        <div className={styles.joinActions}>
          <button disabled={isPending || isScanning} onClick={startCamera} type="button">
            <Camera aria-hidden="true" size={18} />
            Open camera
          </button>
          <button disabled={!isScanning} onClick={stopCamera} type="button">
            Stop
          </button>
        </div>
      </section>

      <form className={`${styles.joinForm} ${compact ? styles.joinFormCompact : ""}`} onSubmit={handleSubmit}>
        <label htmlFor="inviteLink">
          <span>
            <Keyboard aria-hidden="true" size={17} />
            Invite link
          </span>
          <input
            autoComplete="off"
            id="inviteLink"
            name="inviteLink"
            onChange={(event) => setInviteInput(event.currentTarget.value)}
            placeholder="https://..."
            type="text"
            value={inviteInput}
          />
        </label>

        <button disabled={isPending || !inviteInput.trim()} type="submit">
          <Link2 aria-hidden="true" size={18} />
          Join trip
        </button>
      </form>

      {message ? <p className={styles.joinMessage}>{message}</p> : null}
    </>
  );
}
