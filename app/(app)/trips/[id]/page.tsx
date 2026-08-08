/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import TripMemberAvatars, { type TripMemberAvatar } from "@/components/TripMemberAvatars";
import { createClient } from "@/utils/supabase/server";
import TripInvitePanel from "./TripInvitePanel";
import TripPhotoUpload from "./TripPhotoUpload";
import styles from "../../app.module.css";

type TripPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Trip = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_label: string | null;
  member_count: number | null;
  photo_count: number | null;
};

type TripMediaRecord = {
  id: string;
  uploaded_by: string | null;
  is_cover: boolean | null;
  storage_path: string;
  original_filename: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
  captured_at: string | null;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  metadata_status: string | null;
};

type TripMedia = TripMediaRecord & {
  signedUrl: string;
  isMissingDetails: boolean;
  sharedBy: string;
};

type AppUser = {
  id: string;
  avatar_url: string | null;
  display_name: string | null;
  username: string | null;
};

type TripMemberRecord = {
  trip_id: string;
  user_id: string;
  role: string | null;
  joined_at: string | null;
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

const getHeroStyle = (coverUrl: string | null): CSSProperties | undefined =>
  coverUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(26, 28, 30, 0.08), rgba(26, 28, 30, 0.72)), url("${coverUrl}")`,
      }
    : undefined;

const getTrip = async (id: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data } = await supabase
    .from("trips")
    .select("id, user_id, name, description, location, start_date, end_date, cover_label, member_count, photo_count")
    .eq("id", id)
    .maybeSingle<Trip>();

  return data;
};

const getTripMedia = async (tripId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: media } = await supabase
    .from("trip_media")
    .select("id, uploaded_by, is_cover, storage_path, original_filename, width, height, created_at, captured_at, latitude, longitude, location_name, metadata_status")
    .eq("trip_id", tripId)
    .eq("media_type", "photo")
    .order("captured_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .returns<TripMediaRecord[]>();

  if (!media?.length) {
    return [];
  }

  const uploaderIds = Array.from(
    new Set(media.map((item) => item.uploaded_by).filter((id): id is string => Boolean(id))),
  );
  const { data: uploaders } = uploaderIds.length
    ? await supabase
        .from("users")
        .select("id, avatar_url, display_name, username")
        .in("id", uploaderIds)
        .returns<AppUser[]>()
    : { data: [] as AppUser[] };
  const uploaderNames = new Map(
    (uploaders ?? []).map((uploader) => [
      uploader.id,
      uploader.display_name || uploader.username || "Member",
    ]),
  );

  const mediaWithUrls = await Promise.all(
    media.map(async (item) => {
      const { data } = await supabase.storage
        .from("trip-media")
        .createSignedUrl(item.storage_path, 60 * 60);

      return data?.signedUrl
        ? {
            ...item,
            signedUrl: data.signedUrl,
            sharedBy:
              item.uploaded_by === user?.id
                ? "you"
                : uploaderNames.get(item.uploaded_by ?? "") ?? "a trip member",
            isMissingDetails:
              !item.captured_at ||
              (!item.location_name && (item.latitude === null || item.longitude === null)) ||
              item.metadata_status === "missing" ||
              item.metadata_status === "stripped" ||
              item.metadata_status === "error",
          }
        : null;
    }),
  );

  return mediaWithUrls.filter((item): item is TripMedia => Boolean(item));
};

const getTripMembers = async (trip: Trip) => {
  const supabase = await createClient();
  const { data: tripMembers } = await supabase
    .from("trip_members")
    .select("trip_id, user_id, role, joined_at")
    .eq("trip_id", trip.id)
    .order("joined_at", { ascending: true })
    .returns<TripMemberRecord[]>();
  const memberIds = Array.from(new Set([trip.user_id, ...(tripMembers ?? []).map((member) => member.user_id)]));

  if (!memberIds.length) {
    return [] as TripMemberAvatar[];
  }

  const { data: users } = await supabase
    .from("users")
    .select("id, avatar_url, display_name, username")
    .in("id", memberIds)
    .returns<AppUser[]>();
  const userById = new Map((users ?? []).map((user) => [user.id, user]));

  return memberIds.map((memberId) => {
    const user = userById.get(memberId);
    const name = user?.display_name || user?.username || "Member";

    return {
      id: memberId,
      avatarUrl: user?.avatar_url ?? null,
      name,
    };
  });
};

export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  const { id } = await params;
  const trip = await getTrip(id);

  if (!trip) {
    return {
      title: "Trip not found - DeMems",
    };
  }

  return {
    title: `${trip.name} - DeMems`,
    description: trip.description || `View memories for ${trip.name}.`,
  };
}

export default async function TripPage({ params }: TripPageProps) {
  const { id } = await params;
  const trip = await getTrip(id);

  if (!trip) {
    notFound();
  }

  const media = await getTripMedia(id);
  const members = await getTripMembers(trip);
  const coverPhoto = media.find((photo) => photo.is_cover) ?? media[0] ?? null;

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <p>{trip.location || "Trip details"}</p>
          <h1>{trip.name}</h1>
        </div>
        <Link className={styles.smallAction} href="/trips">Back</Link>
      </header>

      <section
        className={`${styles.tripDetailHero} ${coverPhoto ? styles.tripDetailHeroWithCover : ""}`}
        aria-label="Trip summary"
        style={getHeroStyle(coverPhoto?.signedUrl ?? null)}
      >
        <p>{formatDateRange(trip.start_date, trip.end_date)}</p>
        <h2>{trip.cover_label || trip.location || "Memories"}</h2>
        <span>
          {trip.member_count ?? 1} friends - {trip.photo_count ?? 0} photos
        </span>
        <TripMemberAvatars members={members} />
      </section>

      <section className={styles.tripActionGrid} aria-label="Trip actions">
        <TripPhotoUpload tripId={trip.id} />
      </section>

      <TripInvitePanel tripId={trip.id} />

      {media.length ? (
        <section className={styles.photoGrid} aria-label="Trip photos">
          {media.map((photo) => (
            <Link
              className={styles.photoTileLink}
              href={`/trips/${trip.id}/photos/${photo.id}`}
              key={photo.id}
            >
              <figure className={styles.photoTile}>
                <img
                  alt={photo.original_filename || "Trip photo"}
                  height={photo.height ?? 400}
                  src={photo.signedUrl}
                  width={photo.width ?? 400}
                />
                <figcaption className={styles.sharedByBadge}>Shared by {photo.sharedBy}</figcaption>
                {photo.isMissingDetails ? (
                  <span className={styles.missingDetailsBadge}>Missing details</span>
                ) : null}
              </figure>
            </Link>
          ))}
        </section>
      ) : (
        <section className={styles.emptyState}>
          <h2>No photos yet</h2>
          <p>Add a photo from your library or take one with your camera.</p>
        </section>
      )}

    </>
  );
}
