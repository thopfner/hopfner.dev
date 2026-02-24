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

## Checklist
- [ ] Route inventory finalized (canonical URL list).
- [ ] Test accounts prepared (admin/editor/read-only where applicable).
- [ ] Seed data or fixtures available for empty + populated states.
- [ ] Screenshot capture completed for each route × viewport × key state.
- [ ] Console/network error log snapshot captured for each priority route.
- [ ] Baseline performance note captured (initial render + key interaction latency).
- [ ] Accessibility quick scan recorded (focus order, labels, keyboard nav smoke).
- [ ] Artifact index generated (file paths + timestamp + environment).

## Artifact Naming Convention
`<date>-<env>-<route-key>-<viewport>-<state>.png`

Example: `2026-02-24-staging-users-list-1440x900-populated.png`
