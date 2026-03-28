# Phase 10: Hardening And Launch Gate

## Goal

Finish the natural-language site-builder as a sellable product surface.

This phase is where operator safety, clarity, and launch readiness are enforced.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/agent/jobs/*`
2. `/var/www/html/hopfner.dev-main/lib/agent/planning/*`
3. `/var/www/html/hopfner.dev-main/lib/agent/execution/*`
4. `/var/www/html/hopfner.dev-main/app/admin/api/agent/*`
5. `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
6. `/var/www/html/hopfner.dev-main/.env.example`
7. `/var/www/html/hopfner.dev-main/scripts/*` for worker and live-runtime verification if needed
8. tests and launch notes

## Required Hardening Areas

### 1. Request Limits And Scope Guards

- cap prompt length
- cap page count and section count
- cap generated-image request count per run
- reject unsupported asks explicitly

### 2. Concurrency And Retry Safety

- prevent overlapping incompatible draft-apply runs
- make cancellation state and retry state explicit
- ensure the worker and admin UI communicate "busy" or "blocked" clearly

### 3. Provider And Secret Handling

- make planner-provider readiness explicit
- make image-provider readiness explicit
- never expose raw keys in the UI or logs
- keep env and setup docs accurate

### 4. Audit And Failure Clarity

- job detail should clearly show:
  - why a plan was rejected
  - why a provider call failed
  - what was applied
  - what was rolled back

### 5. Ops Safety

- worker install and verify path must be documented
- live runtime notes must be accurate
- any deployment scripts must not leak secrets to predictable world-readable files

## Checkpoint A

### Goal

The product has guardrails and clear operator-facing readiness and failure states.

### Required Before Stopping

- add request caps and refusal messaging
- add clear concurrency and busy-state rules
- improve operator-facing status and failure clarity where needed
- add tests for refusal paths, busy-state paths, and provider-readiness paths

### Hard Stop

- stop here and wait for QA approval
- do not start final launch signoff yet

## Checkpoint B

### Goal

The launch gate is complete.

### Required Before Stopping

- run final targeted and full repo checks
- run worker-service verification on the live host
- run browser/manual QA for:
  - public site still renders
  - `/admin/agent` can plan and apply drafts correctly
  - touched pages open in the visual editor
  - rollback works
- update launch notes
- stop for final QA

### Hard Stop

- stop here for final launch review

## What Must Not Change In This Phase

- do not widen the feature set beyond v1 scope
- do not add auto-publish
- do not add custom section-schema creation
- do not introduce a central orchestration service

## Required Checks

At Checkpoint A:

- targeted hardening tests
- targeted eslint on changed files

At Checkpoint B:

- `npm test`
- `npm run build`
- live worker-service verification
- browser/manual QA evidence

## Gate For Launch

Do not call the rollout complete until all of the following are true:

- the worker is managed and online
- the admin can submit natural-language briefs
- the planner produces constrained validated plans
- reviewed-plan apply works without rerunning the model
- draft results can be inspected in the visual editor
- rollback is proven
- generated images work through the media library path
- live ops notes are accurate

