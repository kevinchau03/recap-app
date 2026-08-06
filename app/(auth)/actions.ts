"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const redirectWithMessage = (path: string, type: "error" | "message", message: string) => {
  const separator = path.includes("?") ? "&" : "?";

  redirect(`${path}${separator}${type}=${encodeURIComponent(message)}`);
};

const getAuthErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message === "fetch failed") {
    return "Could not reach Supabase. Check your internet connection and restart the dev server from a normal terminal.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

const getSafeRedirectPath = (value: FormDataEntryValue | null) => {
  const path = String(value ?? "").trim();

  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/home";
  }

  return path;
};

const withNextPath = (path: string, nextPath: string) => {
  if (nextPath === "/home") {
    return path;
  }

  return `${path}?next=${encodeURIComponent(nextPath)}`;
};

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = getSafeRedirectPath(formData.get("next"));

  if (!email || !password) {
    redirectWithMessage(withNextPath("/login", nextPath), "error", "Email and password are required.");
  }

  const { error } = await supabase.auth
    .signInWithPassword({
      email,
      password,
    })
    .catch((error: unknown) => ({ error: new Error(getAuthErrorMessage(error)) }));

  if (error) {
    redirectWithMessage(withNextPath("/login", nextPath), "error", error.message);
  }

  revalidatePath("/", "layout");
  redirect(nextPath);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = getSafeRedirectPath(formData.get("next"));
  const origin = (await headers()).get("origin");

  if (!fullName || !email || !birthDate || !phoneNumber || !password) {
    redirectWithMessage(withNextPath("/signup", nextPath), "error", "Please fill in every field.");
  }

  const { data, error } = await supabase.auth
    .signUp({
      email,
      password,
      options: {
        emailRedirectTo: origin
          ? `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
          : undefined,
        data: {
          full_name: fullName,
          birth_date: birthDate,
          phone_number: phoneNumber,
        },
      },
    })
    .catch((error: unknown) => ({
      data: { session: null, user: null },
      error: new Error(getAuthErrorMessage(error)),
    }));

  if (error) {
    redirectWithMessage(withNextPath("/signup", nextPath), "error", error.message);
  }

  if (data.session && data.user) {
    await supabase.from("users").upsert({
      id: data.user.id,
      display_name: fullName,
      username: email.split("@")[0],
    });

    revalidatePath("/", "layout");
    redirect(nextPath);
  }

  redirectWithMessage(
    withNextPath("/login", nextPath),
    "message",
    "Account created. Check your email to confirm your account, then log in.",
  );
}
