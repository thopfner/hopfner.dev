# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (uses --webpack flag)
npm run lint         # ESLint (flat config, eslint.config.mjs)
npm test             # Vitest run (single pass)
npm run test:watch   # Vitest watch mode
npm run deploy:safe  # Build + restart systemd + health checks (production only)
```

Service management (production server):
```bash
systemctl status hopfner.dev.service
journalctl -u hopfner.dev.service -n 50 --no-pager
```

## Architecture

Single unified Next.js 16 app (App Router, React 19, TypeScript) serving both a public marketing site and an admin CMS. No monorepo — standard npm project.

### Route Groups

- **`app/(marketing)/`** — Public pages. The `[slug]/page.tsx` catch-all renders CMS-managed pages (home, about, etc.). Blog lives at `/blog` and `/blog/[slug]`.
- **`app/admin/`** — Admin UI. Login at `/admin/login`, protected routes under `app/admin/(protected)/` with layout-level auth guards. Includes page editor, global sections, section library, media manager, and blog management.
- **`app/admin/api/`** — API routes for admin operations (section CRUD, media upload/delete, blog CRUD, page publishing). Blog ingest endpoint at `/admin/api/internal/blog/ingest` uses `x-api-key` header auth.

### Data Layer

- **Supabase** for everything: PostgreSQL database, auth (OAuth + SSR cookies via `@supabase/ssr`), and file storage (`cms-media` bucket).
- Three Supabase clients in `lib/supabase/`: `server.ts` (cookie-based, for Server Components), `browser.ts` (public anon key), `server-admin.ts` (service role key for admin mutations).
- Auth flow: `lib/auth/require-admin.ts` checks `profiles.is_admin` flag. Protected layouts redirect to `/admin/login` if unauthorized.
- Schema lives in `supabase/cms.sql`; migrations in `migrations/`.

### CMS Content Model

Pages contain ordered sections. Each section has immutable **versions** (draft/published). Global sections can be linked across pages. Key tables: `pages`, `sections`, `section_versions`, `global_section_versions`, `section_type_defaults`, `blog_articles`, `blog_versions`.

### UI Stack

- **Tailwind CSS 4** (via `@tailwindcss/postcss`) for public site styling
- **Mantine 8** as the primary admin UI component library (theme in `components/app-theme-provider.tsx`)
- **MUI + mui-tiptap** for the rich text editor in admin
- **shadcn/ui** components in `components/ui/`
- **DnD Kit** for sortable section ordering in admin
- **TipTap** for rich text editing, stored as HTML

### Key Directories

- `components/landing/` — Section renderers for the public marketing site
- `components/admin/` — Admin-specific components
- `components/blog/` — Blog rendering components
- `lib/cms/` — CMS data fetching (e.g., `getPublishedPageBySlug()`)
- `lib/blog/` — Blog queries and utilities
- `lib/media/` — Media file management

### Testing

Vitest with jsdom environment and Testing Library. Tests live in `tests/`. Setup file: `tests/setup.ts`.

### Deployment

Nginx reverse proxy to Next.js on `127.0.0.1:3010`. Managed by systemd (`hopfner.dev.service`). The `deploy:safe` script acquires a lock, builds, restarts the service, and runs health checks against `/` and `/admin/login`.

### Environment Variables

Stored in `.env.local`. Required:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase public config
- `SUPABASE_SERVICE_ROLE_KEY` — Admin database access
- `BLOG_INGEST_API_KEY` — External blog ingest auth
- `SUPABASE_STORAGE_BUCKET` — Media storage bucket name
