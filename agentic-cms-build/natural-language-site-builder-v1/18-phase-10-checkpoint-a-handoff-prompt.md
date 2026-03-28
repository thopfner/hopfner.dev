# Phase 10 Checkpoint A Handoff Prompt

## Status

Phase 9 has passed QA on the live VPS repo.

Approved baseline from Phase 9:

- the `/admin/agent` workspace now supports:
  - natural-language brief input
  - plan-only review
  - create draft
  - apply reviewed plan
  - touched-page visual-editor links
  - rollback from applied jobs
- reviewed-plan apply is deterministic and does not rerun the planner provider
- the worker service is installed and active on this host
- live repo `npm test` passed
- live repo `npm run build` passed

Do not re-open Phase 9 unless a true blocker is found while implementing this checkpoint.

## Role

You are the coding agent implementing Phase 10 Checkpoint A only for `hopfner.dev-main`.

Your job is to harden the natural-language site-builder so operator limits, busy-state rules, provider readiness, and failure clarity are explicit and safe before final launch signoff.

You must stop for QA when Checkpoint A is complete.
Do not start Phase 10 Checkpoint B launch signoff work yet.

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
9. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/05-phase-10-hardening-and-launch-gate.md`
10. `/var/www/html/hopfner.dev-main/agentic-cms-build/natural-language-site-builder-v1/18-phase-10-checkpoint-a-handoff-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect:
   - `/var/www/html/hopfner.dev-main/lib/agent/jobs/*`
   - `/var/www/html/hopfner.dev-main/lib/agent/planning/*`
   - `/var/www/html/hopfner.dev-main/lib/agent/execution/*`
   - `/var/www/html/hopfner.dev-main/app/admin/api/agent/*`
   - `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
   - `/var/www/html/hopfner.dev-main/tests/admin-agent-workspace.test.tsx`
3. stop and report if the live repo materially differs from this prompt

## Scope

In scope:

- request caps and refusal messaging
- clear concurrency and busy-state rules
- provider readiness clarity
- operator-facing failure clarity in status, job detail, and workspace actions
- tests for refusal paths, busy-state paths, and provider-readiness paths

Out of scope:

- final launch signoff/manual release checklist
- auto-publish
- custom section-schema creation
- multi-tenant orchestration
- any v2 feature expansion

## Hard Rules

- keep v1 constrained to existing section types and existing theme controls
- do not add auto-publish
- do not add custom section-schema creation
- do not weaken rollback, idempotency, or reviewed-plan apply guarantees
- do not expose raw provider secrets in UI, API responses, logs, or docs
- make refusal and busy states operator-readable rather than generic failures

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/agent/planning/*`
2. `/var/www/html/hopfner.dev-main/lib/agent/execution/*`
3. `/var/www/html/hopfner.dev-main/lib/agent/jobs/*`
4. `/var/www/html/hopfner.dev-main/app/admin/api/agent/*`
5. `/var/www/html/hopfner.dev-main/components/admin/agent-workspace/agent-workspace.tsx`
6. `/var/www/html/hopfner.dev-main/tests/*` for hardening coverage

Touch `.env.example` or scripts only if strictly needed for readiness clarity during this checkpoint. Do not start launch-note cleanup yet.

## Required Hardening Work

### 1. Request Limits And Scope Guards

- cap prompt length
- cap page count and section count
- cap generated-image request count per run
- reject unsupported asks explicitly and operator-readably

### 2. Concurrency And Busy-State Clarity

- prevent overlapping incompatible draft-apply runs
- make busy/blocked states explicit in API and workspace messaging
- keep reviewed-plan apply gating truthful

### 3. Provider Readiness Clarity

- make planner-provider readiness explicit
- make image-provider readiness explicit
- make readiness failures actionable without leaking secrets

### 4. Failure Clarity

- job detail should show why a plan was rejected or refused
- provider failure states should be distinguishable from validation failures
- operator messaging should explain whether nothing was applied, draft apply was blocked, or a provider was unavailable

## Required Before Stopping

- implement the agreed request caps and refusal paths
- implement clear busy-state and blocked-state messaging
- improve provider readiness and failure clarity where needed
- add tests covering:
  - refusal paths
  - busy-state paths
  - provider-readiness paths
- run final Checkpoint A checks

## Required Checks

- targeted eslint on changed files
- targeted hardening tests
- `npm test`
- `npm run build`

## Stop And Report Immediately If

- the required request caps would break the approved Phase 9 review/apply flow
- clear refusal messaging cannot be added without widening the job result contract substantially
- busy-state clarity would require undoing the current serialized draft-job model

## Required Reporting

When you stop, report:

- exact files changed
- exact request caps and refusal rules added
- exact busy-state and blocked-state rules added or clarified
- exact provider-readiness and failure states surfaced
- exact tests run
- exact blockers or caveats
- confirmation that Phase 10 Checkpoint B was not started

## Completion Condition

Checkpoint A is complete only when:

- limits, refusal paths, provider readiness, and busy-state rules are clear
- failure states are understandable in the UI and job detail
- live repo `npm test` and `npm run build` pass
- you have stopped for QA without starting launch signoff work
