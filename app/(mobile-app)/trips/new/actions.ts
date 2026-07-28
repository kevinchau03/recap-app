"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

type CreateTripResult = {
  error?: string;
};

const getValue = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

const getCoverLabel = (destination: string) => {
  const [firstPart] = destination.split(",");
  return firstPart.trim().slice(0, 12) || "Trip";
};

export async function createTrip(formData: FormData): Promise<CreateTripResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?message=Please%20log%20in%20to%20continue.");
  }

  const name = getValue(formData, "tripName");
  const startDate = getValue(formData, "startDate");
  const endDate = getValue(formData, "endDate");
  const destination = getValue(formData, "destination");

  if (!name || !startDate || !endDate || !destination) {
    return { error: "Please complete every step before creating the trip." };
  }

  if (endDate < startDate) {
    return { error: "End date must be after the start date." };
  }

  const { error } = await supabase.from("trips").insert({
    user_id: user.id,
    name,
    location: destination,
    start_date: startDate,
    end_date: endDate,
    cover_label: getCoverLabel(destination),
    member_count: 1,
    photo_count: 0,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/home");
  revalidatePath("/trips");
  redirect("/trips");
}
