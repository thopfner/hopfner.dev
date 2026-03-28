# Phase 6 Handoff Prompt

## Status

Phase 5 is approved on the live VPS repo.

Approved and already in place:

- local worker runtime exists
- `site_build_draft` supports plan-only and apply mode
- admin workspace for create/track/review/cancel/rollback exists
- generated background images can be provider-backed, stored in the media library, and attached to draft sections through `backgroundMediaUrl`
- live repo `npm test` passed
- live repo `npm run build` passed

Do not reopen Phases 1-5 unless a true blocker is discovered while implementing Phase 6.

## Role

You are the coding agent implementing Phase 6 only for `hopfner.dev-main`.

Your job is to harden the local-worker product surface for deployment and lock the v1 scope.

You must stop for QA at every checkpoint in this document.
Do not continue past a checkpoint until the reviewer explicitly tells you to proceed.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/README.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/00-coding-agent-prompt.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/08-phase-06-hardening-and-ship-gate.md`
4. `/var/www/html/hopfner.dev-main/agentic-cms-build/28-phase-06-handoff-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect these live reuse points:
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/lifecycle.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/service.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-runtime.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/route.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/cancel/route.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/(protected)/agent/page-client.tsx`
   - `/var/www/html/hopfner.dev-main/docker-compose.yml`
   - `/var/www/html/hopfner.dev-main/scripts/deploy-docker.sh`
   - `/var/www/html/hopfner.dev-main/.env.example`
3. stop and report if the live repo materially differs from this prompt

## Hard Rules

- Do not add auto-publish.
- Do not add custom section schema creation.
- Do not add public worker ingress.
- Do not replace the current human publish workflow.
- Keep customer/provider secrets server-side only.
- Keep the current admin workspace honest about v1 scope and current runtime state.

## Checkpoint A

### Goal

Harden runtime control surfaces: concurrency, retry/cancel safety, and operator-readable config/error state.

### Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/agent/jobs/lifecycle.ts`
2. `/var/www/html/hopfner.dev-main/lib/agent/jobs/service.ts`
3. `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts`
4. `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-runtime.ts`
5. `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/route.ts`
6. `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/cancel/route.ts`
7. `/var/www/html/hopfner.dev-main/app/admin/(protected)/agent/page-client.tsx` only if a small status/audit surface is truly needed
8. tests for retry/cancel/concurrency/config validation

### Required Behavior

1. Prevent uncontrolled parallel `site_build_draft` execution on a deployment.
2. Make retry behavior explicit and safe with the existing idempotency + snapshot model.
3. Make cancellation state explicit and operator-readable in the admin workspace/API surface.
4. Surface provider/worker config problems in a way that is readable to an operator without exposing secrets.
5. Keep v1 scope boundaries explicit in the workspace and runtime.

### Required Checks

- targeted eslint on all changed Phase 6A files
- targeted Vitest for retry/cancel/concurrency/config tests

### Hard Stop

- stop here for QA
- do not move to deployment/ship gate work yet

## Checkpoint B

### Goal

Complete final deployment hardening and ship gate proof.

### Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/.env.example`
2. `/var/www/html/hopfner.dev-main/docker-compose.yml`
3. `/var/www/html/hopfner.dev-main/scripts/deploy-docker.sh`
4. deployment/runtime docs if needed under `/var/www/html/hopfner.dev-main/agentic-cms-build/`
5. final regression tests across worker/workspace/media/runtime

### Required Behavior

1. Deployment docs/config clearly cover app + worker + provider env assumptions.
2. Runtime validation makes missing/invalid config visible before silent failure.
3. Final regression coverage proves prior phase gates still hold.
4. Final report includes:
   - explicit v1 non-goals still out of scope
   - remaining operational risks
   - exact deployment/runtime assumptions

### Required Checks

- `npm test`
- `npm run build`
- deployment/runtime verification for app + worker

### Hard Stop

- stop here for final QA
- do not start any post-v1 scope

## Required Reporting At Every Checkpoint

When you stop, report:

- exact files changed
- exact hardening controls added
- exact tests run
- exact deployment/runtime assumptions
- explicit remaining risks
- explicit confirmation that v1 non-goals remain out of scope

## Completion Condition For Phase 6

Phase 6 is complete only when:

- concurrency/retry/cancel/config hardening is in place
- deployment/runtime proof is complete
- prior phase behavior still passes regression checks
- tests and build pass
- you have stopped for final QA with a real risk list and unchanged v1 scope boundaries
