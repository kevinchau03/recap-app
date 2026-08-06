import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import styles from "../app.module.css";

type AppUser = {
  display_name: string | null;
  username: string | null;
};

type Trip = {
  id: string;
  name: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  member_count: number | null;
  photo_count: number | null;
  cover_label: string | null;
};

export const metadata: Metadata = {
  title: "Home - DeMems",
  description: "Your DeMems home.",
};

const formatDateRange = (startDate: string | null, endDate: string | null) => {
  if (!startDate && !endDate) {
    return "dates TBD";
  }

  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  });

  const start = startDate ? formatter.format(new Date(`${startDate}T00:00:00`)) : null;
  const end = endDate ? formatter.format(new Date(`${endDate}T00:00:00`)) : null;

  return [start, end].filter(Boolean).join(" - ");
};

const getInitial = (name: string) => name.trim().charAt(0).toUpperCase() || "D";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const [{ data: appUser }, { data: trips }] = authUser
    ? await Promise.all([
        supabase
          .from("users")
          .select("display_name, username")
          .eq("id", authUser.id)
          .maybeSingle<AppUser>(),
        supabase
          .from("trips")
          .select("id, name, location, start_date, end_date, member_count, photo_count, cover_label")
          .eq("user_id", authUser.id)
          .order("start_date", { ascending: false })
          .returns<Trip[]>(),
      ])
    : [{ data: null }, { data: [] as Trip[] }];

  const userName =
    appUser?.display_name || appUser?.username || authUser?.email?.split("@")[0] || "Guest";
  const recentTrips = trips ?? [];
  const currentTrip = recentTrips[0];

  return (
    <>
      <header className={styles.appHeader}>
        <div>
          <p>Welcome back</p>
          <h1>{userName}</h1>
        </div>
        <Link className={styles.avatarButton} href="/settings" aria-label="Open settings">
          {getInitial(userName)}
        </Link>
      </header>

      <section className={styles.appHero} aria-label="Current trip">
        <p>{currentTrip ? "Current trip" : "No trips yet"}</p>
        <h2>{currentTrip?.name ?? "Create your first trip"}</h2>
        <span>
          {currentTrip
            ? `${currentTrip.photo_count ?? 0} memories from ${formatDateRange(
                currentTrip.start_date,
                currentTrip.end_date,
              )}`
            : "Start a shared album for your next memory."}
        </span>
      </section>

      <section className={styles.quickActions} aria-label="Quick actions">
        <Link href="/trips/new">Create trip</Link>
        <button type="button">Join trip</button>
      </section>

      <section className={styles.tripList} aria-label="Recent trips">
        <div className={styles.sectionHeading}>
          <h2>Recent trips</h2>
          <Link href="/trips">See all</Link>
        </div>

        {recentTrips.map((trip) => (
          <article className={styles.tripRow} key={trip.id}>
            <div className={styles.tripThumbnail}>{trip.cover_label || trip.location || "Trip"}</div>
            <div>
              <h3>{trip.name}</h3>
              <p>
                {trip.member_count ?? 1} friends - {trip.photo_count ?? 0} photos
              </p>
            </div>
          </article>
        ))}

        {recentTrips.length === 0 ? (
          <article className={styles.tripRow}>
            <div className={styles.tripThumbnail}>New</div>
            <div>
              <h3>No trips found</h3>
              <p>Create a trip to see it here.</p>
            </div>
          </article>
        ) : null}
      </section>
    </>
  );
}
