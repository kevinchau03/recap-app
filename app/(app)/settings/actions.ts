"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const redirectWithMessage = (type: "error" | "message", message: string) => {
  redirect(`/settings?${type}=${encodeURIComponent(message)}`);
};

const getAuthErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message === "fetch failed") {
    return "Could not reach Supabase. Check your internet connection and try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

const getOptionalUrl = (value: FormDataEntryValue | null) => {
  const url = String(value ?? "").trim();

  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
};

const getDisplayName = (user: {
  email?: string;
  user_metadata: Record<string, unknown>;
}) =>
  (typeof user.user_metadata.display_name === "string" ? user.user_metadata.display_name : null) ||
  (typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : null) ||
  user.email?.split("@")[0] ||
  "Guest";

type AvatarUpdateResult = {
  error?: string;
};

export async function updateAvatarUrl(avatarUrl: string): Promise<AvatarUpdateResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Please log in to update your profile picture." };
  }

  const normalizedAvatarUrl = getOptionalUrl(avatarUrl);

  if (!normalizedAvatarUrl) {
    return { error: "Avatar upload finished, but the generated URL was invalid." };
  }

  const { error: authError } = await supabase.auth
    .updateUser({
      data: {
        avatar_url: normalizedAvatarUrl,
      },
    })
    .catch((error: unknown) => ({ data: { user: null }, error: new Error(getAuthErrorMessage(error)) }));

  if (authError) {
    return { error: authError.message };
  }

  const username = user.email?.split("@")[0] ?? null;
  const { error: profileError } = await supabase.from("users").upsert({
    id: user.id,
    avatar_url: normalizedAvatarUrl,
    display_name: getDisplayName(user),
    username,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/settings");
  revalidatePath("/home");
  return {};
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?message=Please%20log%20in%20to%20continue.");
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const avatarUrlInput = String(formData.get("avatarUrl") ?? "").trim();
  const avatarUrl = getOptionalUrl(formData.get("avatarUrl"));

  if (!displayName) {
    redirectWithMessage("error", "Display name is required.");
  }

  if (displayName.length > 80) {
    redirectWithMessage("error", "Display name must be 80 characters or fewer.");
  }

  if (avatarUrlInput && !avatarUrl) {
    redirectWithMessage("error", "Avatar URL must be a valid http or https URL.");
  }

  const { error: authError } = await supabase.auth
    .updateUser({
      data: {
        avatar_url: avatarUrl,
        display_name: displayName,
        full_name: displayName,
      },
    })
    .catch((error: unknown) => ({ data: { user: null }, error: new Error(getAuthErrorMessage(error)) }));

  if (authError) {
    redirectWithMessage("error", authError.message);
  }

  const username = user.email?.split("@")[0] ?? null;
  const { error: profileError } = await supabase.from("users").upsert({
    id: user.id,
    avatar_url: avatarUrl,
    display_name: displayName,
    username,
  });

  if (profileError) {
    redirectWithMessage("error", profileError.message);
  }

  revalidatePath("/settings");
  revalidatePath("/home");
  redirectWithMessage("message", "Profile updated.");
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?message=Please%20log%20in%20to%20continue.");
  }

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!password || !confirmPassword) {
    redirectWithMessage("error", "Enter and confirm your new password.");
  }

  if (password.length < 8) {
    redirectWithMessage("error", "Password must be at least 8 characters.");
  }

  if (password !== confirmPassword) {
    redirectWithMessage("error", "Passwords do not match.");
  }

  const { error } = await supabase.auth
    .updateUser({ password })
    .catch((error: unknown) => ({ data: { user: null }, error: new Error(getAuthErrorMessage(error)) }));

  if (error) {
    redirectWithMessage("error", error.message);
  }

  revalidatePath("/settings");
  redirectWithMessage("message", "Password updated.");
}

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut({ scope: "local" });

  revalidatePath("/", "layout");
  redirect("/login?message=You%20have%20been%20logged%20out.");
}
