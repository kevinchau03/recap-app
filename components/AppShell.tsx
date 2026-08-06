"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import styles from "@/app/(app)/app.module.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/trips/new") {
    return <main className={styles.creationRoute}>{children}</main>;
  }

  return (
    <main className={styles.appRoute}>
      <section className={styles.appShell} aria-label="DeMems app">
        {children}
        <Navigation />
      </section>
    </main>
  );
}
