# Phase 7 Handoff Prompt

## Status

Phase 1 to Phase 6 are complete in the live repo.

Confirmed live baseline:

- `/admin/agent` exists and can enqueue `site_build_draft`
- the draft apply and rollback pipeline already exists
- Gemini-backed generated media already exists
- the public and admin runtime mismatch hotfix is complete
- there is still no persistent worker service installed on this host
- the planner is still JSON-only under the free-text prompt field

Do not re-open earlier phases unless a true blocker is found while implementing Phase 7.

## Role

You are the coding agent implementing Phase 7 only for `hopfner.dev-main`.

Your job is to turn the current worker into a managed service and expose truthful worker liveness in `/admin/agent`.

You must stop for QA at every checkpoint in this document.
Do not continue past a checkpoint until the reviewer explicitly tells you to proceed.

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
11. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/07-phase-07-handoff-prompt.md`

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
3. inspect the live host service state before changing anything
4. stop and report if the live repo materially differs from this prompt

## Phase Scope

In scope:

- worker liveness and heartbeat truth
- status API and admin-workspace readiness/liveness reporting
- repo-managed install and verify path for the worker service
- actual worker-service installation on this VPS through systemd
- tests for the above

Out of scope:

- natural-language planner work
- planner-provider integration
- admin workspace redesign beyond worker readiness and liveness
- new CMS apply behavior
- public worker endpoints

## Hard Rules

- Use systemd as the live runtime path on this host.
- Keep Docker-related files working, but do not assume Docker is the active deployment path.
- Do not require the operator to keep a shell open for the worker.
- Do not start Phase 8 natural-language planner work.
- Keep the current `site_build_draft` behavior unchanged aside from worker liveness and service availability.

## Files To Change, In Order

1. migration(s) under `/var/www/html/hopfner.dev-main/supabase/migrations/*` only if needed for durable worker liveness
2. `/var/www/html/hopfner.dev-main/lib/agent/jobs/types.ts`
3. `/var/www/html/hopfner.dev-main/lib/agent/jobs/constants.ts`
4. `/var/www/html/hopfner.dev-main/lib/agent/jobs/service.ts`
5. `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts`
6. `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-runtime.ts`
7. `/var/www/html/hopfner.dev-main/app/admin/api/agent/status/route.ts`
8. `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
9. new or updated worker-service scripts under `/var/www/html/hopfner.dev-main/scripts/*`
10. tests for Phase 7

## Existing Workflows To Reuse

- worker entrypoint:
  `/var/www/html/hopfner.dev-main/scripts/agent-worker.ts`
- worker config and provider status:
  `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-config.ts`
  `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts`
- current systemd runtime verification:
  `/var/www/html/hopfner.dev-main/scripts/verify-live-systemd-runtime.sh`
  `/var/www/html/hopfner.dev-main/scripts/restart-live-systemd-runtime.sh`

## Checkpoint A

### Goal

Worker liveness truth exists in the runtime, status API, and admin workspace.

### Required Before Stopping

- add durable worker liveness tracking
- refresh liveness during worker startup and poll cycles
- expose truthful worker readiness fields in the status API
- render the worker state in `/admin/agent`
- add tests for worker liveness and status mapping

### Hard Stop

- stop here and wait for QA approval
- do not install or enable the real systemd worker service yet

## Checkpoint B

### Goal

The worker service is installed and verified on the live host.

### Required Before Stopping

- add repo-managed worker install and verify scripts
- install the worker service through systemd on this VPS
- enable and start the service
- verify the service is active through systemd
- verify worker heartbeat freshness after startup
- verify the status API and `/admin/agent` show the worker online
- run final Phase 7 checks

### Hard Stop

- stop here for full Phase 7 QA
- do not start Phase 8 natural-language planner work

## Required Checks

At Checkpoint A:

- targeted eslint on changed files
- targeted tests for liveness and status behavior

At Checkpoint B:

- targeted tests for worker-service helpers
- `npm test`
- `npm run build`
- live systemd verification commands and results

## Stop And Report Immediately If

- liveness cannot be made truthful without breaking current job processing
- the live host cannot safely run the worker under systemd with the current repo conventions
- the implementation would require sneaking in planner changes from Phase 8

## Required Reporting At Every Checkpoint

When you stop, report:

- exact files changed
- exact service name, scripts, and commands added
- exact liveness fields added to the status API and workspace
- exact tests run
- exact live systemd verification performed
- exact blockers or caveats
- confirmation that Phase 8 was not started

## Completion Condition For Phase 7

Phase 7 is complete only when:

- the worker no longer depends on a manual shell session
- the repo contains the worker-service install and verify path
- the live host is running the worker through systemd
- `/admin/agent` can truthfully show the worker as online
- you have stopped for QA without starting Phase 8

