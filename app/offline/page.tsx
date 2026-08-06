import Link from "next/link";
import Image from "next/image";
import styles from "../(app)/app.module.css";

export default function OfflinePage() {
  return (
    <main className={styles.appRoute}>
      <section className={styles.offlineShell} aria-labelledby="offline-title">
        <Image
          className={styles.offlineIcon}
          src="/icon-192x192.png"
          alt=""
          width="96"
          height="96"
          unoptimized
        />

        <div className={styles.offlineCopy}>
          <p>Offline</p>
          <h1 id="offline-title">You need a connection</h1>
          <span>
            4 Da Mems needs the internet for trips, invites, photos, and account
            changes.
          </span>
        </div>

        <Link href="/" className={styles.offlineAction}>
          Try again
        </Link>
      </section>
    </main>
  );
}
