# Phase 10 Checkpoint B Handoff Prompt

## Status

Phase 10 Checkpoint A has passed QA on the live VPS repo.

Approved baseline from Phase 10 Checkpoint A:

- v1 request caps, refusal paths, provider-readiness state, and busy-state messaging are in place
- `/admin/agent` is natural-language first
- reviewed-plan apply remains deterministic and does not rerun the planner
- the worker service is installed and online on this host
- live repo `npm test` passed
- live repo `npm run build` passed

Two operational facts on this host must shape this checkpoint:

1. live traffic is still served by systemd service `hopf.thapi.cc.service`
2. any `npm run build` rewrites `.next`, so you must restart the live app service before trusting browser QA

Do not re-open earlier phases unless a true launch blocker is found while executing this checkpoint.

## Role

You are the coding agent implementing Phase 10 Checkpoint B only for `hopfner.dev-main`.

Your job is to complete the final launch gate:

- close any remaining launch blockers uncovered during verification
- prove the live worker and live app runtime are healthy
- prove the `/admin/agent` workflow works end to end with natural language, reviewed apply, visual-editor review, generated media, and rollback
- update the launch/runtime notes so they match the real host

You must stop for QA when Checkpoint B is complete.
Do not widen the feature set beyond v1.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/project_overview_v1/README.md`
2. `/var/www/html/hopfner.dev-main/project_overview_v1/01-system-overview.md`
3. `/var/www/html/hopfner.dev-main/project_overview_v1/02-cms-and-rendering-model.md`
4. `/var/www/html/hopfner.dev-main/project_overview_v1/03-admin-and-editor-surfaces.md`
5. `/var/www/html/hopfner.dev-main/project_overview_v1/04-working-notes-for-new-sessions.md`
6. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/README.md`
7. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/00-coding-agent-prompt.md`
8. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/05-phase-10-hardening-and-launch-gate.md`
9. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/06-final-qa-and-review-gates.md`
10. `/var/www/html/hopfner.dev-main/agentic-cms-build/31-phase-06-runtime-deploy-notes.md`
11. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/21-phase-10-checkpoint-b-handoff-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect:
   - `/var/www/html/hopfner.dev-main/scripts/restart-live-systemd-runtime.sh`
   - `/var/www/html/hopfner.dev-main/scripts/verify-live-systemd-runtime.sh`
   - `/var/www/html/hopfner.dev-main/scripts/verify-live-agent-worker-service.sh`
   - `/var/www/html/hopfner.dev-main/scripts/deploy-docker.sh`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/*`
   - `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
   - `/var/www/html/hopfner.dev-main/tests/admin-agent-workspace.test.tsx`
3. stop and report if the live repo materially differs from this prompt

## Scope

In scope:

- final launch-gate verification
- narrow fixes for confirmed launch blockers only
- worker-service verification on the live host
- live app runtime verification on the real systemd path
- browser/manual QA of the full natural-language draft workflow
- launch/runtime note cleanup
- any remaining ops-safety fixes required for launch

Out of scope:

- any new feature work
- auto-publish
- custom section-schema creation
- new agent providers
- multi-tenant control plane
- replacing the systemd runtime model

## Hard Rules

- keep v1 constrained to existing section types and existing theme controls
- do not add auto-publish
- do not add custom section-schema creation
- do not weaken rollback, idempotency, or reviewed-plan apply guarantees
- do not expose raw provider secrets in UI, API responses, logs, temp files, or docs
- use natural-language prompting for the launch-gate workflow proof; do not rely on JSON as the primary proof
- if you run `npm run build`, you must realign the live systemd app runtime before claiming completion
- do not call this checkpoint complete without browser/manual QA evidence unless an explicit environment blocker prevented it

## Execution Order

### 1. Verification First

Run the final repo and host checks before changing files:

- targeted eslint only if you already know which files are in play
- `npm test`
- `npm run build`
- `sudo bash scripts/verify-live-agent-worker-service.sh`

Then immediately realign the live app runtime because this host serves traffic through systemd:

- `sudo bash scripts/restart-live-systemd-runtime.sh`
- `sudo bash scripts/verify-live-systemd-runtime.sh`

Do not trust browser QA until the restart-and-verify step above passes.

### 2. Browser / Manual QA Proof

Use the real authenticated admin surface if available in this environment.

You must attempt this flow:

1. open `https://hopf.thapi.cc/admin/agent`
2. confirm worker status is online and configured
3. confirm planner readiness is truthful
4. submit a natural-language `Plan Only` job using a temporary page slug that is safe to roll back
5. inspect the stored plan and planner metadata
6. queue `Apply Reviewed Plan`
7. wait for the apply job to complete
8. open the touched page in the visual editor
9. confirm the draft content rendered through the existing visual-editor surface
10. confirm the temporary page shows as unpublished / draft-bearing in the existing admin read path
11. perform rollback from the apply job
12. confirm rollback cleaned up the temporary draft changes

