# Phase 2 Checkpoint A Fix Prompt

## QA Outcome

Checkpoint A is not approved yet.

One blocking issue was found in the Phase 2 schema/auth design.

## Blocking Issue

In `/var/www/html/hopfner.dev-main/supabase/migrations/20260327_agent_jobs.sql`:

- `public.agent_enqueue_job(...)` is `security definer`
- `public.agent_cancel_job(...)` is `security definer`
- both functions are granted to the broad `authenticated` role
- neither function currently enforces `public.is_admin()` internally

That means any authenticated user could call these RPCs directly through Supabase and enqueue or cancel agent jobs outside the guarded admin APIs.

This violates the intended trust boundary for Phase 2.

## Role

You are fixing Checkpoint A only.

Do not start Checkpoint B.
Do not add the worker runtime.
Do not edit Dockerfile or docker-compose.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/04-phase-02-local-worker.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/13-phase-02-handoff-prompt.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/14-phase-02-checkpoint-a-fix-prompt.md`

## Scope

In scope:
- `/var/www/html/hopfner.dev-main/supabase/migrations/20260327_agent_jobs.sql`
- Phase 2 tests only if needed to reflect the fixed trust boundary

Out of scope:
- worker runtime
- deployment wiring
- new APIs
- Phase 3 work

## Required Fix

Tighten the direct DB/RPC surface so the new job system is not callable by arbitrary authenticated users.

Preferred solution:
- keep job creation/cancel as server/API-owned surfaces for now
- do not grant direct execute on the `security definer` functions to `authenticated`
- do not leave unnecessary direct table write grants in place for `authenticated` unless they are truly required by approved Phase 2 scope

Acceptable alternative only if truly necessary:
- if you keep execute grants to `authenticated`, then both functions must enforce admin authorization internally using the live DB admin check mechanism

## Constraints

- Preserve the current admin API behavior.
- Preserve the current synthetic no-op Phase 2 scope.
- Do not widen the browser-side write surface.
- Do not start Checkpoint B work.

## Required Checks

- `npx eslint app/admin/api/agent/jobs/route.ts "app/admin/api/agent/jobs/[jobId]/route.ts" "app/admin/api/agent/jobs/[jobId]/cancel/route.ts" lib/agent/jobs/*.ts tests/agent-job-lifecycle.test.ts tests/admin-api-agent-jobs.test.ts`
- `npx vitest run tests/agent-job-lifecycle.test.ts tests/admin-api-agent-jobs.test.ts`
- `npm run build`

If you adjust only the migration and no TypeScript behavior changes are needed, still run the checks above and report that the fix is schema/auth-boundary only.

## Required Reporting At Stop

When you stop, report:
- exact lines of the auth-boundary fix
- whether direct function execute grants were removed or internal admin checks were added
- whether direct table grants were narrowed
- exact tests run
- explicit confirmation that Checkpoint B work was not started

## Stop Condition

Stop again for QA as soon as the Checkpoint A auth-boundary fix is complete.
