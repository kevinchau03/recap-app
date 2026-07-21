import type { Metadata } from "next";
import Link from "next/link";
import styles from "../mobile.module.css";
import Navigation from "@/components/Navigation";

const trips = [
  { title: "Muskoka Weekend", dates: "July 12-15, 2026", meta: "7 friends · 186 photos", accent: "Lake" },
  { title: "Montreal Food Crawl", dates: "May 24-26, 2026", meta: "4 friends · 92 photos", accent: "City" },
  { title: "Blue Mountain", dates: "February 7-9, 2026", meta: "6 friends · 143 photos", accent: "Snow" },
];

export const metadata: Metadata = {
  title: "Trips · DeMems",
  description: "Browse all your shared trips.",
};

export default function TripsPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <p>Your memories</p>
          <h1>Trips</h1>
        </div>
        <Link className={styles.smallAction} href="/trips/new">New trip</Link>
      </header>

      <section className={styles.fullTripList} aria-label="All trips">
        {trips.map((trip) => (
          <article className={styles.tripCard} key={trip.title}>
            <div className={styles.tripCardArt}>{trip.accent}</div>
            <div className={styles.tripCardCopy}>
              <p>{trip.dates}</p>
              <h2>{trip.title}</h2>
              <span>{trip.meta}</span>
            </div>
          </article>
        ))}
      </section>
      <Navigation />
    </>
  );
}