### 3. Generated Image Proof

The launch-gate flow must include one generated background image request if `GEMINI_API_KEY` is configured.

Use a small controlled brief:

- one temporary page only
- one hero section with one generated background image request
- one or two additional simple sections
- no publish request

If the provider is intentionally unconfigured on this host, stop and report that launch-gate proof is blocked by environment readiness. Do not fake this proof.

### 4. Fix Only Confirmed Launch Blockers

If verification or browser/manual QA exposes a real blocker:

- make the narrowest possible fix
- preserve all approved Phase 7 to Phase 10A behavior
- rerun the affected tests
- rerun `npm test`
- rerun `npm run build`
- rerun:
  - `sudo bash scripts/verify-live-agent-worker-service.sh`
  - `sudo bash scripts/restart-live-systemd-runtime.sh`
  - `sudo bash scripts/verify-live-systemd-runtime.sh`

### 5. Update Notes

Before stopping, ensure the launch/runtime notes match the actual live host:

- systemd app runtime is the real traffic-serving path on this host
- worker service verification path is accurate
- any Docker path caveats are truthful
- any deployment-script secret-handling risks uncovered in this checkpoint are fixed or explicitly reported as blockers

## Required Test Brief

Use a natural-language brief that is easy to verify and easy to roll back.

Required characteristics:

- one temporary page with an explicit temporary slug
- hero section
- FAQ or steps section
- final CTA
- one generated background image request for the hero
- explicit draft-only intent

Do not use the existing live home page for this proof.

## Files To Change, In Order

Touch files only if a real launch blocker is confirmed.

Preferred order if changes are needed:

1. `/var/www/html/hopfner.dev-main/scripts/*`
2. `/var/www/html/hopfner.dev-main/app/admin/api/agent/*`
3. `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
4. `/var/www/html/hopfner.dev-main/lib/agent/*`
5. `/var/www/html/hopfner.dev-main/.env.example`
6. `/var/www/html/hopfner.dev-main/agentic-cms-build/31-phase-06-runtime-deploy-notes.md`
7. tests covering the exact blocker

Do not touch unrelated CMS/editor/admin surfaces in this checkpoint.

## What Must Not Change

- no auto-publish
- no custom section-schema creation
- no public worker ingress
- no direct prompt-to-database writes
- no weakening of reviewed-plan apply, rollback, or idempotency
- no regression of the existing visual editor or pages overview surfaces

## Required Checks Before Stopping

- `npm test`
- `npm run build`
- `sudo bash scripts/verify-live-agent-worker-service.sh`
- `sudo bash scripts/restart-live-systemd-runtime.sh`
- `sudo bash scripts/verify-live-systemd-runtime.sh`
- browser/manual QA evidence for:
  - public site still renders
  - `/admin/agent` can plan from natural language
  - reviewed-plan apply works
  - touched page opens in the visual editor
  - rollback works
  - generated background image path works if provider is configured

## Stop And Report Immediately If

- authenticated browser/manual QA is unavailable in this environment
- the worker-service verification fails on the live host
- the app-runtime verification fails after restart
- generated image proof is blocked by missing provider config
- a launch blocker would require widening beyond v1 scope

## Required Reporting

When you stop, report:

- exact files changed
- exact verification commands run
- exact browser/manual QA steps completed
- the exact natural-language brief used for launch proof
- whether generated image proof succeeded
- whether rollback proof succeeded
- whether any launch/runtime notes were updated
- exact blockers or caveats
- confirmation that no v1 scope violations were introduced

## Completion Condition

Checkpoint B is complete only when:

- final repo test/build gates pass
- worker-service verify passes on the live host
- live app runtime is restarted and verified on the real systemd path
- natural-language brief -> reviewed-plan apply -> visual-editor review -> rollback is proven
- generated-image proof is completed or explicitly blocked by host config
- launch/runtime notes are truthful
- you have stopped for final QA
