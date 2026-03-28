# Phase 2 Handoff Prompt

## Status

Phase 1 has passed QA on the live VPS repo.

Approved baseline from Phase 1:
- shared CMS payload and command extraction is complete
- page list, section editor, visual editor, theme preset, and media-upload rewires are complete
- live repo `npm test` passed with `599/599`
- live repo `npm run build` passed

Do not re-open Phase 1 work unless a true blocker is discovered while implementing Phase 2.

## Role

You are the coding agent implementing Phase 2 only for `hopfner.dev-main`.

Your job is to add the per-deployment local worker runtime, job persistence model, admin-only job APIs, and deployment wiring without performing any real CMS mutations yet.

You must stop for QA at every checkpoint in this document.
Do not continue past a checkpoint until the reviewer explicitly tells you to proceed.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/README.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/00-coding-agent-prompt.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/01-architecture-decisions.md`
4. `/var/www/html/hopfner.dev-main/agentic-cms-build/02-root-cause-and-blockers.md`
5. `/var/www/html/hopfner.dev-main/agentic-cms-build/04-phase-02-local-worker.md`
6. `/var/www/html/hopfner.dev-main/agentic-cms-build/13-phase-02-handoff-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect the live deployment/runtime files named below
3. inspect the current Supabase migration patterns and admin API route patterns
4. stop and report if the live repo materially differs from the roadmap assumptions

## Phase Scope

In scope:
- job tables / SQL helpers / migrations
- shared local-worker job modules under `lib/agent/jobs/*`
- admin-only job APIs under `app/admin/api/agent/*`
- worker entrypoint under `scripts/` or a clearly equivalent runtime path
- Docker and compose wiring for app + worker
- tests for job lifecycle and worker polling

Out of scope:
- real CMS draft generation
- page/section/theme/media mutation execution
- model-provider integration
- public worker routes
- Phase 3 orchestration or prompt-to-site drafting

## Hard Rules

- Use a synthetic no-op job type only in this phase.
- The worker must not perform real CMS mutations.
- Admin APIs must use `requireAdmin()`.
- Worker execution must use a server-side identity, not browser-session auth.
- Do not expose the worker publicly.
- Do not implement queue claiming as a race-prone client-side select-then-update flow.
- Prefer an atomic DB-side claim transition using SQL/RPC helpers if needed.
- Preserve the existing app runtime; do not break the current web deployment.
- Do not start Phase 3.

## Files To Change, In Order

1. new migration(s) under `/var/www/html/hopfner.dev-main/supabase/migrations/*`
2. new modules under `/var/www/html/hopfner.dev-main/lib/agent/jobs/*`
3. new admin routes under `/var/www/html/hopfner.dev-main/app/admin/api/agent/*`
4. new worker entrypoint under `/var/www/html/hopfner.dev-main/scripts/*`
5. `/var/www/html/hopfner.dev-main/Dockerfile`
6. `/var/www/html/hopfner.dev-main/docker-compose.yml`
7. new tests for Phase 2

## Existing Patterns To Reuse

- admin auth guard from `/var/www/html/hopfner.dev-main/lib/auth/require-admin.ts`
- server-side Supabase admin access from the existing server-admin pattern
- current admin route shape under `/var/www/html/hopfner.dev-main/app/admin/api/*`
- current deployment conventions from `/var/www/html/hopfner.dev-main/Dockerfile` and `/var/www/html/hopfner.dev-main/docker-compose.yml`

## Recommended API Shape

Unless the live repo strongly argues otherwise, use this route structure:
- `GET /admin/api/agent/jobs`
- `POST /admin/api/agent/jobs`
- `GET /admin/api/agent/jobs/[jobId]`
- `POST /admin/api/agent/jobs/[jobId]/cancel`

The detail route should be sufficient to read job status, latest run info, and logs without adding more surface in this phase.

## Recommended Phase 2 Job Model

Use the minimum model that safely supports Phase 2:
- jobs table
- runs table
- logs table

Add extra config/capability tables only if they are truly required by the Phase 2 contract.

The minimum job contract should include:
- `kind`
- `status`
- `requested_by`
- `payload`
- `created_at`
- `started_at`
- `finished_at`
- cancel metadata and failure metadata as needed

For Phase 2, keep the allowed job kind set to a single synthetic value such as `site_build_noop`.

## Execution Plan

### Step 1

Add the Phase 2 schema and the shared job lifecycle modules.

### Step 2

Add the admin-only API routes for enqueue, list, detail, and cancel.

### Step 3

Add a worker entrypoint that polls the queue, claims a queued job atomically, writes logs, executes a synthetic no-op handler, and completes or fails the run cleanly.

### Step 4

Package the worker in Docker and compose without exposing it publicly.

### Step 5

Add tests and run the required checks.

## Checkpoint A

Goal:
- schema, shared job modules, and admin APIs exist
- no worker runtime or deployment wiring yet

Required before stopping:
- add the Phase 2 job schema
- add shared job lifecycle logic under `lib/agent/jobs/*`
- add admin-only enqueue/list/detail/cancel routes
- keep the job kind synthetic/no-op only
- add tests for state transitions and route behavior

Hard stop:
- stop here and wait for QA approval
- do not start the worker entrypoint or Docker/compose changes before approval

## Checkpoint B

Goal:
- worker runtime and deployment wiring are complete
- Phase 2 is complete

Required before stopping:
- add the worker entrypoint
- prove queued job claim and no-op completion
- prove cancel behavior
- implement and document restart-safe handling for claimed/running jobs
- update Dockerfile and compose to support app + worker together
- add remaining tests
- run final Phase 2 checks

Hard stop:
- stop here for full Phase 2 QA
- do not start Phase 3 orchestration or real CMS mutations

## Required Behavior

- admin can enqueue a synthetic job
- admin can list jobs
- admin can read job detail including logs
- admin can cancel a queued job, and cancel behavior for running jobs is explicit and test-covered
- worker can claim and complete a synthetic no-op job
- worker restart does not silently orphan queue state
- deployment wiring supports app + worker together

## What Must Not Change In The Phase

- do not execute real CMS draft generation
- do not create or modify pages, sections, themes, or media as part of worker execution
- do not add model-provider credentials or provider adapters
- do not expose a public worker HTTP surface

## Required Checks

At Checkpoint A:
- targeted tests for new job modules and admin routes
- targeted eslint on new Phase 2 files

At Checkpoint B:
- targeted tests for worker lifecycle
- `npm test`
- `npm run build`
- `docker compose config`

If the environment safely allows it, also run a compose build for the updated app + worker runtime and report the result.

## Stop And Report Immediately If

- safe queue claiming requires a broader architectural change than Phase 2 allows
- the worker cannot be packaged without breaking the current app deployment model
- the live repo already contains a partial worker/job system that conflicts with this roadmap
- implementing cancel or restart-safe recovery would force real Phase 3 orchestration work

## Required Reporting At Every Checkpoint

When you stop, report:
- exact files changed
- exact migrations and DB helpers added
- exact tests run
- exact lifecycle states implemented
- exact deployment/runtime changes
- exact open risks or blockers
- exact reason you stopped

## Completion Condition For Phase 2

Phase 2 is complete only when:
- the job model exists
- admin-only job APIs exist
- the local worker can claim and complete a synthetic job
- cancel and restart-safe behavior are verified
- deployment wiring supports app + worker together
- tests and build pass
- you have stopped for QA without starting Phase 3
