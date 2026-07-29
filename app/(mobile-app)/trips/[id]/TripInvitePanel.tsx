"use client";

import { Copy, Link2, QrCode as QrCodeIcon } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { getOrCreateTripInvite } from "./actions";
import QrCode from "./QrCode";
import styles from "../../mobile.module.css";

type TripInvitePanelProps = {
  tripId: string;
};

export default function TripInvitePanel({ tripId }: TripInvitePanelProps) {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [showQrCode, setShowQrCode] = useState(false);
  const [isPending, startTransition] = useTransition();

  const inviteLink = useMemo(() => {
    if (!token || typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/join-trip?token=${encodeURIComponent(token)}`;
  }, [token]);

  useEffect(() => {
    startTransition(async () => {
      const result = await getOrCreateTripInvite(tripId);

      if ("error" in result) {
        setMessage(result.error);
        return;
      }

      setToken(result.token);
    });
  }, [tripId]);

  async function copyInviteLink() {
    if (!inviteLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);
      setMessage("Invite link copied.");
    } catch {
      setMessage("Copy failed. Press and hold the link below.");
    }
  }

  return (
    <section className={styles.invitePanel} aria-label="Invite friends">
      <div className={styles.invitePanelHeader}>
        <div>
          <p>Invite friends</p>
          <h2>Scan or share</h2>
        </div>
        <QrCodeIcon aria-hidden="true" size={22} />
      </div>

      <button className={styles.shareLinkButton} disabled={!inviteLink} onClick={copyInviteLink} type="button">
        <Copy aria-hidden="true" size={18} />
        Share Link
      </button>

      <button
        className={styles.showQrButton}
        disabled={!inviteLink}
        onClick={() => setShowQrCode((current) => !current)}
        type="button"
      >
        <QrCodeIcon aria-hidden="true" size={18} />
        {showQrCode ? "Hide QR Code" : "Show QR Code"}
      </button>

      {showQrCode ? (
        <div className={styles.qrFrame}>
          {inviteLink ? <QrCode value={inviteLink} /> : <span>{isPending ? "Loading..." : "No invite"}</span>}
        </div>
      ) : null}

      {inviteLink ? (
        <p className={styles.inviteLink}>
          <Link2 aria-hidden="true" size={14} />
          <span>{inviteLink}</span>
        </p>
      ) : null}

      {message ? <p className={styles.inviteMessage}>{message}</p> : null}
    </section>
  );
}
