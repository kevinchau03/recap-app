import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import styles from "./page.module.css";

const recentTrips = [
  {
    title: "Muskoka Weekend",
    meta: "7 friends - 186 photos",
    accent: "Lake",
  },
  {
    title: "Montreal Food Crawl",
    meta: "4 friends - 92 photos",
    accent: "City",
  },
];

export const metadata: Metadata = {
  title: "DeMems Trips",
  description: "Your DeMems mobile trips home.",
};

export default function TripsHome() {
  return (
    <main className={styles.mobileRoute}>
      <section className={styles.mobileShell} aria-label="DeMems mobile app">
        <header className={styles.mobileHeader}>
          <div>
            <p>Welcome back</p>
            <h1>Home</h1>
          </div>
          <button type="button" aria-label="Open profile">
            K
          </button>
        </header>

        <section className={styles.mobileHero} aria-label="Current trip">
          <p>Current trip</p>
          <h2>Muskoka Weekend</h2>
          <span>186 memories from July 12-15</span>
        </section>

        <section className={styles.quickActions} aria-label="Quick actions">
          <button type="button">Create trip</button>
          <button type="button">Join trip</button>
        </section>

        <section className={styles.tripList} aria-label="Recent trips">
          <div className={styles.mobileSectionHeading}>
            <h2>Recent trips</h2>
            <a href="#">See all</a>
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

        <Navigation />
      </section>
    </main>
  );
}
