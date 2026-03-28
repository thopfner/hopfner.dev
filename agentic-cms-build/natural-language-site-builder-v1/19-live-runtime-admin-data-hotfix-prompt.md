# Live Runtime Admin Data Hotfix Prompt

## Status

This is a blocker hotfix that must be handled before Phase 10 Checkpoint A continues.

Do not start or continue Phase 10 work until this hotfix is complete and QA-approved.

## Confirmed Root Cause Evidence

The live host is in a mixed-build runtime state again.

Confirmed on the VPS:

- active service:
  - `hopf.thapi.cc.service`
  - `ActiveEnterTimestamp=Sat 2026-03-28 07:13:03 UTC`
- current on-disk build artifacts:
  - `.next/BUILD_ID` modified at `2026-03-28 11:13:43 UTC`
  - `.next/build-manifest.json` modified at `2026-03-28 11:13:26 UTC`
- live verifier failure:
  - `ERROR: asset check failed for https://hopf.thapi.cc/_next/static/chunks/webpack-5d08d9ef768eaff7.js -> 500`

This means the real traffic-serving systemd process is older than the current `.next` build output.

That is the same class of production drift that previously caused the frontend/admin runtime to look like a database failure even though the underlying CMS data still existed.

## Role

You are the coding agent executing a live-runtime alignment hotfix for `hopfner.dev-main`.

Your job is to restore a consistent live systemd runtime first, then verify whether the admin data-loading regression is resolved.

You must stop for QA after this hotfix.
Do not start Phase 10 work during this run.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/project_overview_v1/README.md`
2. `/var/www/html/hopfner.dev-main/project_overview_v1/01-system-overview.md`
3. `/var/www/html/hopfner.dev-main/project_overview_v1/02-cms-and-rendering-model.md`
4. `/var/www/html/hopfner.dev-main/project_overview_v1/03-admin-and-editor-surfaces.md`
5. `/var/www/html/hopfner.dev-main/project_overview_v1/04-working-notes-for-new-sessions.md`
6. `/var/www/html/hopfner.dev-main/agentic-cms-build/32-live-runtime-mismatch-review.md`
7. `/var/www/html/hopfner.dev-main/scripts/verify-live-systemd-runtime.sh`
8. `/var/www/html/hopfner.dev-main/scripts/restart-live-systemd-runtime.sh`
9. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/19-live-runtime-admin-data-hotfix-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect:
   - active systemd service status for `hopf.thapi.cc.service`
   - `.next/BUILD_ID` and `.next/build-manifest.json` timestamps
   - `/var/www/html/hopfner.dev-main/app/admin/(protected)/pages-list.tsx`
   - `/var/www/html/hopfner.dev-main/app/admin/api/pages/overview/route.ts`
3. stop and report if the live repo materially differs from this prompt

## Scope

In scope:

- restore live runtime consistency for the real traffic-serving systemd service
- verify public and admin runtime asset alignment
- verify whether `/admin/pages` data loading is restored after runtime alignment
- only if the issue remains after runtime alignment:
  - inspect and patch the narrow admin data-loading path

Out of scope:

- any new agent/CMS feature work
- Phase 10 hardening work
- Docker runtime migration
- broad admin refactors

## Hard Rules

- treat this as a production hotfix first, not a feature phase
- do not touch CMS data model or rendering logic unless runtime alignment alone fails to resolve the issue
- reuse the existing live-runtime restart and verify scripts first
- do not continue into Phase 10 after the hotfix
- if restart-only resolves the regression, keep code changes at zero or minimal documentation-only scope

## Required Execution Order

### 1. Reconfirm live mismatch

- capture current service start time
- capture current `.next` build timestamps
- run:
  - `sudo bash scripts/verify-live-systemd-runtime.sh`
- record the failure evidence

### 2. Restore live runtime consistency

- run:
  - `sudo bash scripts/restart-live-systemd-runtime.sh`
- confirm:
  - service restarted successfully
  - live verifier passes after restart

### 3. Verify the actual regression outcome

- verify public runtime still loads correctly
- verify `/admin/login` assets load correctly
- verify `/admin/pages` loads live DB-backed page rows again

If an authenticated admin browser session is available on this host, use it.
If not, state the limitation clearly and provide the exact non-browser evidence gathered.

### 4. Only if `/admin/pages` is still broken after restart

- inspect the narrow pages/admin data-loading path:
  - `/var/www/html/hopfner.dev-main/app/admin/(protected)/pages-list.tsx`
  - `/var/www/html/hopfner.dev-main/app/admin/api/pages/overview/route.ts`
  - auth/session guard path involved in that API
- implement the smallest viable code fix
- rerun:
  - targeted tests for pages/admin surface
  - `npm test`
  - `npm run build`
- restart the live systemd service again after any new build
- re-verify the live runtime and admin pages surface

## What Must Not Change

- do not widen scope into agent planner or worker features
- do not change Phase 10 scope in this run
- do not bypass admin auth
- do not introduce direct database hacks outside existing API/command surfaces

## Required Checks

Always run:

- `sudo bash scripts/verify-live-systemd-runtime.sh`
- `sudo bash scripts/restart-live-systemd-runtime.sh`
- `sudo systemctl status --no-pager hopf.thapi.cc.service`
- `sudo journalctl -u hopf.thapi.cc.service -n 80 --no-pager`

If code changes are required, also run:

- targeted tests for the changed admin/pages surface
- `npm test`
- `npm run build`
- then restart the live systemd runtime again

## Stop And Report Immediately If

- the restart script fails to produce a passing live-runtime verification
- the active production service is no longer `hopf.thapi.cc.service`
- admin data still fails after restart and the failure points outside the repo/runtime path into external platform or database availability

## Required Reporting

When you stop, report:

- exact commands run
- whether the hotfix was restart-only or required code changes
- exact files changed, if any
- exact before/after runtime evidence
- exact before/after `/admin/pages` outcome
- exact tests run
- exact remaining caveats
- confirmation that Phase 10 was not started

## Completion Condition

This hotfix is complete only when:

- the live systemd runtime is aligned with the current build output
- the live verifier passes
- `/admin/pages` loads correctly again, or a narrower remaining blocker is identified with evidence
- you have stopped for QA without starting Phase 10
