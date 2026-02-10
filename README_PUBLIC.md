# Public Site (hopfner.dev) CMS Rendering

This repo is the public site for `hopfner.dev` (Next.js App Router + shadcn/ui).

The home page is rendered from Supabase CMS data (published section versions only).

## Setup

1. In Supabase (hosted), open the SQL editor and run:
   - `supabase/cms.sql`

2. Set env vars (example: `.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
```

3. Run:

```bash
npm install
npm run dev
```

## How The Public Site Loads Content

- Entry point: `app/(marketing)/page.tsx`
  - Fetches the page by slug (`home`) and all enabled sections ordered by `sections.position`.
  - Joins the currently published `section_versions` per section.
  - Renders by mapping `section_type` -> `components/landing/*`.

- Data access: `lib/cms/get-published-page.ts`
  - Public site only queries `status = 'published'`.
  - Drafts are not fetched and are blocked by RLS.

- Rich text:
  - Admin stores TipTap JSON in `section_versions.content`.
  - Public converts TipTap JSON -> HTML server-side via `lib/cms/rich-text.ts`,
    then sanitizes before rendering (`sanitize-html`).

- Formatting (Tailwind classes):
  - Admin can provide `formatting.containerClass` and `formatting.sectionClass`.
  - Only whitelisted Tailwind tokens are allowed.
  - Public sanitizes formatting defensively via `lib/cms/formatting.ts` using the
    whitelist loaded from `tailwind_class_whitelist`.

## Notes

- The Supabase CMS schema + seed lives in `supabase/cms.sql`.
- The seed creates a `home` page and published versions for all required sections.
- Public rendering is request-time (`dynamic = "force-dynamic"`), so the latest
  published content is shown immediately after publishing in `/admin`.

