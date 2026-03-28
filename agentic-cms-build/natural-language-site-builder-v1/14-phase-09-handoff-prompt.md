# Phase 9 Checkpoint A Handoff Prompt

## Status

Phase 8 has passed QA on the live VPS repo.

Approved baseline from Phase 8:

- the worker service is installed and live on this host
- `/admin/agent` now defaults to a natural-language brief
- the live `site_build_draft` path can process both:
  - plain-English briefs
  - legacy JSON fallback prompts
- planner output still runs through canonical CMS validation
- plan-only and apply-requested modes both work
- live repo `npm test` passed
- live repo `npm run build` passed

Do not re-open Phase 8 unless a true blocker is found while implementing this checkpoint.

## Role

You are the coding agent implementing Phase 9 Checkpoint A only for `hopfner.dev-main`.

Your job is to add deterministic backend support for "apply reviewed plan" so an operator can review a stored canonical plan first, then apply that exact stored plan later without rerunning the planner provider.

You must stop for QA when Checkpoint A is complete.
Do not start Phase 9 Checkpoint B UI work.
Do not start Phase 10 hardening work.

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
9. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/04-phase-09-review-ux-and-apply-reviewed-plan.md`
10. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/14-phase-09-handoff-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect:
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/types.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/service.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/execution/apply-draft-plan.ts`
   - `/var/www/html/hopfner.dev-main/lib/agent/execution/idempotency.ts`
   - `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
3. stop and report if the live repo materially differs from this prompt

## Scope

In scope:

- backend contract for reviewed-plan apply
- storage and reuse of the canonical reviewed plan
- audited creation of a follow-up apply job from a reviewed source job
- deterministic apply behavior that does not rerun the planner provider
- tests proving reviewed-plan apply uses stored plan data and preserves rollback/touched-page behavior

Out of scope:

- the full workspace UI flow for reviewed-plan apply
- broad `/admin/agent` redesign
- auto-publish
- custom section-schema creation
- Phase 10 work

## Required Design Choice

Use the existing `site_build_draft` job kind unless a stronger technical reason emerges during implementation.

Preferred pattern:

- a plan-only or review-source job stores the canonical plan and planner output
- applying the reviewed plan creates a new audited job that references the source job
- the new apply job uses the stored canonical plan directly
- the planner provider must not be called during reviewed-plan apply

If you believe a different job kind is strictly necessary, stop and report before implementing it.

## Hard Rules

- Natural language remains the external operator input.
- JSON remains internal or fallback only.
- Do not silently rerun the planner provider during reviewed-plan apply.
- Do not bypass canonical validation.
- Keep output draft-only.
- Keep v1 limited to existing section types and existing theme controls.
- Preserve rollback, idempotency, audit traceability, and touched-page reporting.
- Do not ship the full workspace UI in this checkpoint.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/agent/jobs/types.ts`
2. `/var/www/html/hopfner.dev-main/lib/agent/jobs/service.ts`
3. `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts`
4. any new or changed helper modules under `/var/www/html/hopfner.dev-main/lib/agent/execution/*`
5. any new or changed admin API routes under `/var/www/html/hopfner.dev-main/app/admin/api/agent/*`
6. tests for reviewed-plan apply behavior

Touch `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx` only if a tiny compatibility change is strictly required for backend contract alignment. Do not implement the full reviewed-plan UI in this checkpoint.

## Existing Workflows To Reuse

- current plan/apply path:
  `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts`
- current apply executor:
  `/var/www/html/hopfner.dev-main/lib/agent/execution/apply-draft-plan.ts`
- current idempotency storage:
  `/var/www/html/hopfner.dev-main/lib/agent/execution/idempotency.ts`
- current job detail/list services:
  `/var/www/html/hopfner.dev-main/lib/agent/jobs/service.ts`

## Required Before Stopping

- define the backend payload and result contract for reviewed-plan apply
- implement audited creation of an apply job from a reviewed source job
- ensure the apply job references the source reviewed plan/job
- ensure the apply job reuses the stored canonical plan instead of rerunning the planner provider
- preserve rollback snapshot creation and touched-page reporting on the apply job
- add tests proving:
  - reviewed-plan apply creates a new job
  - the new job references the source reviewed plan
  - planner provider is not called during reviewed-plan apply
  - rollback and touched-page reporting remain intact
- run final Checkpoint A checks

## Required Checks

- targeted eslint on changed files
- targeted backend tests for reviewed-plan apply
- `npm test`
- `npm run build`

## Stop And Report Immediately If

- the stored canonical plan is not sufficient to perform a deterministic apply
- reviewed-plan apply would require silently rerunning the planner provider
- the new audited apply job would weaken rollback or idempotency guarantees
- the current job/result schema cannot support source-job traceability without a broader redesign

## Required Reporting

When you stop, report:

- exact files changed
- exact job payload and result contract added or modified
- exact strategy used to reference the reviewed source job
- explicit confirmation that the planner provider is not called during reviewed-plan apply
- exact tests run
- exact blockers or caveats
- confirmation that Phase 9 Checkpoint B was not started

## Completion Condition

Checkpoint A is complete only when:

- backend support exists for deterministic "apply reviewed plan"
- the apply job uses the reviewed stored canonical plan rather than rerunning the model
- rollback and touched-page reporting still work on the apply job
- you have stopped for QA without starting the full workspace UI work
