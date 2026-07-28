import type { Metadata } from "next";
import Link from "next/link";
import { login } from "../actions";
import styles from "../auth.module.css";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Login - DeMems",
  description: "Log in to DeMems.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message } = await searchParams;

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard} aria-labelledby="login-title">
        <header className={styles.authHeader}>
          <h1 id="login-title">Login</h1>
          <p>Welcome back to DeMems.</p>
        </header>

        {error ? <p className={`${styles.message} ${styles.error}`}>{error}</p> : null}
        {message ? <p className={`${styles.message} ${styles.success}`}>{message}</p> : null}

        <form className={styles.authForm} action={login}>
          <label htmlFor="email">
            Email
            <input id="email" name="email" type="email" autoComplete="email" required />
          </label>

          <label htmlFor="password">
            Password
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </label>

          <button type="submit">Login</button>
        </form>

        <p className={styles.authFooter}>
          Need an account? <Link href="/signup">Sign up</Link>
        </p>
      </section>
    </main>
  );
}
