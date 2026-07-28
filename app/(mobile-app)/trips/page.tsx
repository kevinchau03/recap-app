import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import styles from "../mobile.module.css";

type Trip = {
  id: string;
  name: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_label: string | null;
  member_count: number | null;
  photo_count: number | null;
};

export const metadata: Metadata = {
  title: "Trips - DeMems",
  description: "Browse all your shared trips.",
};

const formatDateRange = (startDate: string | null, endDate: string | null) => {
  if (!startDate && !endDate) {
    return "Dates TBD";
  }

  const formatter = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const start = startDate ? formatter.format(new Date(`${startDate}T00:00:00`)) : null;
  const end = endDate ? formatter.format(new Date(`${endDate}T00:00:00`)) : null;

  return [start, end].filter(Boolean).join(" - ");
};

export default async function TripsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trips } = await supabase
    .from("trips")
    .select("id, name, location, start_date, end_date, cover_label, member_count, photo_count")
    .eq("user_id", user?.id)
    .order("start_date", { ascending: false })
    .returns<Trip[]>();

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
        {(trips ?? []).map((trip) => (
          <Link className={styles.tripCard} href={`/trips/${trip.id}`} key={trip.id}>
            <div className={styles.tripCardArt}>{trip.cover_label || trip.location || "Trip"}</div>
            <div className={styles.tripCardCopy}>
              <p>{formatDateRange(trip.start_date, trip.end_date)}</p>
              <h2>{trip.name}</h2>
              <span>
                {trip.member_count ?? 1} friends - {trip.photo_count ?? 0} photos
              </span>
            </div>
          </Link>
        ))}

        {trips?.length ? null : (
          <article className={styles.emptyState}>
            <h2>No trips yet</h2>
            <p>Create your first trip to start collecting memories.</p>
            <Link href="/trips/new">Create trip</Link>
          </article>
        )}
      </section>
    </>
  );
}
