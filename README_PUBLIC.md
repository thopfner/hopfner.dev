# Public Routes

The public site is served by the same unified Next.js app at `https://hopfner.dev`.

Primary routes:
- Landing/home redirect: `/`
- Home page content: `/home`
- Asset proxy for hero backgrounds: `/hero-backgrounds/:name`

Content model:
- Public pages render published CMS content from Supabase
- Admin publishes content through `/admin`
- Public rendering reads only published versions

Environment:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
```

Related code:
- Marketing routes: `app/(marketing)`
- CMS read path: `lib/cms`
