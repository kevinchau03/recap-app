import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import TripMemberAvatars, { type TripMemberAvatar } from "@/components/TripMemberAvatars";
import { createClient } from "@/utils/supabase/server";
import styles from "../app.module.css";

type Trip = {
  id: string;
  user_id: string;
  name: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_label: string | null;
  member_count: number | null;
  photo_count: number | null;
};

type TripCoverRecord = {
  trip_id: string;
  storage_path: string;
  is_cover: boolean | null;
  created_at: string;
};

type TripMemberRecord = {
  trip_id: string;
  user_id: string;
  role: string | null;
  joined_at: string | null;
};

type AppUser = {
  id: string;
  avatar_url: string | null;
  display_name: string | null;
  username: string | null;
};

type TripWithCover = Trip & {
  coverUrl: string | null;
  members: TripMemberAvatar[];
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

const getTripCoverLabel = (trip: Trip) => trip.cover_label || trip.location || "Trip";

const getTripCardArtStyle = (coverUrl: string | null): CSSProperties | undefined =>
  coverUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(26, 28, 30, 0.08), rgba(26, 28, 30, 0.48)), url("${coverUrl}")`,
      }
    : undefined;

const getTripsWithCovers = async (trips: Trip[], supabase: Awaited<ReturnType<typeof createClient>>) => {
  const tripIds = trips.map((trip) => trip.id);

  if (!tripIds.length) {
    return [] as TripWithCover[];
  }

  const { data: covers } = await supabase
    .from("trip_media")
    .select("trip_id, storage_path, is_cover, created_at")
    .in("trip_id", tripIds)
    .eq("media_type", "photo")
    .order("is_cover", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<TripCoverRecord[]>();
  const { data: tripMembers } = await supabase
    .from("trip_members")
    .select("trip_id, user_id, role, joined_at")
    .in("trip_id", tripIds)
    .order("joined_at", { ascending: true })
    .returns<TripMemberRecord[]>();

  const coverByTripId = new Map<string, TripCoverRecord>();

  for (const cover of covers ?? []) {
    if (!coverByTripId.has(cover.trip_id)) {
      coverByTripId.set(cover.trip_id, cover);
    }
  }

  const signedCoverEntries = await Promise.all(
    Array.from(coverByTripId.entries()).map(async ([tripId, cover]) => {
      const { data } = await supabase.storage.from("trip-media").createSignedUrl(cover.storage_path, 60 * 60);

      return [tripId, data?.signedUrl ?? null] as const;
    }),
  );
  const coverUrlByTripId = new Map(signedCoverEntries);
  const memberIds = Array.from(
    new Set([...trips.map((trip) => trip.user_id), ...(tripMembers ?? []).map((member) => member.user_id)]),
  );
  const { data: users } = memberIds.length
    ? await supabase
        .from("users")
        .select("id, avatar_url, display_name, username")
        .in("id", memberIds)
        .returns<AppUser[]>()
    : { data: [] as AppUser[] };
  const userById = new Map((users ?? []).map((user) => [user.id, user]));
  const membersByTripId = new Map<string, TripMemberAvatar[]>();

  for (const trip of trips) {
    const tripMemberIds = [trip.user_id, ...(tripMembers ?? [])
      .filter((member) => member.trip_id === trip.id)
      .map((member) => member.user_id)];
    const uniqueMemberIds = Array.from(new Set(tripMemberIds));

    membersByTripId.set(
      trip.id,
      uniqueMemberIds.map((memberId) => {
        const user = userById.get(memberId);
        const name = user?.display_name || user?.username || "Member";

        return {
          id: memberId,
          avatarUrl: user?.avatar_url ?? null,
          name,
        };
      }),
    );
  }

  return trips.map((trip) => ({
    ...trip,
    coverUrl: coverUrlByTripId.get(trip.id) ?? null,
    members: membersByTripId.get(trip.id) ?? [],
  }));
};

export default async function TripsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trips } = await supabase
    .from("trips")
    .select("id, user_id, name, location, start_date, end_date, cover_label, member_count, photo_count")
    .order("start_date", { ascending: false })
    .returns<Trip[]>();

  const tripsWithCovers = await getTripsWithCovers(trips ?? [], supabase);
  const personalTrips = tripsWithCovers.filter((trip) => trip.user_id === user?.id);
  const sharedTrips = tripsWithCovers.filter((trip) => trip.user_id !== user?.id);

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <p>Your memories</p>
          <h1>Trips</h1>
        </div>
        <Link className={styles.smallAction} href="/trips/new">New trip</Link>
      </header>

      <section className={styles.tripSections} aria-label="All trips">
        {personalTrips.length ? (
          <section className={styles.tripSection} aria-labelledby="personal-trips-title">
            <div className={styles.sectionHeading}>
              <h2 id="personal-trips-title">Personal Trips</h2>
            </div>
            <div className={styles.fullTripList}>
              {personalTrips.map((trip) => (
                <Link className={styles.tripCard} href={`/trips/${trip.id}`} key={trip.id}>
                  <div
                    className={`${styles.tripCardArt} ${trip.coverUrl ? styles.tripCardArtWithCover : ""}`}
                    style={getTripCardArtStyle(trip.coverUrl)}
                  >
                    {trip.coverUrl ? <span>{getTripCoverLabel(trip)}</span> : getTripCoverLabel(trip)}
                  </div>
                  <div className={styles.tripCardCopy}>
                    <p>{formatDateRange(trip.start_date, trip.end_date)}</p>
                    <h2>{trip.name}</h2>
                    <span>
                      {trip.member_count ?? 1} friends - {trip.photo_count ?? 0} photos
                    </span>
                    <TripMemberAvatars members={trip.members} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {sharedTrips.length ? (
          <section className={styles.tripSection} aria-labelledby="shared-trips-title">
            <div className={styles.sectionHeading}>
              <h2 id="shared-trips-title">Shared With Me</h2>
            </div>
            <div className={styles.fullTripList}>
              {sharedTrips.map((trip) => (
                <Link className={styles.tripCard} href={`/trips/${trip.id}`} key={trip.id}>
                  <div
                    className={`${styles.tripCardArt} ${trip.coverUrl ? styles.tripCardArtWithCover : ""}`}
                    style={getTripCardArtStyle(trip.coverUrl)}
                  >
                    {trip.coverUrl ? <span>{getTripCoverLabel(trip)}</span> : getTripCoverLabel(trip)}
                  </div>
                  <div className={styles.tripCardCopy}>
                    <p>{formatDateRange(trip.start_date, trip.end_date)}</p>
                    <h2>{trip.name}</h2>
                    <span>
                      {trip.member_count ?? 1} friends - {trip.photo_count ?? 0} photos
                    </span>
                    <TripMemberAvatars members={trip.members} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

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
