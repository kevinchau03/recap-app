import type { Metadata } from "next";
import { Kirang_Haerang } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "4 Da Mems",
  description: "Preserve, feel, and remember your memories.",
};

const kirang = Kirang_Haerang({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <main className={styles.homePage}>
      <section
        className={`${styles.homeSplash} ${kirang.className}`}
        aria-labelledby="home-title"
      >
        <div className={styles.beeTrail} aria-hidden="true">
          <Image
            src="/figma/login-bee-path.png"
            alt=""
            width={700}
            height={700}
            priority
          />
        </div>

        <Image
          className={styles.bee}
          src="/figma/login-bee.png"
          alt=""
          width={251}
          height={250}
          priority
        />

        <h1 id="home-title" className={styles.splashTitle}>
          4 Da Mems
        </h1>

        <Link href="/signup" className={styles.getStarted}>
          get started
        </Link>

        <div className={styles.memoryWords} aria-hidden="true">
          <span>feel</span>
          <span>preserve</span>
          <span>remember</span>
        </div>
      </section>
    </main>
  );
}
