# Phase 2: Local Worker Runtime

## Goal

Add the per-deployment local worker runtime, job persistence model, and deployment wiring without performing real CMS mutations yet.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/supabase/migrations/*` for job tables
2. new `lib/agent/jobs/*`
3. new `app/admin/api/agent/*`
4. new worker entrypoint under `scripts/` or equivalent runtime path
5. `/var/www/html/hopfner.dev-main/Dockerfile`
6. `/var/www/html/hopfner.dev-main/docker-compose.yml`
7. new tests for job lifecycle and worker polling

## Source Workflows / Files To Reuse

- admin auth guard from `/var/www/html/hopfner.dev-main/lib/auth/require-admin.ts`
- deployment conventions from `/var/www/html/hopfner.dev-main/Dockerfile` and `/var/www/html/hopfner.dev-main/docker-compose.yml`
- snapshot/job audit patterns already present elsewhere in the repo where helpful

## Step-By-Step Implementation

1. Add tables for jobs, runs, logs, and config/capability state as needed.
2. Add admin-only APIs to:
   - create a job
   - list jobs
   - read job detail/logs
   - cancel a queued or running job
3. Add a worker entrypoint that polls queued jobs and updates lifecycle state.
4. Keep worker execution limited to synthetic or no-op job handlers only in this phase.
5. Package the worker into deployment runtime and add compose wiring.
6. Add restart-safe status transitions and a clear failure state.

## Required Behavior

- Admin can enqueue a job.
- Worker can claim and complete a no-op job.
- Job status and logs are visible.
- Worker restart does not corrupt the queue.
- Deployment wiring supports app + worker together.

## What Must Not Change In The Phase

- Do not execute real CMS draft generation.
- Do not apply theme or page changes.
- Do not add media generation.
- Do not expose the worker publicly.

## Required Tests For The Phase

- new tests for job creation, claiming, completion, cancellation, and failure states
- deployment/runtime verification for app + worker
- `npm run test`
- `npm run build`

## Gate For Moving Forward

Do not proceed until:
- worker runtime is packaged and starts cleanly
- no-op job lifecycle is proven end-to-end
- queue recovery and cancel behavior are verified
- coding agent reports exact deployment/runtime changes

