# Phase 7 Checkpoint A Fix Prompt

## Status

Phase 7 Checkpoint A is not approved yet.

The targeted tests and live build passed, but QA found two correctness bugs in the new worker-liveness implementation.

You must fix only the issues below and stop again for QA.
Do not start Checkpoint B systemd install work.

## Confirmed QA Findings

### 1. `startedAt` is not stable across heartbeats

Current behavior:

- `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-runtime.ts`
  writes a startup liveness record with `startedAt`
- `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-runtime.ts`
  then calls `writeAgentWorkerLiveness()` during each iteration with only `heartbeatAt`
- `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts`
  defaults `startedAt` to `heartbeatAt` when it is omitted

Result:

- the recorded worker start time is overwritten on every heartbeat
- `/admin/agent` and `/admin/api/agent/status` report a false worker start time

This must be fixed.

### 2. Active jobs can be reported stale while the worker is legitimately running

Current behavior:

- liveness is refreshed before claim/recovery
- the worker then awaits the whole job handler
- no worker-liveness refresh happens while the handler is still executing

Result:

- any job that runs longer than `AGENT_WORKER_STALE_AFTER_MS` can make the worker appear stale even though it is actively processing work
- this is incompatible with the "truthful liveness" goal for `/admin/agent`

This must be fixed.

## Scope

In scope:

- `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts`
- `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-runtime.ts`
- `/var/www/html/hopfner.dev-main/app/admin/api/agent/status/route.ts` only if strictly needed
- `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx` only if strictly needed
- tests for the above

Out of scope:

- systemd service install or activation
- natural-language planner work
- broader admin-workspace redesign

## Required Fix Outcomes

1. `startedAt` remains the original worker start time across later heartbeat writes.
2. Worker liveness remains fresh while a long-running job is actively executing.
3. Existing idle-path and status-path behavior remains intact.

## Required Tests

Add or update tests proving all of the following:

- repeated heartbeat writes do not reset `startedAt`
- worker runtime preserves a stable `startedAt` after startup
- a simulated long-running job keeps worker liveness fresh instead of aging stale mid-run
- existing status API and workspace tests still pass if touched

## Required Checks

- targeted eslint on changed files
- targeted Vitest for the touched worker/status/workspace files
- `npm test`
- `npm run build`

## Hard Stop

Stop after the fix round and wait for QA.
Do not start Checkpoint B.

## Required Reporting

When you stop, report:

- exact files changed
- exact liveness behavior changed
- exact tests run
- exact proof that `startedAt` stays stable
- exact proof that active long-running jobs stay fresh
- confirmation that Checkpoint B was not started

