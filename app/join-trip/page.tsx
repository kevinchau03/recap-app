import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import styles from "../(auth)/auth.module.css";

type JoinTripPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Join Trip - DeMems",
  description: "Accept a DeMems trip invite.",
};

export default async function JoinTripPage({ searchParams }: JoinTripPageProps) {
  const { token } = await searchParams;
  const inviteToken = String(token ?? "").trim();

  if (!inviteToken) {
    return (
      <main className={styles.authPage}>
        <section className={styles.authCard} aria-labelledby="join-title">
          <header className={styles.authHeader}>
            <h1 id="join-title">Invite missing</h1>
            <p>This trip link is missing an invite token.</p>
          </header>

          <p className={`${styles.message} ${styles.error}`}>Ask your friend to send a fresh invite link.</p>
          <p className={styles.authFooter}>
            <Link href="/home">Back home</Link>
          </p>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?message=${encodeURIComponent("Log in to join this trip.")}&next=${encodeURIComponent(
        `/join-trip?token=${inviteToken}`,
      )}`,
    );
  }

  await supabase.from("users").upsert({
    id: user.id,
    display_name: user.user_metadata.full_name ?? user.email?.split("@")[0] ?? null,
    username: user.email?.split("@")[0] ?? null,
  });

  const { data: tripId, error } = await supabase.rpc("accept_trip_invite", {
    p_token: inviteToken,
  });

  if (!error && typeof tripId === "string") {
    redirect(`/trips/${tripId}`);
  }

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard} aria-labelledby="join-title">
        <header className={styles.authHeader}>
          <h1 id="join-title">Invite failed</h1>
          <p>This trip invite could not be accepted.</p>
        </header>

        <p className={`${styles.message} ${styles.error}`}>
          {error?.message ?? "The invite may be expired or revoked."}
        </p>
        <p className={styles.authFooter}>
          <Link href="/home">Back home</Link>
        </p>
      </section>
    </main>
  );
}
