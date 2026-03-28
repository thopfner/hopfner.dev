# Phase 9 Checkpoint A Fix Prompt

## Status

Phase 9 Checkpoint A is close, but it is not approved yet.

The live VPS repo passes:

- targeted reviewed-plan tests
- `npm test`
- `npm run build`

Do not rework the broader Checkpoint A implementation.
This is a narrow backend-contract fix only.

## Blocking Finding To Fix

The reviewed-plan apply path is not fully backend-enforced.

Current problem:

- the dedicated reviewed-plan route exists:
  `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/apply-reviewed/route.ts`
- the audited payload builder exists:
  `/var/www/html/hopfner.dev-main/lib/agent/execution/reviewed-apply.ts`
- but the generic job enqueue route still accepts arbitrary `site_build_draft` payloads and passes them straight through:
  `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/route.ts`
- and the worker handler will trust any payload that contains:
  - `reviewedSourceJobId`
  - `reviewedPlan`
  - `reviewedPlanner`
  in:
  `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts`

Result:

- an admin caller can bypass the audited reviewed-plan apply route and enqueue a handcrafted reviewed-plan apply job directly through `POST /admin/api/agent/jobs`
- that weakens the Checkpoint A contract that reviewed-plan apply must come from a reviewed stored canonical plan and an audited source job

## Role

You are fixing this backend-enforcement gap only.

You must stop again for QA after this fix.
Do not start Phase 9 Checkpoint B UI work.
Do not widen scope into Phase 10.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/00-coding-agent-prompt.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/04-phase-09-review-ux-and-apply-reviewed-plan.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/14-phase-09-handoff-prompt.md`
4. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/15-phase-09-checkpoint-a-fix-prompt.md`

Then inspect:

1. `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/route.ts`
2. `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/apply-reviewed/route.ts`
3. `/var/www/html/hopfner.dev-main/lib/agent/jobs/service.ts`
4. `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts`
5. `/var/www/html/hopfner.dev-main/lib/agent/execution/reviewed-apply.ts`
6. `/var/www/html/hopfner.dev-main/tests/admin-api-agent-jobs.test.ts`
7. `/var/www/html/hopfner.dev-main/tests/agent-draft-job-handler.test.ts`
8. `/var/www/html/hopfner.dev-main/tests/agent-reviewed-apply.test.ts`

## Required Fix

Make the reviewed-plan apply contract backend-enforced, not just route-convention-based.

Acceptable solution shape:

- generic `POST /admin/api/agent/jobs` must reject handcrafted reviewed-plan apply payloads
- the only approved path for reviewed-plan apply should be the dedicated:
  `/admin/api/agent/jobs/[jobId]/apply-reviewed`
- the dedicated path should continue to build the apply payload from the stored completed plan-only source job

You may enforce this in the route layer, service layer, or both.
Prefer central enforcement over UI-only or convention-only enforcement.

## Requirements

- keep the existing dedicated reviewed-plan route working
- do not break normal:
  - plan-only draft jobs
  - natural-language draft apply jobs
  - legacy JSON fallback jobs
- do not rerun the planner provider during reviewed-plan apply
- do not widen the worker contract beyond this fix

## Tests Required

Add or update tests proving:

- `POST /admin/api/agent/jobs` rejects a handcrafted reviewed-plan apply payload
- the dedicated apply-reviewed route still succeeds
- the reviewed-plan worker path still does not call the planner provider

## Required Checks

- targeted eslint on changed files
- `npx vitest run tests/admin-api-agent-jobs.test.ts tests/agent-draft-job-handler.test.ts tests/agent-reviewed-apply.test.ts`
- `npm test`
- `npm run build`

## Required Reporting

When you stop, report:

- exact files changed
- exact enforcement strategy used
- exact rejection behavior for the generic enqueue route
- exact tests run
- confirmation that Phase 9 Checkpoint B was not started

## Completion Condition

This fix is complete only when:

- reviewed-plan apply cannot be enqueued through the generic jobs route
- the dedicated reviewed-plan route still works
- the live repo still passes `npm test` and `npm run build`
- you have stopped again for QA
