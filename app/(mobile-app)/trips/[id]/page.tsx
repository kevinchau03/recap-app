import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Camera, ImagePlus, Share2, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import styles from "../../mobile.module.css";

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
    .eq("user_id", user.id)
    .maybeSingle<Trip>();

  return data;
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
        <button type="button">
          <ImagePlus aria-hidden="true" size={20} />
          Add photos
        </button>
        <button type="button">
          <Camera aria-hidden="true" size={20} />
          Open camera
        </button>
        <button type="button">
          <Users aria-hidden="true" size={20} />
          Invite friends
        </button>
        <button type="button">
          <Share2 aria-hidden="true" size={20} />
          Share trip
        </button>
      </section>

      <section className={styles.emptyState}>
        <h2>No photos yet</h2>
        <p>Photo uploads and trip memories will appear here once those features are connected.</p>
      </section>

    </>
  );
}
