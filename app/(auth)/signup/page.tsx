import type { Metadata } from "next";
import { Kirang_Haerang } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ChevronDown, EyeOff } from "lucide-react";
import { signup } from "../actions";
import styles from "../auth.module.css";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Sign up - DeMems",
  description: "Create your DeMems account.",
};

const kirang = Kirang_Haerang({
  weight: "400",
  subsets: ["latin"],
});

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { error, message, next } = await searchParams;

  return (
    <main className={`${styles.authPage} ${styles.figmaAuthPage}`}>
      <section
        className={`${styles.signupScreen} ${kirang.className}`}
        aria-labelledby="signup-title"
      >
        <Link className={styles.backLink} href="/" aria-label="Back to home">
          <ArrowLeft size={24} strokeWidth={2.3} aria-hidden="true" />
        </Link>

        <header className={styles.signupHeader}>
          <h1 id="signup-title">Sign up</h1>
          <p>Create an account to continue!</p>
        </header>

        {error ? <p className={`${styles.message} ${styles.error}`}>{error}</p> : null}
        {message ? <p className={`${styles.message} ${styles.success}`}>{message}</p> : null}

        <form className={styles.signupForm} action={signup}>
          <input name="next" type="hidden" value={next ?? "/home"} />

          <label htmlFor="fullName">
            Full Name
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="baka"
              required
            />
          </label>

          <label htmlFor="email">
            Email
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="baka@gmail.com"
              required
            />
          </label>

          <label htmlFor="birthDate">
            Birth of date
            <span className={styles.inputWithIcon}>
              <input
                id="birthDate"
                name="birthDate"
                type="text"
                inputMode="numeric"
                placeholder="18/03/2024"
                required
              />
              <CalendarDays size={16} strokeWidth={2} aria-hidden="true" />
            </span>
          </label>

          <label htmlFor="phoneNumber">
            Phone Number
            <span className={styles.phoneField}>
              <span className={styles.countrySelect} aria-hidden="true">
                <span className={styles.countryFlag}>
                  <Image src="/figma/country-background.png" alt="" width={18} height={18} />
                  <Image src="/figma/country-cross.png" alt="" width={18} height={18} />
                  <Image src="/figma/country-canton.png" alt="" width={9} height={9} />
                  <Image src="/figma/country-intersect.png" alt="" width={6} height={9} />
                </span>
                <ChevronDown size={12} strokeWidth={2} />
              </span>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                placeholder="(454) 726-0592"
                required
              />
            </span>
          </label>

          <label htmlFor="password">
            Set Password
            <span className={styles.inputWithIcon}>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="*******"
                required
              />
              <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
            </span>
          </label>

          <button type="submit">Register</button>
        </form>

        <p className={styles.signupFooter}>
          Already have an account?{" "}
          <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}>Login</Link>
        </p>
      </section>
    </main>
  );
}
