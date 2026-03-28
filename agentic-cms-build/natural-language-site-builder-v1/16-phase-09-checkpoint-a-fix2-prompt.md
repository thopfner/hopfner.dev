# Phase 9 Checkpoint A Fix Prompt 2

## Status

The first enforcement fix is not approved.

The generic enqueue route now blocks handcrafted reviewed-plan payloads, which is good.
But the dedicated reviewed-plan apply path is now broken by the same guard.

## Blocking Regression To Fix

In the live repo:

- `enqueueAgentJob()` now rejects any `site_build_draft` payload that contains reviewed-plan fields:
  `/var/www/html/hopfner.dev-main/lib/agent/jobs/service.ts`
- specifically at:
  - line 124 to line 126
- `createReviewedPlanApplyJob()` still builds the reviewed payload and then calls `enqueueAgentJob()`:
  - line 172 to line 176 in the same file

That means the dedicated audited path now rejects itself.

The route tests did not catch this because the reviewed-plan route test still mocks the service boundary instead of exercising the real `createReviewedPlanApplyJob()` logic.

## Role

You are fixing this regression only.

You must stop again for QA after this fix.
Do not start Phase 9 Checkpoint B.
Do not widen scope into Phase 10.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/00-coding-agent-prompt.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/04-phase-09-review-ux-and-apply-reviewed-plan.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/15-phase-09-checkpoint-a-fix-prompt.md`
4. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/16-phase-09-checkpoint-a-fix2-prompt.md`

Then inspect:

1. `/var/www/html/hopfner.dev-main/lib/agent/execution/reviewed-apply.ts`
2. `/var/www/html/hopfner.dev-main/lib/agent/jobs/service.ts`
3. `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/route.ts`
4. `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/apply-reviewed/route.ts`
5. `/var/www/html/hopfner.dev-main/tests/admin-api-agent-jobs.test.ts`
6. `/var/www/html/hopfner.dev-main/tests/agent-reviewed-apply.test.ts`

## Required Fix

Keep both of these true at the same time:

1. generic `POST /admin/api/agent/jobs` rejects handcrafted reviewed-plan apply payloads
2. the dedicated `/admin/api/agent/jobs/[jobId]/apply-reviewed` path still succeeds through the real service layer

Preferred shape:

- central enforcement still exists
- but the audited service-created reviewed-plan payload has an intentional internal path through that enforcement

Do not remove the generic-route protection.
Do not move the protection into the UI only.

## Test Gap To Close

Add a real service-level proof for the dedicated path.

Minimum required proof:

- a test for `createReviewedPlanApplyJob()` using a fake/stub Supabase client
- it must show:
  - a completed plan-only source job is loaded
  - the dedicated service path succeeds
  - the resulting enqueued payload still references the reviewed source job
- keep or update the route test for generic enqueue rejection

## Requirements

- preserve the generic reviewed-plan rejection for the normal jobs route
- preserve the dedicated reviewed-plan route behavior
- do not rerun the planner provider during reviewed-plan apply
- do not widen the worker contract or UI scope

## Required Checks

- targeted eslint on changed files
- `npx vitest run tests/admin-api-agent-jobs.test.ts tests/agent-reviewed-apply.test.ts tests/agent-draft-job-handler.test.ts`
- `npm test`
- `npm run build`

## Required Reporting

When you stop, report:

- exact files changed
- exact enforcement strategy used to allow only the audited service path
- exact new service-level proof added
- exact tests run
- confirmation that Phase 9 Checkpoint B was not started

## Completion Condition

This second fix is complete only when:

- handcrafted reviewed-plan payloads are still rejected by the generic jobs route
- the dedicated audited reviewed-plan apply service path works again
- there is a real service-level test proving that path
- the live repo passes `npm test` and `npm run build`
- you have stopped again for QA
