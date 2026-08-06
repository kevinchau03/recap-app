/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  storage_path: string;
  original_filename: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

type TripMedia = TripMediaRecord & {
  signedUrl: string;
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
    .select("id, name, description, location, start_date, end_date, cover_label, member_count, photo_count")
    .eq("id", id)
    .maybeSingle<Trip>();

  return data;
};

const getTripMedia = async (tripId: string) => {
  const supabase = await createClient();

  const { data: media } = await supabase
    .from("trip_media")
    .select("id, storage_path, original_filename, width, height, created_at")
    .eq("trip_id", tripId)
    .eq("media_type", "photo")
    .order("created_at", { ascending: false })
    .returns<TripMediaRecord[]>();

  if (!media?.length) {
    return [];
  }

  const mediaWithUrls = await Promise.all(
    media.map(async (item) => {
      const { data } = await supabase.storage
        .from("trip-media")
        .createSignedUrl(item.storage_path, 60 * 60);

      return data?.signedUrl
        ? {
            ...item,
            signedUrl: data.signedUrl,
          }
        : null;
    }),
  );

  return mediaWithUrls.filter((item): item is TripMedia => Boolean(item));
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

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <p>{trip.location || "Trip details"}</p>
          <h1>{trip.name}</h1>
        </div>
        <Link className={styles.smallAction} href="/trips">Back</Link>
      </header>

      <section className={styles.tripDetailHero} aria-label="Trip summary">
        <p>{formatDateRange(trip.start_date, trip.end_date)}</p>
        <h2>{trip.cover_label || trip.location || "Memories"}</h2>
        <span>
          {trip.member_count ?? 1} friends - {trip.photo_count ?? 0} photos
        </span>
      </section>

      <section className={styles.tripActionGrid} aria-label="Trip actions">
        <TripPhotoUpload tripId={trip.id} />
      </section>

      <TripInvitePanel tripId={trip.id} />

      {media.length ? (
        <section className={styles.photoGrid} aria-label="Trip photos">
          {media.map((photo) => (
            <figure className={styles.photoTile} key={photo.id}>
              <img
                alt={photo.original_filename || "Trip photo"}
                height={photo.height ?? 400}
                src={photo.signedUrl}
                width={photo.width ?? 400}
              />
            </figure>
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
