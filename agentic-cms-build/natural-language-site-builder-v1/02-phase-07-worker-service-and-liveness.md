# Phase 7: Worker Service And Liveness

## Goal

Turn the existing worker runtime into a real managed service on the VPS and expose truthful worker liveness in `/admin/agent`.

This phase is operationally mandatory. Do not start natural-language planner work before it is complete.

## Why This Phase Exists

The current repo can enqueue jobs, but the live host does not have an always-on worker service.

This phase closes the gap between "agent features exist in code" and "the product can actually process jobs reliably."

## Files To Change, In Order

1. new or updated migration(s) under `/var/www/html/hopfner.dev-main/supabase/migrations/*` for worker heartbeat or liveness state, if needed
2. `/var/www/html/hopfner.dev-main/lib/agent/jobs/types.ts`
3. `/var/www/html/hopfner.dev-main/lib/agent/jobs/constants.ts`
4. `/var/www/html/hopfner.dev-main/lib/agent/jobs/service.ts`
5. `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts`
6. `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-runtime.ts`
7. `/var/www/html/hopfner.dev-main/app/admin/api/agent/status/route.ts`
8. `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
9. new repo-managed worker-service install and verify scripts under `/var/www/html/hopfner.dev-main/scripts/*`
10. new repo-managed systemd unit template or install helper under `/var/www/html/hopfner.dev-main/scripts/*` or `/var/www/html/hopfner.dev-main/ops/systemd/*`
11. tests for worker liveness, status reporting, and service-install verification

## Source Workflows And Files To Reuse

- existing worker entrypoint: `/var/www/html/hopfner.dev-main/scripts/agent-worker.ts`
- existing worker config and status surface:
  - `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-config.ts`
  - `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts`
- existing systemd hotfix scripts:
  - `/var/www/html/hopfner.dev-main/scripts/verify-live-systemd-runtime.sh`
  - `/var/www/html/hopfner.dev-main/scripts/restart-live-systemd-runtime.sh`
- existing admin workspace:
  - `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`

## Required Behavior

- the worker runs as a supervised service on this VPS
- the admin workspace can distinguish:
  - config valid but service offline
  - service online and fresh
  - service stale
- the worker emits a liveness signal at startup and during polling
- operator-visible status is based on live liveness, not config alone
- service-install and service-verify behavior are committed to the repo

## Required Design Choices

- Use systemd for the live runtime on this host.
- Keep Docker support intact but do not treat it as the primary live path.
- Use one deterministic worker service name and document it in the scripts and notes.
- Do not require the operator to hand-run `npm run worker:start` in a shell.

## Checkpoint A

### Goal

Worker liveness truth exists in the data model, runtime, API, and admin workspace.

### Required Before Stopping

- add a durable worker liveness mechanism
- update the worker runtime to refresh liveness on startup and on each poll cycle
- update the status API to report at least:
  - `worker.configured`
  - `worker.serviceInstalled`
  - `worker.online`
  - `worker.stale`
  - `worker.lastHeartbeatAt`
  - `worker.workerId`
- update `/admin/agent` to render those fields clearly
- add tests for heartbeat freshness and API/UI status mapping

### Hard Stop

- stop here and wait for QA approval
- do not install or activate the real systemd worker service before approval

## Checkpoint B

### Goal

The systemd worker service is installed, enabled, running, and verifiable on the live host.

### Required Before Stopping

- add repo-managed install and verify scripts for the worker service
- install the service on this VPS
- enable and start the service
- verify service status through systemd
- verify the worker heartbeat becomes fresh after startup
- verify `/admin/agent` and the status API report the worker as online
- add tests for script syntax and any helper logic that is unit-testable
- update the runtime notes if the live deploy path needs clarification

### Hard Stop

- stop here for full Phase 7 QA
- do not start natural-language planner work

## What Must Not Change In This Phase

- do not add natural-language planner behavior
- do not replace the current `site_build_draft` apply path
- do not widen the admin workspace beyond worker readiness and liveness reporting
- do not change publish behavior

## Required Checks

At Checkpoint A:

- targeted tests for liveness/runtime/status behavior
- targeted eslint on changed worker and status files

At Checkpoint B:

- targeted tests for service helpers
- `npm test`
- `npm run build`
- live systemd verification commands
- live status API verification

## Gate For Moving Forward

Do not proceed until all of the following are true:

- the worker is no longer a manual shell process requirement
- the repo contains the worker service install and verify path
- `/admin/agent` can truthfully report online or offline worker state
- the coding agent confirms that natural-language planner work has not started

