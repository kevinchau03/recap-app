# 4 Da Mems

4 Da Mems is a shared trip-memory app. It helps people create trips, invite friends, upload photos, and keep a lightweight recap of shared memories.

The current product direction is a mobile-first PWA that still works naturally on desktop. iPhone users are a priority, but the app should not rely on mobile-only routes or fixed phone-width layouts.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth, Database, and Storage
- `@supabase/ssr` for server-side auth cookies
- PWA manifest, icons, service worker, and offline fallback

## Features

- Email/password signup and login
- Protected authenticated app routes
- Trip creation and trip list views
- Trip detail pages with invite links and QR codes
- Photo uploads to Supabase Storage
- Basic PWA install support
- MVP offline behavior: cached shell assets, `/offline` fallback, and offline form-submit blocking

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` and ask a project maintainer for the Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev      # Start local development
npm run lint     # Run ESLint
npm run build    # Run production build
npm run start    # Start a built production app
npm run icons    # Regenerate PWA icons from the current bee asset
```

The production build fetches Google font assets through `next/font`, so it needs network access.

## Supabase Notes

The app expects Supabase Auth plus database/storage resources for:

- `users`
- `trips`
- `trip_media`
- `trip_invites`
- `trip-media` storage bucket

The root [proxy.ts](./proxy.ts) refreshes Supabase auth cookies before Server Components run. Do not remove it without replacing the SSR auth flow.

Follow Supabase security rules when changing data access:

- Never expose service-role or secret keys to browser code.
- Keep RLS enabled on exposed tables.
- Do not use user-editable metadata for authorization decisions.
- Use ownership checks in RLS policies, not just `TO authenticated`.

## PWA Notes

PWA install metadata lives in [app/manifest.ts](./app/manifest.ts), app icons live in `public/` and `app/apple-icon.png`, and the service worker lives at [public/sw.js](./public/sw.js).

Current offline behavior is intentionally conservative:

- Cache app shell assets and PWA icons.
- Show `/offline` when navigation fails.
- Block form submissions while offline.
- Do not cache or queue Supabase writes yet.

## Contributing

1. Create a branch for your change.
2. Keep changes scoped to the feature or fix.
3. Follow the existing App Router patterns.
4. Prefer mobile-first responsive layouts, not mobile-only hard-coded widths.
5. Keep auth-protected pages under `app/(app)`.
6. Keep public auth pages under `app/(auth)` unless a different layout is needed.
7. Run checks before handing off:

```bash
npm run lint
npm run build
```

For Supabase changes, also verify the relevant database, storage, and RLS behavior in Supabase before merging.
