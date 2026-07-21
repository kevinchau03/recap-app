"use client";

import Link from "next/link";
import { House, Luggage, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const pathname = usePathname();

  const itemClassName = (href: string) =>
    `${styles.item} ${pathname === href ? styles.active : ""}`;

  return (
    <nav className={styles.navigation} aria-label="App navigation">
      <Link className={itemClassName("/home")} href="/home" aria-label="Home">
        <House aria-hidden="true" size={25} strokeWidth={2.4} />
      </Link>

      <Link className={itemClassName("/trips")} href="/trips" aria-label="Trips">
        <Luggage aria-hidden="true" size={25} strokeWidth={2.4} />
      </Link>

      <Link
        className={itemClassName("/settings")}
        href="/settings"
        aria-label="Settings"
      >
        <Settings aria-hidden="true" size={25} strokeWidth={2.4} />
      </Link>
    </nav>
  );
}
