# Admin UI Baseline Evidence Index (Phase 0)

Date: 2026-02-24  
Branch: `work/2026-02-24-slow`  
Run context: QA gate fail `a7466438-68cf-4e87-ac4e-67da33ca6447` (remediation package)

Artifact root: `docs/evidence/phase0-2026-02-24/`

## Core command outputs captured
- Route inventory: `docs/evidence/phase0-2026-02-24/route-inventory.txt`
- API route inventory: `docs/evidence/phase0-2026-02-24/api-route-inventory.txt`
- Lint result: `docs/evidence/phase0-2026-02-24/npm-lint.txt`

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
- Current output/path: commands documented; output files should be stored under `docs/evidence/phase0-2026-02-24/api-smoke-*.txt` when executed against target env.

## Validation commands used in this remediation commit
- `find app -maxdepth 4 -type f -name 'page.tsx' | sort > docs/evidence/phase0-2026-02-24/route-inventory.txt`
- `find app/api -maxdepth 4 -type f -name 'route.ts' | sort > docs/evidence/phase0-2026-02-24/api-route-inventory.txt`
- `npm run lint > docs/evidence/phase0-2026-02-24/npm-lint.txt 2>&1`
