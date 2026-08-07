import type { Metadata } from "next";
import Link from "next/link";
import JoinTripFlow from "./JoinTripFlow";
import styles from "../app.module.css";

export const metadata: Metadata = {
  title: "Join Trip - DeMems",
  description: "Join a shared DeMems trip.",
};

export default function JoinTripPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <p>Shared invite</p>
          <h1>Join Trip</h1>
        </div>
        <Link className={styles.smallAction} href="/home">
          Back
        </Link>
      </header>

      <JoinTripFlow />
    </>
  );
}
