/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { updateTripPhotoDetails } from "../../actions";
import styles from "../../../../app.module.css";

type PhotoPageProps = {
  params: Promise<{
    id: string;
    photoId: string;
  }>;
};

type Trip = {
  id: string;
  name: string;
  location: string | null;
};

type TripMediaRecord = {
  id: string;
  trip_id: string;
  storage_path: string;
  original_filename: string | null;
  width: number | null;
  height: number | null;
  captured_at: string | null;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  timezone: string | null;
  caption: string | null;
  is_cover: boolean | null;
  metadata_status: string | null;
};

type TripPhoto = TripMediaRecord & {
  signedUrl: string;
};

const getDatetimeLocalValue = (value: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
};

async function getTripPhoto(tripId: string, photoId: string) {
  const supabase = await createClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("id, name, location")
    .eq("id", tripId)
    .maybeSingle<Trip>();

  if (!trip) {
    return null;
  }

  const { data: photo } = await supabase
    .from("trip_media")
    .select("id, trip_id, storage_path, original_filename, width, height, captured_at, latitude, longitude, location_name, timezone, caption, is_cover, metadata_status")
    .eq("id", photoId)
    .eq("trip_id", tripId)
    .eq("media_type", "photo")
    .maybeSingle<TripMediaRecord>();

  if (!photo) {
    return null;
  }

  const { data } = await supabase.storage
    .from("trip-media")
    .createSignedUrl(photo.storage_path, 60 * 60);

  if (!data?.signedUrl) {
    return null;
  }

  return {
    trip,
    photo: {
      ...photo,
      signedUrl: data.signedUrl,
    } satisfies TripPhoto,
  };
}

export async function generateMetadata({ params }: PhotoPageProps): Promise<Metadata> {
  const { id, photoId } = await params;
  const result = await getTripPhoto(id, photoId);

  return {
    title: result ? `Photo details - ${result.trip.name}` : "Photo not found - DeMems",
  };
}

export default async function TripPhotoPage({ params }: PhotoPageProps) {
  const { id, photoId } = await params;
  const result = await getTripPhoto(id, photoId);

  if (!result) {
    notFound();
  }

  const { trip, photo } = result;
  const isMissingDetails =
    !photo.captured_at ||
    (!photo.location_name && (photo.latitude === null || photo.longitude === null)) ||
    photo.metadata_status === "missing" ||
    photo.metadata_status === "stripped" ||
    photo.metadata_status === "error";

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <p>{trip.name}</p>
          <h1>Photo details</h1>
        </div>
        <Link className={styles.smallAction} href={`/trips/${trip.id}`}>Back</Link>
      </header>

      <section className={styles.photoDetailShell}>
        <figure className={styles.photoDetailPreview}>
          <img
            alt={photo.original_filename || "Trip photo"}
            height={photo.height ?? 800}
            src={photo.signedUrl}
            width={photo.width ?? 800}
          />
          {isMissingDetails ? (
            <figcaption className={styles.missingDetailsNotice}>Missing details</figcaption>
          ) : null}
        </figure>

        <form action={updateTripPhotoDetails} className={styles.photoDetailsForm}>
          <input name="tripId" type="hidden" value={trip.id} />
          <input name="photoId" type="hidden" value={photo.id} />

          <label>
            Date and time
            <input
              defaultValue={getDatetimeLocalValue(photo.captured_at)}
              name="capturedAt"
              type="datetime-local"
            />
          </label>

          <label>
            Location name
            <input
              defaultValue={photo.location_name ?? trip.location ?? ""}
              name="locationName"
              placeholder="e.g. Bondi Beach"
            />
          </label>

          <div className={styles.fieldGrid}>
            <label>
              Latitude
              <input
                defaultValue={photo.latitude ?? ""}
                inputMode="decimal"
                name="latitude"
                placeholder="Optional"
                type="number"
                step="any"
              />
            </label>
            <label>
              Longitude
              <input
                defaultValue={photo.longitude ?? ""}
                inputMode="decimal"
                name="longitude"
                placeholder="Optional"
                type="number"
                step="any"
              />
            </label>
          </div>

          <label>
            Timezone
            <input
              defaultValue={photo.timezone ?? ""}
              name="timezone"
              placeholder="e.g. America/Toronto"
            />
          </label>

          <label>
            Caption
            <textarea
              defaultValue={photo.caption ?? ""}
              name="caption"
              placeholder="Add a quick memory"
              rows={4}
            />
          </label>

          <label className={styles.checkboxField}>
            <input defaultChecked={Boolean(photo.is_cover)} name="isCover" type="checkbox" />
            Use as trip cover
          </label>

          <button type="submit">Save details</button>
        </form>
      </section>
    </>
  );
}
