# hopfner.dev

Unified Next.js app for `hopfner.dev`.

Routes:
- Public site: `/`
- Admin UI: `/admin`
- Admin APIs: `/admin/api/*`

Local development:

```bash
npm install
npm run dev
```

Important files:
- Public app overview: `README_PUBLIC.md`
- Admin app overview: `README_ADMIN.md`
- Safe deploy script: `scripts/deploy-safe.sh`

Production on this server:
- Canonical checkout: `/var/www/html/hopfner.dev-main`
- Systemd unit: `/etc/systemd/system/hopfner.dev.service`
- Nginx site: `/etc/nginx/sites-available/hopfner.dev`
