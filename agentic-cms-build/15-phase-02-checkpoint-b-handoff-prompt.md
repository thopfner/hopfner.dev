# Phase 2 Checkpoint B Handoff Prompt

## Status

Checkpoint A is approved after the auth-boundary fix.

Approved baseline from Checkpoint A:
- job tables, run tables, log tables, and admin-only job APIs exist
- the direct authenticated RPC/table access bug was fixed
- focused Phase 2 tests passed on the live VPS repo
- live repo `npm test` passed
- live repo `npm run build` passed

Do not re-open Checkpoint A unless a true blocker is found while implementing the worker/runtime layer.

## Role

You are the coding agent implementing Checkpoint B only for Phase 2.

Your job is to add the local worker runtime, atomic queue-claim/transition support, restart-safe behavior, and deployment wiring for the synthetic no-op job flow.

You must stop for QA at the end of this checkpoint.
Do not start Phase 3.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/README.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/00-coding-agent-prompt.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/04-phase-02-local-worker.md`
4. `/var/www/html/hopfner.dev-main/agentic-cms-build/13-phase-02-handoff-prompt.md`
5. `/var/www/html/hopfner.dev-main/agentic-cms-build/15-phase-02-checkpoint-b-handoff-prompt.md`

Before editing:

1. run `git status --short`
2. inspect the approved Checkpoint A files and the current Docker/compose/deploy scripts
3. inspect `package.json` and `scripts/`
4. stop and report if the live repo differs materially from this prompt

## Scope

In scope:
- new migration(s) after `/var/www/html/hopfner.dev-main/supabase/migrations/20260327_agent_jobs.sql` if needed for atomic worker transitions
- `lib/agent/jobs/*` additions needed for worker lifecycle
- a directly runnable worker entrypoint under `/var/www/html/hopfner.dev-main/scripts/*`
- `/var/www/html/hopfner.dev-main/package.json`
- `/var/www/html/hopfner.dev-main/Dockerfile`
- `/var/www/html/hopfner.dev-main/docker-compose.yml`
- `/var/www/html/hopfner.dev-main/.env.example` if you add new non-secret worker env vars
- `/var/www/html/hopfner.dev-main/scripts/deploy-docker.sh` only if needed so deployment verification reflects the new worker service
- tests directly needed for the worker/runtime path

Out of scope:
- real CMS draft generation
- page/section/theme/media mutations by the worker
- model-provider integration
- admin UI workspace
- public worker endpoints
- Phase 3 orchestration

## Hard Rules

- The worker must process only the synthetic `site_build_noop` job kind.
- The worker must not perform real CMS mutations.
- Queue claim must be atomic on the DB side. Do not implement worker claim as client-side select-then-update.
- The runtime entrypoint must be directly runnable in the container without `ts-node`, `tsx`, or any new dev-only runtime.
- Because this repo does not currently ship a TS script runner in Docker, prefer a plain Node `.mjs` or `.js` worker entrypoint unless you add an explicit, production-safe compilation/copy path.
- The worker must have a one-shot mode for QA and container verification.
- The worker must not expose ports.
- Preserve the current web app container behavior.
- Do not start Phase 3.

## Files To Change, In Order

1. new migration(s) under `/var/www/html/hopfner.dev-main/supabase/migrations/*` for atomic worker transitions if required
2. `lib/agent/jobs/*` for worker-specific lifecycle helpers
3. new worker runtime files under `/var/www/html/hopfner.dev-main/scripts/*`
4. `/var/www/html/hopfner.dev-main/package.json`
5. `/var/www/html/hopfner.dev-main/Dockerfile`
6. `/var/www/html/hopfner.dev-main/docker-compose.yml`
7. `/var/www/html/hopfner.dev-main/.env.example` if needed
8. `/var/www/html/hopfner.dev-main/scripts/deploy-docker.sh` only if needed
9. tests for Checkpoint B

## Existing Constraints To Respect

- Admin APIs in Checkpoint A already rely on `getSupabaseAdmin()` and must keep working.
- The auth-boundary fix means the worker should also use the server-side service-role identity, not browser-authenticated clients.
- The repo already has TypeScript script files, but the Docker runtime does not currently include a TS executor. Do not ship a worker that only runs outside Docker.

## Required Worker Behavior

Implement the minimum production-safe Phase 2 worker behavior:

- poll for queued jobs
- atomically claim one queued job
- create or update the corresponding run row
- write logs for claim/start/finish/failure/cancel events
- execute a synthetic no-op handler only
- complete the job cleanly
- honor cancel requests for claimed/running jobs
- implement an explicit restart-recovery policy for stale claimed/running jobs

The restart-recovery policy must be deterministic and test-covered.

Preferred policy:
- stale claimed/running attempts are marked failed at the run level
- the job is either re-queued or canceled depending on cancel state
- recovery is invoked on startup and/or each poll cycle

If you choose a different policy, document it clearly and test it.

## Execution Plan

### Step 1: Atomic DB Support

Add any missing SQL helpers required for:
- claim next queued job atomically
- mark claimed -> running
- mark running -> completed
- mark running -> failed
- mark canceled
- append logs if needed
- recover stale claimed/running jobs if you choose DB-driven recovery

Prefer DB-side helpers for critical state transitions instead of multi-step client mutations.

Do not rewrite the approved Checkpoint A migration unless truly necessary.
Prefer adding a new migration after `20260327_agent_jobs.sql`.

### Step 2: Shared Worker Lifecycle Modules

Extend `lib/agent/jobs/*` with the shared logic needed by the worker/runtime path.

This layer should define:
- worker config parsing/defaults
- claim/transition helpers
- recovery behavior
- cancellation handling for the synthetic no-op flow

### Step 3: Directly Runnable Worker Entrypoint

Add a worker entrypoint under `scripts/` that is directly runnable in Docker.

Requirements:
- supports normal polling mode
- supports one-shot mode for QA
- emits clear logs
- exits non-zero on unexpected failures in one-shot mode
- uses env-driven config with safe defaults

### Step 4: Package Scripts and Runtime Wiring

Add any needed package script(s), for example a worker start command.

Update Dockerfile so the worker runtime files are actually present in the final image and executable there.

Update docker-compose with a `worker` service:
- no published ports
- same env file pattern as app
- restart policy suitable for a long-running local worker
- command explicitly runs the worker entrypoint

If deployment verification would otherwise ignore worker health entirely, update `scripts/deploy-docker.sh` so failures in the worker service are easier to detect.

### Step 5: Tests and Verification

Add or update tests that prove:
- atomic claim/transition behavior at the module boundary
- cancel handling for queued and running/claimed flows
- stale-job recovery behavior
- one-shot worker behavior for the synthetic no-op path

Prefer behavior/contract tests over source-inspection-only tests.

## Required Checks

- targeted eslint on all new/changed Phase 2 runtime files
- targeted Vitest for the new worker/runtime tests
- `npm test`
- `npm run build`
- `docker compose config`

If the environment safely allows it, also run:
- `docker compose build`
- a one-shot worker invocation that exits cleanly when no queued jobs exist, or processes exactly one synthetic job and exits

Report clearly which of those optional checks you actually ran.

## Stop And Report Immediately If

- safe atomic claim/recovery requires a larger architectural change than Phase 2 allows
- the worker cannot be made directly runnable in Docker without introducing a new unsupported runtime toolchain
- deployment wiring would break the existing app container behavior
- implementing recovery would force real Phase 3 orchestration behavior

## Required Reporting At Stop

When you stop, report:
- exact files changed
- exact new migration(s) and DB helpers added
- exact worker entrypoint path and how it runs
- exact restart-recovery policy implemented
- exact cancel behavior implemented
- exact Docker/compose/deploy changes
- exact tests run
- explicit confirmation that only `site_build_noop` is executable
- explicit confirmation that no Phase 3 work was started

## Completion Condition For Checkpoint B

Checkpoint B is complete only when:
- the worker can claim and complete a synthetic no-op job
- cancel behavior is explicit and test-covered
- restart-safe recovery behavior is explicit and test-covered
- the worker runtime is directly runnable in Docker
- Docker/compose wiring is in place for app + worker
- required checks pass
- you stop for QA without starting Phase 3
