# Admin UI Baseline Evidence Index (Phase 0)

Date: 2026-02-24  
Branch: `work/2026-02-24-slow`  
Execution window (UTC): 2026-02-24T09:10:49Z → 2026-02-24T09:12:47Z  
Run context: Phase 0 QA revalidation evidence execution for prior gate fail `a7466438-68cf-4e87-ac4e-67da33ca6447`

Artifact root: `docs/evidence/phase0-2026-02-24/`

## Core command outputs captured
- Route inventory (generated 2026-02-24T09:10:49Z): `docs/evidence/phase0-2026-02-24/route-inventory.txt`
- API route inventory incl. nested blog version routes (generated 2026-02-24T09:10:49Z): `docs/evidence/phase0-2026-02-24/api-route-inventory.txt`
- Lint smoke (run 2026-02-24T09:10:53Z): `docs/evidence/phase0-2026-02-24/npm-lint.txt`
- Build smoke (run 2026-02-24T09:11:05Z): `docs/evidence/phase0-2026-02-24/npm-build.txt`

## Route/State Evidence Map

### R-01 Dashboard default
- Route: `/`
- Required state: initial load (admin authenticated)
- Capture command: `openclaw browser snapshot --targetUrl https://<env-admin-host>/ --profile openclaw`
- Current output/path: command documented; screenshot artifact pending capture in `docs/evidence/phase0-2026-02-24/screens/`.

### R-02 Blog list empty
- Route: `/blog`
- Required state: empty dataset
- Capture command: `openclaw browser snapshot --targetUrl https://<env-admin-host>/blog --profile openclaw`
- Current output/path: reproducible command recorded; static image not yet captured.

### R-03 Global sections populated
- Route: `/global-sections`
- Required state: populated dataset
- Capture command: `openclaw browser snapshot --targetUrl https://<env-admin-host>/global-sections --profile openclaw`
- Current output/path: reproducible command recorded; static image not yet captured.

### R-04 Media upload modal open
- Route: `/media`
- Required state: modal open + interaction ready
- Capture command: `openclaw browser snapshot --targetUrl https://<env-admin-host>/media --profile openclaw`
- Current output/path: reproducible command recorded; static image not yet captured.

### R-05 Section library loading
- Route: `/section-library`
- Required state: loading/skeleton
- Capture command: `openclaw browser snapshot --targetUrl https://<env-admin-host>/section-library --profile openclaw`
- Current output/path: reproducible command recorded; static image not yet captured.

### R-06 Page editor validation and save
- Route: `/pages/[pageId]`
- Required state: validation error + success confirmation
- Capture command: `openclaw browser snapshot --targetUrl https://<env-admin-host>/pages/<pageId> --profile openclaw`
- Current output/path: reproducible command recorded; static image not yet captured.

### R-07 Login invalid credentials
- Route: `/login`
- Required state: auth failure feedback
- Capture command: `openclaw browser snapshot --targetUrl https://<env-admin-host>/login --profile openclaw`
- Current output/path: reproducible command recorded; static image not yet captured.

### R-08 Setup first-user success
- Route: `/setup`
- Required state: first-user setup success
- Capture command: `openclaw browser snapshot --targetUrl https://<env-admin-host>/setup --profile openclaw`
- Current output/path: reproducible command recorded; static image not yet captured.

### R-09 Read-only permission denied state
- Route(s): `/blog`, `/global-sections`, `/media` using read-only account
- Required state: permission denied / blocked action
- Capture command: `openclaw browser snapshot --targetUrl https://<env-admin-host>/<route> --profile openclaw` (run once per route with read-only account)
- Current output/path: reproducible command recorded; static image not yet captured.

### R-10 Priority API smoke
- Routes: `/api/pages/overview`, `/api/media`, `/api/blog/articles`, `/api/content/blueprint`
- Required state: deterministic API accessibility/sanity check
- Capture commands:
  - `curl -i https://<env-admin-host>/api/pages/overview`
  - `curl -i https://<env-admin-host>/api/media`
  - `curl -i https://<env-admin-host>/api/blog/articles`
  - `curl -i https://<env-admin-host>/api/content/blueprint`
- Current output/path: executed and captured under:
  - `docs/evidence/phase0-2026-02-24/api-smoke-pages-overview.txt` (404 at `/api/pages/overview`; separate probe to `/admin/api/pages/overview` returned 401 unauthenticated)
  - `docs/evidence/phase0-2026-02-24/api-smoke-media.txt` (404 at `/api/media`)
  - `docs/evidence/phase0-2026-02-24/api-smoke-blog-articles.txt` (404 at `/api/blog/articles`)
  - `docs/evidence/phase0-2026-02-24/api-smoke-content-blueprint.txt` (404 at `/api/content/blueprint`)

## Validation commands executed in this revalidation run
- `find app -type f -name 'page.tsx' | sort` (redirected to `docs/evidence/phase0-2026-02-24/route-inventory.txt`)
- `find app/api -type f -name 'route.ts' | sort` (redirected to `docs/evidence/phase0-2026-02-24/api-route-inventory.txt`)
- `npm run lint` (redirected to `docs/evidence/phase0-2026-02-24/npm-lint.txt`)
- `npm run build` (redirected to `docs/evidence/phase0-2026-02-24/npm-build.txt`)
- `curl -i -sS http://localhost:3000/api/<endpoint>` for priority API smoke outputs (redirected to `docs/evidence/phase0-2026-02-24/api-smoke-*.txt`)
