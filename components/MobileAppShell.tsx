"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import styles from "@/app/(mobile-app)/mobile.module.css";

export default function MobileAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/trips/new") {
    return <main className={styles.creationRoute}>{children}</main>;
  }

  return (
    <main className={styles.mobileRoute}>
      <section className={styles.mobileShell} aria-label="DeMems mobile app">
        {children}
        <Navigation />
      </section>
    </main>
  );
}
