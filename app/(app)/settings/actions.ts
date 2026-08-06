"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut({ scope: "local" });

  revalidatePath("/", "layout");
  redirect("/login?message=You%20have%20been%20logged%20out.");
}
