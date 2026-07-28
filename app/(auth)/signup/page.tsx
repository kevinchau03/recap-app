import type { Metadata } from "next";
import Link from "next/link";
import { signup } from "../actions";
import styles from "../auth.module.css";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Sign up - DeMems",
  description: "Create your DeMems account.",
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { error, message } = await searchParams;

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard} aria-labelledby="signup-title">
        <header className={styles.authHeader}>
          <h1 id="signup-title">Sign up</h1>
          <p>Create an account to continue!</p>
        </header>

        {error ? <p className={`${styles.message} ${styles.error}`}>{error}</p> : null}
        {message ? <p className={`${styles.message} ${styles.success}`}>{message}</p> : null}

        <form className={styles.authForm} action={signup}>
          <label htmlFor="fullName">
            Full Name
            <input id="fullName" name="fullName" type="text" autoComplete="name" required />
          </label>

          <label htmlFor="email">
            Email
            <input id="email" name="email" type="email" autoComplete="email" required />
          </label>

          <label htmlFor="birthDate">
            Birth date
            <input
              id="birthDate"
              name="birthDate"
              type="text"
              inputMode="numeric"
              placeholder="03/18/2024"
              required
            />
          </label>

          <label htmlFor="phoneNumber">
            Phone Number
            <input id="phoneNumber" name="phoneNumber" type="tel" autoComplete="tel" required />
          </label>

          <label htmlFor="password">
            Set Password
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="*******"
              required
            />
          </label>

          <button type="submit">Register</button>
        </form>

        <p className={styles.authFooter}>
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
