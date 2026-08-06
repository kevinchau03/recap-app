"use server";

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
