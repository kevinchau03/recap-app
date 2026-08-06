import type { Metadata } from "next";
import { Kirang_Haerang } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Camera, Heart, MapPinned, Sparkles } from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "4 Da Mems",
  description: "A shared home for trip photos, moments, and memory recaps.",
};

const kirang = Kirang_Haerang({
  weight: "400",
  subsets: ["latin"],
});

const features = [
  {
    icon: Camera,
    title: "Collect the good stuff",
    description: "Invite friends to add photos and moments while the trip is still fresh.",
  },
  {
    icon: MapPinned,
    title: "Keep every trip together",
    description: "Organize memories by destination, date, and the people who were there.",
  },
  {
    icon: Sparkles,
    title: "Turn moments into recaps",
    description: "Build a more meaningful look back than another forgotten camera roll.",
  },
];

export default function Home() {
  return (
    <main className={styles.homePage}>
      <section className={styles.hero} aria-labelledby="home-title">
        <nav className={styles.nav} aria-label="Main navigation">
          <Link href="/" className={`${styles.brand} ${kirang.className}`}>
            4 Da Mems
          </Link>
          <div className={styles.navLinks}>
            <Link href="/login">Log in</Link>
            <Link href="/signup" className={styles.navCta}>
              Sign up
            </Link>
            <Link href="/home" className={styles.navCta}>
              Go to App
            </Link>
          </div>
        </nav>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Shared trip memories</p>
            <h1 id="home-title" className={`${styles.heroTitle} ${kirang.className}`}>
              Save the moments your group never wants to lose.
            </h1>
            <p className={styles.heroText}>
              4 Da Mems gives every trip one cozy place for photos, stories, and
              recap-worthy moments from the people who lived it with you.
            </p>
            <div className={styles.heroActions}>
              <Link href="/signup" className={styles.primaryCta}>
                Start a trip
              </Link>
              <Link href="/login" className={styles.secondaryCta}>
                I already have one
              </Link>
            </div>
          </div>

          <div className={styles.heroVisual} aria-label="Preview of a shared trip recap">
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
            <div className={styles.phoneFrame}>
              <div className={styles.phoneHeader}>
                <span>Lake Weekend</span>
                <Heart size={18} aria-hidden="true" />
              </div>
              <div className={styles.photoGrid} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className={styles.memoryNote}>
                <p>Best laugh</p>
                <strong>Dock karaoke at sunset</strong>
              </div>
              <div className={styles.tripStats} aria-hidden="true">
                <span>28 photos</span>
                <span>6 friends</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.features} aria-labelledby="features-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Built for after the trip</p>
          <h2 id="features-title">A simple place to remember it together.</h2>
        </div>
        <div className={styles.featureGrid}>
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article className={styles.featureCard} key={feature.title}>
                <div className={styles.featureIcon}>
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.bottomCta} aria-labelledby="cta-title">
        <h2 id="cta-title" className={kirang.className}>
          Make the recap before the memories scatter.
        </h2>
        <Link href="/signup" className={styles.primaryCta}>
          Create your first trip
        </Link>
      </section>
    </main>
  );
}
