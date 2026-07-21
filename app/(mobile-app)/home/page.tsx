import type { Metadata } from "next";
import Link from "next/link";
import styles from "../mobile.module.css";

const recentTrips = [
  { title: "Muskoka Weekend", meta: "7 friends · 186 photos", accent: "Lake" },
  { title: "Montreal Food Crawl", meta: "4 friends · 92 photos", accent: "City" },
];

export const metadata: Metadata = {
  title: "Home · DeMems",
  description: "Your DeMems home.",
};

export default function HomePage() {
  return (
    <>
      <header className={styles.mobileHeader}>
        <div>
          <p>Welcome back</p>
          <h1>Home</h1>
        </div>
        <Link className={styles.avatarButton} href="/settings" aria-label="Open settings">
          K
        </Link>
      </header>

      <section className={styles.mobileHero} aria-label="Current trip">
        <p>Current trip</p>
        <h2>Muskoka Weekend</h2>
        <span>186 memories from July 12–15</span>
      </section>

      <section className={styles.quickActions} aria-label="Quick actions">
        <Link href="/trips/new">Create trip</Link>
        <button type="button">Join trip</button>
      </section>

      <section className={styles.tripList} aria-label="Recent trips">
        <div className={styles.mobileSectionHeading}>
          <h2>Recent trips</h2>
          <Link href="/trips">See all</Link>
        </div>

        {recentTrips.map((trip) => (
          <article className={styles.tripRow} key={trip.title}>
            <div className={styles.tripThumbnail}>{trip.accent}</div>
            <div>
              <h3>{trip.title}</h3>
              <p>{trip.meta}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
