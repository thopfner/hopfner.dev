# Server Setup Guide

Step-by-step instructions for deploying this app on a fresh VPS.

## Prerequisites

- Ubuntu 22.04+ (or similar)
- Docker and Docker Compose installed
- Nginx installed
- A domain name pointing to the server
- A Supabase instance (cloud or self-hosted)

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USER/your-repo.git /var/www/your-app
cd /var/www/your-app
```

> You can use any directory path and name — adjust subsequent commands accordingly.

## 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET="cms-media"
BLOG_INGEST_API_KEY="generate-a-random-key"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NEXT_PUBLIC_SITE_NAME="Your Site Name"
PORT=3010
```

## 3. Database Setup

In the Supabase SQL editor, run the consolidated schema file:

- `supabase/schema.sql` — complete schema in a single file (recommended for fresh installs)

> For incremental upgrades to an existing database, apply only the new files from `migrations/` in date order instead.

## 4. Build and Start

```bash
docker compose build
docker compose up -d
```

Verify the app is running:

```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:${PORT:-3010}/admin/login
# Should return 200 or 307
```

## 5. Nginx + SSL

Generate the nginx config from the template:

```bash
export DOMAIN="yourdomain.com"
sed "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" nginx/site.conf.template > /etc/nginx/sites-available/$DOMAIN
ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
```

Get an SSL certificate:

```bash
certbot --nginx -d $DOMAIN
```

Reload nginx:

```bash
nginx -t && systemctl reload nginx
```

## 6. Create Admin User

1. Visit `https://yourdomain.com/admin/login` and sign in with OAuth
2. In the Supabase SQL editor, run:

```sql
SELECT bootstrap_make_admin();
```

This promotes the first user in the `profiles` table to admin.

## Subsequent Deployments

From the server:

```bash
cd /var/www/your-app
npm run deploy:docker
```

This runs `git pull`, rebuilds the Docker image, restarts the container, and runs a health check.

## Bare-Metal Alternative

If you prefer running without Docker (e.g., for development servers):

```bash
npm ci
npm run build
npm run start
# Or use: npm run deploy:safe  (requires systemd service)
```
