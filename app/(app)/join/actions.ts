"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

type JoinTripResult = {
  error?: string;
};

const getInviteToken = (value: string) => {
  const input = value.trim();

  if (!input) {
    return "";
  }

  try {
    const url = new URL(input);

    return url.searchParams.get("token")?.trim() ?? "";
  } catch {
    return input;
  }
};

export async function joinTripFromInvite(value: string): Promise<JoinTripResult> {
  const token = getInviteToken(value);

  if (!token) {
    return { error: "Enter a valid invite link or token." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/login?next=${encodeURIComponent(`/join-trip?token=${token}`)}`);
  }

  const username = user.email?.split("@")[0] ?? null;

  const { error: profileError } = await supabase.from("users").upsert({
    id: user.id,
    display_name: user.user_metadata.full_name ?? username,
    username,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  const { data: tripId, error } = await supabase.rpc("accept_trip_invite", {
    p_token: token,
  });

  if (error) {
    return { error: error.message };
  }

  if (typeof tripId !== "string") {
    return { error: "Invite accepted, but the trip could not be opened." };
  }

  revalidatePath("/home");
  revalidatePath("/trips");
  redirect(`/trips/${tripId}`);
}
