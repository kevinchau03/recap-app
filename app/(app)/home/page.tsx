/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import TripMemberAvatars, { type TripMemberAvatar } from "@/components/TripMemberAvatars";
import { createClient } from "@/utils/supabase/server";
import JoinTripButton from "./JoinTripButton";
import styles from "../app.module.css";

type AppUser = {
  id: string;
  avatar_url: string | null;
  display_name: string | null;
  username: string | null;
};

type Trip = {
  id: string;
  user_id: string;
  name: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  member_count: number | null;
  photo_count: number | null;
  cover_label: string | null;
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

type TripWithCover = Trip & {
  coverUrl: string | null;
  members: TripMemberAvatar[];
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

const getTripCoverLabel = (trip: Trip) => trip.cover_label || trip.location || "Trip";

const getHeroStyle = (coverUrl: string | null): CSSProperties | undefined =>
  coverUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(26, 28, 30, 0.08), rgba(26, 28, 30, 0.72)), url("${coverUrl}")`,
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

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const [{ data: appUser }, { data: trips }] = authUser
    ? await Promise.all([
        supabase
          .from("users")
          .select("avatar_url, display_name, username")
          .eq("id", authUser.id)
          .maybeSingle<AppUser>(),
        supabase
          .from("trips")
          .select("id, user_id, name, location, start_date, end_date, member_count, photo_count, cover_label")
          .order("start_date", { ascending: false })
          .returns<Trip[]>(),
      ])
    : [{ data: null }, { data: [] as Trip[] }];

  const userName =
    appUser?.display_name || appUser?.username || authUser?.email?.split("@")[0] || "Guest";
  const avatarUrl =
    appUser?.avatar_url ||
    (typeof authUser?.user_metadata.avatar_url === "string" ? authUser.user_metadata.avatar_url : "");
  const recentTrips = await getTripsWithCovers(trips ?? [], supabase);
  const personalTrips = recentTrips.filter((trip) => trip.user_id === authUser?.id);
  const sharedTrips = recentTrips.filter((trip) => trip.user_id !== authUser?.id);
  const currentTrip = recentTrips[0];

  return (
    <>
      <header className={styles.appHeader}>
        <div>
          <p>Welcome back</p>
          <h1>{userName}</h1>
        </div>
        <Link className={styles.avatarButton} href="/settings" aria-label="Open settings">
          {avatarUrl ? (
            <Image
              className={styles.avatarButtonImage}
              src={avatarUrl}
              alt=""
              width={46}
              height={46}
              unoptimized
            />
          ) : (
            getInitial(userName)
          )}
        </Link>
      </header>

      <section
        className={`${styles.appHero} ${currentTrip?.coverUrl ? styles.appHeroWithCover : ""}`}
        aria-label="Current trip"
        style={getHeroStyle(currentTrip?.coverUrl ?? null)}
      >
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
        <JoinTripButton />
      </section>

      <section className={styles.tripList} aria-label="Recent trips">
        <div className={styles.sectionHeading}>
          <h2>Recent trips</h2>
          <Link href="/trips">See all</Link>
        </div>

        {personalTrips.length ? (
          <div className={styles.tripGroup}>
            <h3>Personal Trips</h3>
            {personalTrips.map((trip) => (
              <Link className={styles.tripRow} href={`/trips/${trip.id}`} key={trip.id}>
                <div className={`${styles.tripThumbnail} ${trip.coverUrl ? styles.tripThumbnailWithCover : ""}`}>
                  {trip.coverUrl ? (
                    <img alt="" src={trip.coverUrl} />
                  ) : (
                    getTripCoverLabel(trip)
                  )}
                </div>
                <div>
                  <h4>{trip.name}</h4>
                  <p>
                    {trip.member_count ?? 1} friends - {trip.photo_count ?? 0} photos
                  </p>
                  <TripMemberAvatars members={trip.members} />
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        {sharedTrips.length ? (
          <div className={styles.tripGroup}>
            <h3>Shared With Me</h3>
            {sharedTrips.map((trip) => (
              <Link className={styles.tripRow} href={`/trips/${trip.id}`} key={trip.id}>
                <div className={`${styles.tripThumbnail} ${trip.coverUrl ? styles.tripThumbnailWithCover : ""}`}>
                  {trip.coverUrl ? (
                    <img alt="" src={trip.coverUrl} />
                  ) : (
                    getTripCoverLabel(trip)
                  )}
                </div>
                <div>
                  <h4>{trip.name}</h4>
                  <p>
                    {trip.member_count ?? 1} friends - {trip.photo_count ?? 0} photos
                  </p>
                  <TripMemberAvatars members={trip.members} />
                </div>
              </Link>
            ))}
          </div>
        ) : null}

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
