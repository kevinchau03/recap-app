import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AvatarUpload from "./AvatarUpload";
import { logout, updatePassword, updateProfile } from "./actions";
import styles from "../app.module.css";

export const metadata: Metadata = {
  title: "Settings - DeMems",
  description: "Manage your DeMems preferences.",
};

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

type AppUser = {
  avatar_url: string | null;
  display_name: string | null;
  username: string | null;
};

const getInitial = (name: string) => name.trim().charAt(0).toUpperCase() || "D";

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { error, message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Please%20log%20in%20to%20continue.");
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("avatar_url, display_name, username")
    .eq("id", user.id)
    .maybeSingle<AppUser>();

  const displayName =
    appUser?.display_name ||
    (typeof user.user_metadata.display_name === "string" ? user.user_metadata.display_name : null) ||
    (typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : null) ||
    appUser?.username ||
    user.email?.split("@")[0] ||
    "Guest";
  const avatarUrl =
    appUser?.avatar_url ||
    (typeof user.user_metadata.avatar_url === "string" ? user.user_metadata.avatar_url : "");

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <p>Your account</p>
          <h1>Settings</h1>
        </div>
      </header>

      <section className={styles.profileCard}>
        {avatarUrl ? (
          <Image
            className={styles.largeAvatarImage}
            src={avatarUrl}
            alt=""
            width={56}
            height={56}
            unoptimized
          />
        ) : (
          <div className={styles.largeAvatar}>{getInitial(displayName)}</div>
        )}
        <div>
          <h2>{displayName}</h2>
          <p>{user.email}</p>
        </div>
      </section>

      <AvatarUpload />

      {error ? <p className={`${styles.settingsMessage} ${styles.settingsError}`}>{error}</p> : null}
      {message ? <p className={styles.settingsMessage}>{message}</p> : null}

      <section className={styles.settingsPanel} aria-labelledby="profile-settings-title">
        <div className={styles.settingsPanelHeader}>
          <h2 id="profile-settings-title">Profile</h2>
          <p>Update the name and photo people see in your trips.</p>
        </div>

        <form className={styles.settingsForm} action={updateProfile}>
          <label htmlFor="displayName">
            Display name
            <input
              id="displayName"
              name="displayName"
              type="text"
              defaultValue={displayName}
              maxLength={80}
              autoComplete="name"
              required
            />
          </label>

          <label htmlFor="avatarUrl">
            Avatar URL
            <input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              defaultValue={avatarUrl}
              placeholder="https://example.com/avatar.jpg"
              autoComplete="url"
            />
          </label>

          <button type="submit">Save profile</button>
        </form>
      </section>

      <section className={styles.settingsPanel} aria-labelledby="password-settings-title">
        <div className={styles.settingsPanelHeader}>
          <h2 id="password-settings-title">Password</h2>
          <p>Choose a new password for your account.</p>
        </div>

        <form className={styles.settingsForm} action={updatePassword}>
          <label htmlFor="password">
            New password
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              autoComplete="new-password"
              required
            />
          </label>

          <label htmlFor="confirmPassword">
            Confirm password
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              minLength={8}
              autoComplete="new-password"
              required
            />
          </label>

          <button type="submit">Update password</button>
        </form>
      </section>

      <section className={styles.settingsList} aria-label="Account actions">
        <form action={logout}>
          <button type="submit">
            <span>Log out</span>
            <span aria-hidden="true">-&gt;</span>
          </button>
        </form>
      </section>
    </>
  );
}
