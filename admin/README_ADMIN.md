# Admin App (hopfner.dev-admin) Setup

This repo is the admin CMS app served under `https://hopfner.dev/admin` via Nginx
reverse proxy.

It uses:
- Next.js App Router
- Mantine UI + Mantine TipTap editor
- Supabase hosted (email auth)
- Supabase RLS for admin-only CRUD (`profiles.is_admin = true`)

## 1) Supabase Database Setup

Run the CMS SQL script manually in the Supabase SQL editor:
- `../hopfner.dev/supabase/cms.sql`

This creates:
- `profiles`, `pages`, `sections`, `section_versions`, `audit_log`, `media`
- RLS policies (public reads published content; admins can CRUD)
- Audit triggers
- RPCs: `bootstrap_make_admin()`, `publish_section_version()`, `restore_section_version()`
- Seed data for a `home` page and all landing sections (published + draft copies)

## 2) Supabase Storage Setup (Images)

Create a Storage bucket named `cms-media` in Supabase:
- Storage -> Buckets -> New bucket -> name: `cms-media`
- Make it public (v1 uses public image URLs inside rich text)

The SQL script includes `storage.objects` policies so:
- Public can read from `cms-media`
- Admins can upload/write to `cms-media`

## 3) Supabase Auth Setup

Enable Email auth in Supabase:
- Auth -> Providers -> Email
- Configure magic link / SMTP as needed

Make sure your redirect URLs include:
- `https://hopfner.dev/admin/auth/callback` (production)
- `http://localhost:3000/admin/auth/callback` (local dev)

## 4) Env Vars

Set env vars (example: `.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
```

No service role key is used or required.

## 5) Run Locally

```bash
npm install
npm run dev
```

Because `basePath` is configured, open:
- `http://localhost:3000/admin/login`

## 6) First Admin Bootstrap (One-Time)

We cannot seed an admin UUID in SQL.

1. Sign in via `/admin/login`.
2. Go to `/admin/setup` and click **Make me admin**.

This calls the RPC `public.bootstrap_make_admin()` and will only succeed if
no admin exists yet (`profiles.is_admin = true` count is 0).

## 7) Deploy Behind Nginx (Design Assumption)

The admin app is built with `basePath: "/admin"` (`next.config.ts`).

Nginx should reverse proxy `/admin` to the admin upstream **without** stripping
the prefix, so the app receives requests under `/admin/*`.
