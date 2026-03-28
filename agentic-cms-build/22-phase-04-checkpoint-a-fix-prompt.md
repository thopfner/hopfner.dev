# Phase 4 Checkpoint A Fix Prompt

## QA Outcome

Checkpoint A is not approved yet.

One blocking issue was found in the new rollback API contract.

## Blocking Issue

In `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/rollback/route.ts`:

- the route loads job detail and checks the Phase 3 result shape
- but it does **not** verify that `detail.job.status === "completed"`

The approved Checkpoint A contract required rollback to be available only for:

- completed
- apply-mode
- Phase 3 jobs
- with a valid `rollbackSnapshotId`

The current route allows rollback whenever the job result contains an applied Phase 3 payload, even if the job status is still `running`, `failed`, or `canceled`.

That is a real contract mismatch and opens a race window between:

- the worker writing `result.phase3.applyState = "applied"`
- and the job status transition to `completed`

## Role

You are fixing Checkpoint A only.

Do not start Checkpoint B.
Do not build the full workspace UI yet.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/21-phase-04-handoff-prompt.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/22-phase-04-checkpoint-a-fix-prompt.md`

## Scope

In scope:

- `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/rollback/route.ts`
- `/var/www/html/hopfner.dev-main/tests/admin-api-agent-rollback.test.ts`

Out of scope:

- workspace UI
- status API changes
- Phase 4 Checkpoint B work

## Required Fix

Tighten the rollback route so it requires the full approved contract:

- `detail.job.status === "completed"`
- Phase 3 result is apply-mode
- `applyState === "applied"`
- `rollbackSnapshotId` is present

Return the same 400-class rejection shape for jobs that do not meet that contract.

## Required Tests

Add or update tests so they prove:

- completed apply-mode jobs still succeed
- plan-only jobs still fail
- non-completed jobs with an otherwise valid applied Phase 3 result now fail with 400

## Required Checks

- `npx eslint app/admin/api/agent/jobs/[jobId]/rollback/route.ts tests/admin-api-agent-rollback.test.ts`
- `npx vitest run tests/admin-api-agent-rollback.test.ts`
- `npm run build`

## Required Reporting At Stop

When you stop, report:

- exact lines changed
- exact rollback gate enforced
- exact tests run
- explicit confirmation that Checkpoint B work was not started

## Stop Condition

Stop again for QA as soon as the rollback API enforces the completed-job requirement and the build passes.
