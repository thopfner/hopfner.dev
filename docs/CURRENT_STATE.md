# Current State

Last verified: 2026-03-07

## Canonical Source

- Repository: `thopfner/hopfner.dev`
- Canonical branch: `main`
- Canonical checkout on server: `/var/www/html/hopfner.dev-main`

## Live Runtime

- App type: single unified Next.js app
- Public site: `https://hopfner.dev`
- Admin UI: `https://hopfner.dev/admin`
- Upstream listener: `127.0.0.1:3010`
- Nginx config: `/etc/nginx/sites-available/hopfner.dev`
- Systemd unit: `/etc/systemd/system/hopfner.dev.service`

Systemd runs the Next.js server directly:

```ini
ExecStart=/var/www/html/hopfner.dev-main/node_modules/.bin/next start -H 127.0.0.1 -p 3010
```

## Route Layout

- Public routes: `/`, `/home`, `/blog`, `/blog/[slug]`
- Admin routes: `/admin`, `/admin/login`, `/admin/pages/[pageId]`, `/admin/global-sections`
- Admin APIs: `/admin/api/*`
- Blog ingest API: `POST /admin/api/internal/blog/ingest`
- Static hero background proxy: `/hero-backgrounds/[name]`

## Environment And Secrets

Runtime secrets are stored in:

- `/var/www/html/hopfner.dev-main/.env.local`

Current documented variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `BLOG_INGEST_API_KEY`

## Common Operations

From `/var/www/html/hopfner.dev-main`:

```bash
npm test
npm run build
npm run deploy:safe
```

Service checks:

```bash
systemctl status hopfner.dev.service
journalctl -u hopfner.dev.service -n 50 --no-pager
```

## Documentation Policy

- Living docs stay at the top level of `docs/`
- Historical migration and QA material lives under `docs/archive/`
- `docs/evidence/` was removed from `main` on 2026-03-07 to keep the branch focused on the current app
