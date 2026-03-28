# Phase 6 Checkpoint B Handoff Prompt

## Status

Phase 6 Checkpoint A is approved on the live VPS repo.

Approved and already in place:

- local worker runtime exists
- `site_build_draft` supports plan-only and apply mode
- admin workspace for create/track/review/cancel/rollback exists
- generated background images can be provider-backed, stored in the media library, and attached to draft sections through `backgroundMediaUrl`
- runtime hardening now covers concurrency, retry/cancel state, provider config surfacing, and explicit v1 scope status in `/admin/agent`
- live repo targeted Phase 6A tests passed
- live repo `npm test` passed
- live repo `npm run build` passed

Do not reopen Checkpoint A unless a true blocker is discovered while finishing Checkpoint B.

## Role

You are the coding agent implementing Phase 6 Checkpoint B only for `hopfner.dev-main`.

Your job is to complete the final deployment hardening and ship gate proof for the local-worker product surface.

You must stop for QA at the end of this checkpoint.
Do not continue into post-v1 scope.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/README.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/00-coding-agent-prompt.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/08-phase-06-hardening-and-ship-gate.md`
4. `/var/www/html/hopfner.dev-main/agentic-cms-build/28-phase-06-handoff-prompt.md`
5. `/var/www/html/hopfner.dev-main/agentic-cms-build/30-phase-06-checkpoint-b-handoff-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect these live reuse points:
   - `/var/www/html/hopfner.dev-main/.env.example`
   - `/var/www/html/hopfner.dev-main/docker-compose.yml`
   - `/var/www/html/hopfner.dev-main/scripts/deploy-docker.sh`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/status/route.ts`
   - `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-config.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-runtime.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts`
3. stop and report if the live repo materially differs from this prompt

## Hard Rules

- Do not add auto-publish.
- Do not add custom section schema creation.
- Do not add public worker ingress.
- Do not replace the current human publish workflow.
- Keep customer/provider secrets server-side only.
- Keep the admin workspace honest about runtime state and v1 limits.
- Do not widen into Phase 7 or new product features.

## Goal

Complete final deployment hardening and ship gate proof.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/.env.example`
2. `/var/www/html/hopfner.dev-main/docker-compose.yml`
3. `/var/www/html/hopfner.dev-main/scripts/deploy-docker.sh`
4. deployment/runtime docs if needed under `/var/www/html/hopfner.dev-main/agentic-cms-build/`
5. final regression tests across worker/workspace/media/runtime

## Required Behavior

1. Deployment docs/config clearly cover app + worker + provider env assumptions.
2. Runtime validation makes missing or invalid config visible before silent failure.
3. Final regression coverage proves prior phase gates still hold.
4. Final reporting includes:
   - explicit v1 non-goals still out of scope
   - remaining operational risks
   - exact deployment/runtime assumptions
5. If you add any operator-facing deployment guidance, keep it aligned with the real compose/deploy behavior in the repo.

## Required Checks

- targeted eslint on all changed Phase 6B files
- targeted Vitest for any new deployment/runtime validation coverage
- `npm test`
- `npm run build`
- deployment/runtime verification for app + worker
  - at minimum `docker compose config`
  - and any additional non-destructive verification you can run honestly in this environment

## Required Reporting When You Stop

- exact files changed
- exact deployment/runtime assumptions
- exact validation or deploy checks added
- exact tests run
- explicit remaining operational risks
- explicit confirmation that v1 non-goals remain out of scope
- explicit statement whether you were able to perform real worker/runtime verification or only config/static verification

## Hard Stop

- stop here for final QA
- do not start any post-v1 scope
