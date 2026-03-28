# Phase 9: Review UX And Apply Reviewed Plan

## Goal

Turn the current agent workspace into a product-grade review flow:

1. enter natural-language brief
2. get a reviewable plan summary with warnings and assumptions
3. apply the reviewed stored plan without rerunning the model
4. inspect touched pages in the visual editor
5. rollback if needed

## Why This Phase Exists

A serious SaaS workflow cannot require the operator to rerun the model between review and apply.

The plan that was reviewed must be the plan that gets applied.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/agent/jobs/types.ts`
2. `/var/www/html/hopfner.dev-main/lib/agent/jobs/service.ts`
3. `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts`
4. any new supporting modules under `/var/www/html/hopfner.dev-main/lib/agent/execution/*`
5. any new admin API routes under `/var/www/html/hopfner.dev-main/app/admin/api/agent/*`
6. `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
7. `/var/www/html/hopfner.dev-main/app/admin/(protected)/agent/page-client.tsx`
8. tests for workspace actions and reviewed-plan apply behavior

## Required Design Choice

Use the existing `site_build_draft` job kind unless a stronger reason emerges during implementation.

Preferred pattern:

- dry-run or reviewed-plan source job stores the canonical plan
- applying the reviewed plan creates a new audited job referencing the source job
- the second job uses the stored canonical plan directly and does not rerun the planner provider

Do not silently rerun the model during "apply reviewed plan."

## Required Behavior

- the workspace defaults to natural-language brief input
- the workspace clearly distinguishes:
  - plan only
  - create draft in CMS, no publish
- plan-only results display:
  - normalized page summary
  - section counts and section types
  - theme summary
  - planner warnings and assumptions
- the operator can apply a reviewed stored plan without rerunning the model
- touched-page links open existing visual-editor routes
- rollback remains available for applied jobs

## Checkpoint A

### Goal

Backend support exists for deterministic "apply reviewed plan" from a stored canonical plan.

### Required Before Stopping

- define the audited backend contract for apply reviewed plan
- implement job payload and result support for that contract
- ensure reviewed-plan apply reuses the stored canonical plan rather than rerunning the planner
- add tests covering:
  - reviewed-plan apply creates a new job
  - the new job references the source reviewed plan
  - planner provider is not called during reviewed-plan apply
  - rollback and touched-page reporting remain intact

### Hard Stop

- stop here and wait for QA approval
- do not ship the full workspace UI yet

## Checkpoint B

### Goal

The admin workspace exposes the full plan-review and apply flow.

### Required Before Stopping

- update the agent workspace UI to prioritize natural-language briefing
- make plan-only and draft-apply actions explicit and understandable
- render planner warnings and assumptions
- render plan summary and touched-page actions
- add the reviewed-plan apply action
- keep cancel and rollback rules correct
- add UI tests
- run browser/manual QA if an authenticated admin session is available

### Hard Stop

- stop here for full Phase 9 QA
- do not start launch hardening work

## What Must Not Change In This Phase

- do not change the core CMS renderer
- do not add auto-publish
- do not add custom section-schema creation
- do not bypass the stored canonical plan during reviewed-plan apply

## Required Checks

At Checkpoint A:

- targeted backend tests for reviewed-plan apply
- targeted eslint on job and execution files

At Checkpoint B:

- targeted workspace tests
- `npm test`
- `npm run build`
- browser/manual QA evidence if login is available

## Gate For Moving Forward

Do not proceed until all of the following are true:

- the operator can review a plan without JSON
- the operator can apply the reviewed stored plan without rerunning the model
- the workspace makes the draft-only nature of the flow obvious
- the touched-page and rollback workflow still works end to end

