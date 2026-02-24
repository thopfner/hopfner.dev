# Admin UI Baseline Capture Checklist

Capture baseline evidence before remediation begins. Store artifacts in a consistent location per run date.

## Capture Dimensions
- **Routes/Screens:** dashboard, list pages, detail pages, edit/create forms, settings, auth/forbidden states, error/empty/loading states.
- **Viewports:**
  - Desktop: `1440x900`
  - Laptop: `1280x800`
  - Tablet: `1024x768`
  - Mobile: `390x844` (if supported/admin-accessible)
- **States per route:**
  - initial load
  - loading/skeleton
  - empty data
  - populated data
  - validation error
  - permission denied (role-based)
  - success toast/confirmation

## Checklist (Phase 0 remediation snapshot — 2026-02-24)
- [x] Route inventory finalized (canonical URL list).  
  Evidence: `docs/evidence/phase0-2026-02-24/route-inventory.txt`
- [ ] Test accounts prepared (admin/editor/read-only where applicable).  
  Status: pending explicit QA confirmation in revalidation run.
- [ ] Seed data or fixtures available for empty + populated states.  
  Status: pending explicit QA confirmation in revalidation run.
- [ ] Screenshot capture completed for each route × viewport × key state.  
  Status: pending (capture commands indexed in `docs/admin-ui-baseline-evidence-index.md`).
- [ ] Console/network error log snapshot captured for each priority route.  
  Status: pending QA capture run.
- [ ] Baseline performance note captured (initial render + key interaction latency).  
  Status: pending measured capture during QA revalidation.
- [ ] Accessibility quick scan recorded (focus order, labels, keyboard nav smoke).  
  Status: pending QA execution notes/artifacts.
- [x] Artifact index generated (file paths + timestamp + environment).  
  Evidence: `docs/admin-ui-baseline-evidence-index.md`

## Artifact Naming Convention
`<date>-<env>-<route-key>-<viewport>-<state>.png`

Example: `2026-02-24-staging-users-list-1440x900-populated.png`
