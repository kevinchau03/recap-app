import type { Metadata } from "next";
import styles from "../mobile.module.css";

export const metadata: Metadata = {
  title: "Settings · DeMems",
  description: "Manage your DeMems preferences.",
};

export default function SettingsPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <p>Your account</p>
          <h1>Settings</h1>
        </div>
      </header>

      <section className={styles.profileCard}>
        <div className={styles.largeAvatar}>K</div>
        <div>
          <h2>Kevin</h2>
          <p>kevin@example.com</p>
        </div>
      </section>

      <section className={styles.settingsList} aria-label="Settings">
        <button type="button"><span>Profile</span><span aria-hidden="true">→</span></button>
        <button type="button"><span>Notifications</span><span aria-hidden="true">→</span></button>
        <button type="button"><span>Privacy</span><span aria-hidden="true">→</span></button>
        <button type="button"><span>Help &amp; support</span><span aria-hidden="true">→</span></button>
      </section>
    </>
  );
}
