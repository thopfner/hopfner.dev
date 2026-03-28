# Live Runtime Mismatch Review

## Finding

The current production break on `https://hopf.thapi.cc` is not a CMS database read failure.

The public page is still server-rendering published CMS content from Supabase, but the live runtime is serving stale Next.js build metadata and broken chunk URLs.

## Confirmed Evidence

### 1. Public CMS content is still loading

- Live `https://hopf.thapi.cc/home` rendered real published section content in HTML.
- Direct Supabase read on the VPS for page slug `home` returned the same published section copy now visible on the page.
- The page renderer still uses the CMS path:
  - `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`
  - `/var/www/html/hopfner.dev-main/lib/cms/get-published-page.ts`

This means the data path from page request -> Supabase -> rendered HTML is still alive.

### 2. Live chunk asset URLs are broken

The live HTML currently references stale chunk hashes such as:

- `/_next/static/chunks/webpack-8277ca6bdb2c0967.js`
- `/_next/static/chunks/app/(marketing)/%5Bslug%5D/page-e7e5aa0df90be17f.js`
- `/_next/static/chunks/app/admin/login/page-76efee9110e0cb8d.js`

Those URLs return `500` on the public site.

### 3. The current repo build output uses different chunk hashes

The current repo build output in `/var/www/html/hopfner.dev-main/.next/static/chunks` contains different files, for example:

- `webpack-5d08d9ef768eaff7.js`
- `app/(marketing)/[slug]/page-94f43e87f74ecb62.js`
- `app/admin/login/page-3dd4568f3167073f.js`

The current `/var/www/html/hopfner.dev-main/.next/build-manifest.json` also points at the new hashes, not the stale ones in live HTML.

### 4. The live site is still running from systemd, not the new Docker path

The active production service is:

- `hopf.thapi.cc.service`

Its unit is:

- `WorkingDirectory=/var/www/html/hopfner.dev-main`
- `ExecStart=/var/www/html/hopfner.dev-main/node_modules/.bin/next start -H 127.0.0.1 -p 3010`

It has been running since:

- `2026-03-20 11:42:31 UTC`

So the current public traffic is still coming from the long-running systemd `next start` process on port `3010`, not from `docker compose`.

### 5. The current ship-gate deploy artifacts are not the active production path

- `docker compose ps` for the repo showed no running `app` or `worker` services.
- The new Docker deploy scripts and compose config are not what `hopf.thapi.cc` is currently serving.

## Root Cause

The repo’s `.next` output has been rebuilt on disk after the systemd `hopf.thapi.cc.service` process was started, but that service was never restarted to pick up the new build manifest.

That leaves production in a mixed-build state:

- the long-running `next start` process still serves HTML referencing the old chunk hashes it loaded at startup
- the on-disk `.next/static` directory now contains newer chunk files from later builds
- as a result, the browser requests chunk files that no longer exist for the running process

This explains the symptoms:

- public HTML still contains CMS content
- client-side JS chunk requests fail
- admin and public interactive runtime behavior break
- the issue looks like a “data disconnect” even though the CMS server-render path still works

## Classification

- primary failure mode: deployment gap
- secondary symptom: frontend/admin runtime break from stale build manifests
- not a primary CMS query/path failure

## Immediate Fix Direction

1. Treat this as a live runtime alignment hotfix.
2. Do not touch CMS rendering logic first.
3. Restart the actual live service after a confirmed good build.
4. Add a deploy verification step that compares live HTML chunk references against actual accessible chunk URLs.
5. Make the active production runtime truth explicit:
   - current host is still using systemd `next start`
   - Docker deploy artifacts are not yet the traffic-serving path on this host

## Non-Goals For This Hotfix

- no CMS schema changes
- no section renderer rewrites
- no agent-worker feature work
- no migration to a different production runtime in the same batch unless explicitly approved
