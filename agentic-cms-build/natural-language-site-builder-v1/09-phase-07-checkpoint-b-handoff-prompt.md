# Phase 7 Checkpoint B Handoff Prompt

## Status

Phase 7 Checkpoint A has passed QA on the live VPS repo.

Approved baseline from Checkpoint A:

- worker liveness is written and read through the repo-managed liveness record
- `startedAt` remains stable across later heartbeat writes
- the worker refreshes liveness while a long-running job handler is active
- `/admin/api/agent/status` exposes worker liveness fields
- `/admin/agent` renders worker readiness and liveness
- live repo `npm test` passed
- live repo `npm run build` passed

Do not re-open Checkpoint A unless a true blocker is found while implementing Checkpoint B.

## Role

You are the coding agent implementing Phase 7 Checkpoint B only for `hopfner.dev-main`.

Your job is to install and verify the worker as a managed systemd service on this VPS.

You must stop for QA when Checkpoint B is complete.
Do not start Phase 8 natural-language planner work.

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
8. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/01-architecture-and-root-cause.md`
9. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/02-phase-07-worker-service-and-liveness.md`
10. `/var/www/html/hopfner.dev-main/agentic-cms-build/31-phase-06-runtime-deploy-notes.md`
11. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/09-phase-07-checkpoint-b-handoff-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect:
   - `/var/www/html/hopfner.dev-main/scripts/agent-worker.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-runtime.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/status/route.ts`
   - `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
   - `/var/www/html/hopfner.dev-main/scripts/verify-live-systemd-runtime.sh`
   - `/var/www/html/hopfner.dev-main/scripts/restart-live-systemd-runtime.sh`
3. inspect the current live host service state before changing anything
4. stop and report if the live repo materially differs from this prompt

## Scope

In scope:

- repo-managed systemd worker install path
- repo-managed worker verify path
- actual worker-service installation on this VPS
- service enable/start/restart behavior
- status API and `/admin/agent` verification against the live running worker
- tests for any helper logic that is unit-testable
- runtime notes update only if needed for accuracy

Out of scope:

- natural-language planner work
- planner-provider integration
- wider `/admin/agent` redesign
- CMS apply behavior changes
- public worker ingress

## Hard Rules

- Use systemd as the live runtime path on this host.
- Keep Docker-related files working, but do not assume Docker is the active deployment path.
- Do not require the operator to keep a shell open for the worker.
- Do not start Phase 8 natural-language planner work.
- Keep the current `site_build_draft` behavior unchanged aside from worker service availability.
- Do not leak secrets into world-readable temp files or logs while adding install or verify scripts.

## Files To Change, In Order

1. new or updated worker-service scripts under `/var/www/html/hopfner.dev-main/scripts/*`
2. any repo-managed systemd unit template or install helper under `/var/www/html/hopfner.dev-main/scripts/*` or `/var/www/html/hopfner.dev-main/ops/systemd/*`
3. `/var/www/html/hopfner.dev-main/app/admin/api/agent/status/route.ts` only if strictly needed
4. `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx` only if strictly needed
5. tests for Checkpoint B helper logic
6. runtime notes only if needed

## Existing Workflows To Reuse

- worker entrypoint:
  `/var/www/html/hopfner.dev-main/scripts/agent-worker.ts`
- worker config and provider status:
  `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-config.ts`
  `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts`
- current systemd runtime verification:
  `/var/www/html/hopfner.dev-main/scripts/verify-live-systemd-runtime.sh`
  `/var/www/html/hopfner.dev-main/scripts/restart-live-systemd-runtime.sh`

## Required Before Stopping

- add repo-managed worker install and verify scripts
- install the worker service through systemd on this VPS
- enable and start the service
- verify the service is active through systemd
- verify worker heartbeat freshness after startup
- verify the status API reports the worker online and fresh
- verify `/admin/agent` reflects the live worker state
- add tests for helper logic where practical
- run final Phase 7 checks

## Required Checks

- targeted eslint on changed files
- targeted tests for worker-service helpers
- `npm test`
- `npm run build`
- live systemd verification commands and results
- live `/admin/api/agent/status` verification

## Stop And Report Immediately If

- the live host cannot safely run the worker under systemd with the current repo conventions
- the worker-service install path would require hardcoding secrets into files that should stay out of the repo
- the implementation would require sneaking in planner changes from Phase 8

## Required Reporting

When you stop, report:

- exact files changed
- exact service name, scripts, and commands added
- exact systemd install path used
- exact live verification commands and results
- exact status API and `/admin/agent` state after startup
- exact tests run
- exact blockers or caveats
- confirmation that Phase 8 was not started

## Completion Condition

Checkpoint B is complete only when:

- the worker no longer depends on a manual shell session
- the repo contains the worker-service install and verify path
- the live host is running the worker through systemd
- `/admin/api/agent/status` and `/admin/agent` both report the worker as online
- you have stopped for QA without starting Phase 8

