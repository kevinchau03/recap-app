import styles from "./mobile.module.css";

export default function Loading() {
  return (
    <main className={styles.mobileRoute}>
      <section className={styles.loadingShell} aria-label="Loading DeMems">
        <div className={styles.loadingLogo} aria-hidden="true">
          <span className={styles.loadingMark}>D</span>
          <span className={styles.loadingText}>DeMems</span>
        </div>
        <div className={styles.loadingDots} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p>Loading your memories</p>
      </section>
    </main>
  );
}
