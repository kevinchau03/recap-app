"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

type InviteResult =
  | {
      token: string;
    }
  | {
      error: string;
    };

const TOKEN_BYTES = 24;

const createInviteToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(TOKEN_BYTES));

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

export async function getOrCreateTripInvite(tripId: string): Promise<InviteResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Please log in to invite friends." };
  }

  const { data: trip } = await supabase
    .from("trips")
    .select("id")
    .eq("id", tripId)
    .maybeSingle<{ id: string }>();

  if (!trip) {
    return { error: "You do not have access to this trip." };
  }

  const { data: existingInvite } = await supabase
    .from("trip_invites")
    .select("token, expires_at")
    .eq("trip_id", tripId)
    .eq("created_by", user.id)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ token: string; expires_at: string | null }>();

  if (
    existingInvite?.token &&
    (!existingInvite.expires_at || new Date(existingInvite.expires_at).getTime() > Date.now())
  ) {
    return { token: existingInvite.token };
  }

  const { data: invite, error: inviteError } = await supabase
    .from("trip_invites")
    .insert({
      trip_id: tripId,
      token: createInviteToken(),
      created_by: user.id,
    })
    .select("token")
    .single<{ token: string }>();

  if (inviteError || !invite) {
    return { error: inviteError?.message ?? "Could not create an invite link." };
  }

  return { token: invite.token };
}

const getStringValue = (formData: FormData, key: string) => {
  const value = String(formData.get(key) ?? "").trim();
  return value.length ? value : null;
};

const getNumberValue = (formData: FormData, key: string) => {
  const value = getStringValue(formData, key);

  if (!value) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const getCapturedAt = (formData: FormData) => {
  const value = getStringValue(formData, "capturedAt");

  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export async function updateTripPhotoDetails(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?message=Please%20log%20in%20to%20continue.");
  }

  const tripId = getStringValue(formData, "tripId");
  const photoId = getStringValue(formData, "photoId");

  if (!tripId || !photoId) {
    redirect("/trips");
  }

  const capturedAt = getCapturedAt(formData);
  const locationName = getStringValue(formData, "locationName");
  const latitude = getNumberValue(formData, "latitude");
  const longitude = getNumberValue(formData, "longitude");
  const caption = getStringValue(formData, "caption");
  const timezone = getStringValue(formData, "timezone");
  const isCover = formData.get("isCover") === "on";

  if (isCover) {
    await supabase
      .from("trip_media")
      .update({ is_cover: false })
      .eq("trip_id", tripId)
      .eq("media_type", "photo");
  }

  const hasLocation = Boolean(locationName) || (latitude !== null && longitude !== null);

  await supabase
    .from("trip_media")
    .update({
      captured_at: capturedAt,
      captured_at_source: capturedAt ? "user" : null,
      latitude,
      longitude,
      location_name: locationName,
      location_source: hasLocation ? "user" : null,
      caption,
      timezone,
      is_cover: isCover,
      metadata_status: capturedAt && hasLocation ? "parsed" : "missing",
    })
    .eq("id", photoId)
    .eq("trip_id", tripId);

  revalidatePath(`/trips/${tripId}`);
  revalidatePath(`/trips/${tripId}/photos/${photoId}`);
  redirect(`/trips/${tripId}`);
}
