# Phase 9 Checkpoint B Handoff Prompt

## Status

Phase 9 Checkpoint A has passed QA on the live VPS repo.

Approved baseline from Checkpoint A:

- deterministic backend support exists for reviewed-plan apply
- reviewed-plan apply creates a new audited `site_build_draft` job
- the apply job references the reviewed source job
- the apply job reuses the stored canonical plan rather than rerunning the planner provider
- handcrafted reviewed-plan apply payloads are rejected through the generic jobs route
- the dedicated `/admin/api/agent/jobs/[jobId]/apply-reviewed` path is the approved backend path
- rollback and touched-page reporting remain intact on apply jobs
- live repo `npm test` passed
- live repo `npm run build` passed

Do not re-open Checkpoint A unless a true blocker is found while implementing Checkpoint B.

## Role

You are the coding agent implementing Phase 9 Checkpoint B only for `hopfner.dev-main`.

Your job is to turn the current `/admin/agent` workspace into a product-grade review and apply flow:

1. brief in natural language
2. review plan summary, warnings, and assumptions
3. apply the reviewed stored plan without rerunning the model
4. open touched pages in the visual editor
5. rollback if needed

You must stop for QA when Checkpoint B is complete.
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
10. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/17-phase-09-checkpoint-b-handoff-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect:
   - `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
   - `/var/www/html/hopfner.dev-main/app/admin/(protected)/agent/page-client.tsx`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/apply-reviewed/route.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/rollback/route.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/api/pages/overview/route.ts`
   - `/var/www/html/hopfner.dev-main/tests/admin-agent-workspace.test.tsx`
3. stop and report if the live repo materially differs from this prompt

## Scope

In scope:

- workspace UX for plan review
- explicit plan-only vs create-draft actions
- reviewed-plan apply action from completed plan-only jobs
- rendering planner assumptions, warnings, downgraded requests, and normalized plan summary
- rendering touched-page links into the existing visual editor routes
- keeping cancel and rollback actions correct for the new flow
- UI tests
- browser/manual QA attempt if an authenticated admin session is available

Out of scope:

- Phase 10 hardening work
- auto-publish
- custom section-schema creation
- any rerun-the-model shortcut during reviewed-plan apply
- broad admin IA redesign outside `/admin/agent`

## Hard Rules

- natural language remains the default operator input
- JSON remains fallback or advanced input only; do not make it the primary UX again
- reviewed-plan apply must call the dedicated backend path and must not rerun the planner provider
- keep the draft-only nature of the product obvious in the UI
- preserve rollback, touched-page linking, cancel rules, and existing job-history behavior
- do not bypass the stored canonical plan

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
2. `/var/www/html/hopfner.dev-main/app/admin/(protected)/agent/page-client.tsx`
3. any tiny compatibility additions under `/var/www/html/hopfner.dev-main/app/admin/api/agent/*` only if strictly needed for the workspace flow
4. `/var/www/html/hopfner.dev-main/tests/admin-agent-workspace.test.tsx`
5. any additional UI-focused tests for the reviewed-plan apply flow

Do not reopen backend job/execution internals unless a real blocker appears.

## Existing Workflows To Reuse

- plan-only and draft-apply job creation already present in the workspace
- reviewed-plan backend path:
  `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/apply-reviewed/route.ts`
- rollback path:
  `/var/www/html/hopfner.dev-main/app/admin/api/agent/jobs/[jobId]/rollback/route.ts`
- touched-page link mapping through:
  `/var/www/html/hopfner.dev-main/app/admin/api/pages/overview/route.ts`

## Required Before Stopping

- update the workspace copy and control flow so plan review is clear and product-grade
- make plan-only and create-draft actions explicit and understandable
- render plan summary, planner warnings, planner assumptions, and downgraded requests
- render a reviewed-plan apply action for eligible completed plan-only jobs
- ensure reviewed-plan apply goes through the dedicated backend route
- keep cancel and rollback rules correct
- keep touched-page links working for applied jobs
- add UI tests proving the reviewed-plan apply flow
- run browser/manual QA if an authenticated admin session is available
- run final Checkpoint B checks

## Required Checks

- targeted eslint on changed files
- targeted workspace/UI tests
- `npm test`
- `npm run build`
- browser/manual QA evidence if an authenticated session is available

## Stop And Report Immediately If

- the existing workspace state model cannot support reviewed-plan apply without reopening backend contracts
- the UI would need to rerun the planner provider to make the flow understandable
- touched-page links or rollback rules would regress under the reviewed-plan UI flow

## Required Reporting

When you stop, report:

- exact files changed
- exact UI flow exposed for:
  - plan only
  - create draft
  - apply reviewed plan
  - rollback
- exact eligibility rules enforced for reviewed-plan apply, cancel, and rollback
- exact tests run
- exact browser/manual QA performed
- exact blockers or caveats
- confirmation that Phase 10 was not started

## Completion Condition

Checkpoint B is complete only when:

- the operator can review a plan without JSON
- the operator can apply the reviewed stored plan without rerunning the model
- the workspace makes the draft-only nature of the flow obvious
- touched-page and rollback workflows still work end to end
- you have stopped for QA without starting Phase 10
