# Hotfix Evidence — Runtime Chunk 500 + Admin Form Field UI (2026-02-24)

## Reproduction

### Runtime/chunk failures (pre-fix)
- Source: `docs/evidence/phase3-2026-02-24/runtime-precheck.txt`
- Observed:
  - `/admin/_next/static/chunks/9bfd6948c5f0f648.js` → HTTP 500
  - `/admin/_next/static/chunks/b293a7f33e5cd254.js` → HTTP 500

### Root cause (runtime)
- PM2 error log showed server-side `ChunkLoadError` / `MODULE_NOT_FOUND` for missing SSR chunk files under `.next/server/chunks/ssr/*` while runtime expected them.
- This indicates deploy/runtime artifact inconsistency (stale/partial `.next` state) rather than application route logic failure.

### Root cause (form UI defects)
- Custom admin select wrappers did not consistently enforce full-width container behavior (`Autocomplete` root width), producing narrow controls in grid layouts.
- Section Library `MuiSelect` with placeholder (`displayEmpty`) allowed label/value overlap when label shrink state was not forced.

## Fixes applied (minimal-risk)

### Presentational fixes
- `app/(admin)/global-sections/page-client.tsx`
  - Added `fullWidth` + `sx={{ width: "100%" }}` on `Autocomplete` for `Select` and `MultiSelect` wrappers.
- `app/(admin)/pages/[pageId]/page-editor.tsx`
  - Added `fullWidth` on `Autocomplete`; defaulted `sx` width to `100%` unless explicit `w` is provided.
- `app/(admin)/section-library/page-client.tsx`
  - Added `showPlaceholder` state and `InputLabel shrink={showPlaceholder || Boolean(currentValue)}` to prevent label/placeholder overlap.

### Runtime/deploy consistency fix
- Stabilized production artifact generation by switching build script to webpack mode:
  - `package.json`: `"build": "next build --webpack"`
  - Why: Next 16 Turbopack build was intermittently producing `.next` without `BUILD_ID`, causing `next start` crash/restart loops and upstream 502/500 behavior.
- Performed safe runtime refresh cycle after push:
  1. `pm2 stop hopfner.dev-admin`
  2. remove `.next`
  3. `npm run build` (webpack)
  4. `pm2 restart hopfner.dev-admin`
  5. verify previously failing chunk URLs and `/admin/global-sections` are no longer 500

## Validation
- `npm run lint` ✅ (`docs/evidence/phase3-2026-02-24/npm-lint.txt`)
- `npm run build` ✅ (`docs/evidence/phase3-2026-02-24/npm-build.txt`)
- Runtime refresh + endpoint verification captured in:
  - `docs/evidence/phase3-2026-02-24/runtime-postrefresh.txt`
