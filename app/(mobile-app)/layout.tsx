import MobileAppShell from "@/components/MobileAppShell";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Loading from "./loading";

async function ProtectedMobileApp({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Please%20log%20in%20to%20continue.");
  }

  return <MobileAppShell>{children}</MobileAppShell>;
}

export default function MobileAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<Loading />}>
      <ProtectedMobileApp>{children}</ProtectedMobileApp>
    </Suspense>
  );
}
