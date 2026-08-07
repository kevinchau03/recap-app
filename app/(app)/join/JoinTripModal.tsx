"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import JoinTripFlow from "./JoinTripFlow";
import styles from "../app.module.css";

type JoinTripModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function JoinTripModal({ isOpen, onClose }: JoinTripModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby="join-trip-modal-title"
        aria-modal="true"
        className={styles.joinModal}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className={styles.joinModalHeader}>
          <div>
            <p>Shared invite</p>
            <h2 id="join-trip-modal-title">Join Trip</h2>
          </div>
          <button aria-label="Close join trip modal" onClick={onClose} type="button">
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <JoinTripFlow compact />
      </section>
    </div>
  );
}
