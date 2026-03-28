# Phase 3 Handoff Prompt

## Status

Phase 2 has passed QA on the live VPS repo.

Approved baseline from Phase 2:
- shared CMS command layer exists
- local worker runtime exists
- atomic worker claim/transition support exists
- restart recovery and cancel handling exist for the synthetic no-op flow
- Docker/compose wiring for app + worker exists
- live repo `npm test` passed
- live repo `npm run build` passed

Do not re-open Phase 2 unless a true blocker is found while implementing Phase 3.

## Role

You are the coding agent implementing Phase 3 only for `hopfner.dev-main`.

Your job is to add prompt-to-draft orchestration using existing section types and existing theme controls only, with snapshot and rollback.

You must stop for QA at every checkpoint in this document.
Do not continue past a checkpoint until the reviewer explicitly tells you to proceed.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/README.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/00-coding-agent-prompt.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/03-phase-01-command-layer.md`
4. `/var/www/html/hopfner.dev-main/agentic-cms-build/05-phase-03-draft-orchestration.md`
5. `/var/www/html/hopfner.dev-main/agentic-cms-build/16-phase-03-handoff-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect the approved Phase 1 and Phase 2 worker/runtime surfaces
3. inspect the existing snapshot/apply/rollback files listed below
4. stop and report if the live repo materially differs from this prompt

## Phase Scope

In scope:
- new `lib/agent/planning/*`
- new `lib/agent/execution/*`
- `lib/agent/jobs/*` worker-handler additions required for draft orchestration
- `/var/www/html/hopfner.dev-main/lib/cms/blueprint-apply.ts` and related snapshot/apply helpers where reuse is appropriate
- new tests for plan validation, apply, rollback, and idempotency
- admin API additions only if strictly required for job detail inspection or rollback trigger support
- new migration(s) only if truly required for Phase 3 job metadata or rollback bookkeeping

Out of scope:
- custom section schema creation
- auto-publish
- generated media
- public worker endpoints
- Phase 4 admin workspace product UI

## Hard Rules

- Use only existing section types.
- Use only existing theme/token controls.
- Do not create new section schemas.
- Do not auto-publish anything.
- Do not bypass the shared CMS command layer.
- Keep `site_build_noop` working; do not remove the Phase 2 synthetic job path.
- Draft-only output is the rule for this phase.
- If a true model-provider integration becomes necessary, stop and report before adding it. Do not silently invent a provider/runtime surface in this phase.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/cms/blueprint-apply.ts` and adjacent snapshot/apply helpers if needed
2. new modules under `/var/www/html/hopfner.dev-main/lib/agent/planning/*`
3. new modules under `/var/www/html/hopfner.dev-main/lib/agent/execution/*`
4. `/var/www/html/hopfner.dev-main/lib/agent/jobs/*` for real draft-job handlers
5. new tests for Phase 3
6. admin API additions only if required
7. new migration(s) only if required

## Existing Workflows To Reuse

- snapshot/apply behavior from `/var/www/html/hopfner.dev-main/lib/cms/blueprint-apply.ts`
- blueprint route patterns from `/var/www/html/hopfner.dev-main/app/admin/api/content/blueprint/route.ts`
- rollback route patterns from `/var/www/html/hopfner.dev-main/app/admin/api/content/blueprint/rollback/route.ts`
- shared CMS command layer from Phase 1
- published/render truth from `/var/www/html/hopfner.dev-main/lib/cms/get-published-page.ts`

## Required Phase 3 Behavior

- a prompt-driven job can create draft pages/sections/theme changes only
- output is visible in the existing page overview and visual editor
- touched pages and rollback snapshot id are recorded and reportable
- rollback restores the pre-run snapshot
- retry/idempotency does not create duplicate draft structures

## Recommended Phase 3 Job Shape

Unless the live repo strongly argues otherwise:
- keep the Phase 2 noop kind
- add one new real Phase 3 draft-build kind
- carry prompt text and any run metadata in the existing job payload/result surfaces

Do not broaden the job system beyond what Phase 3 needs.

## Checkpoint A

Goal:
- constrained planning/execution scaffolding exists
- snapshot/rollback/idempotency plumbing exists
- no real CMS draft mutations yet beyond dry-run or plan-only behavior

Required before stopping:
- define a constrained internal plan schema for pages, ordered sections, content, formatting, and theme controls
- implement plan validation that rejects:
  - unknown section types
  - custom schema creation
  - auto-publish
- add snapshot-before-apply plumbing
- add rollback plumbing
- add idempotency scaffolding so retries can be detected safely
- wire the worker/job layer to the new Phase 3 job kind in a plan-only or dry-run-safe manner
- add tests for plan validation and idempotency/rollback scaffolding

Hard stop:
- stop here and wait for QA approval
- do not enable real draft apply before approval

## Checkpoint B

Goal:
- real draft-only orchestration is complete
- Phase 3 is complete

Required before stopping:
- execute validated plans through the shared CMS command layer
- create/update draft pages, sections, and allowed theme changes only
- capture a pre-run snapshot and prove rollback
- record touched pages and rollback snapshot id on the job detail path or equivalent job-visible surface
- add tests for apply/rollback/idempotency
- add targeted read-path proof that resulting drafts load in existing page/visual-editor flows
- run final Phase 3 checks

Hard stop:
- stop here for full Phase 3 QA
- do not start Phase 4 admin workspace work

## Required Checks

At Checkpoint A:
- targeted tests for plan validation and idempotency/rollback scaffolding
- targeted eslint on new Phase 3 files

At Checkpoint B:
- targeted tests for apply/rollback and read-path loading
- `npm test`
- `npm run build`

## Stop And Report Immediately If

- true prompt-to-plan behavior requires adding a model-provider integration that is not already in scope
- idempotency cannot be achieved without widening the job schema or runtime beyond reasonable Phase 3 scope
- rollback cannot be implemented safely through the existing snapshot/apply foundations
- reusing the command layer proves insufficient and would force direct DB hacks

## Required Reporting At Every Checkpoint

When you stop, report:
- exact files changed
- exact new job kind(s) added
- exact tests run
- exact plan constraints enforced
- exact snapshot/rollback path used
- exact touched pages tracking added
- exact sample input and resulting plan summary
- exact open risks or blockers
- exact reason you stopped

## Completion Condition For Phase 3

Phase 3 is complete only when:
- a seeded prompt can create a draft-only site slice
- touched pages can be opened in the existing visual editor
- rollback is proven
- retries are idempotent
- tests and build pass
- you have stopped for QA without starting Phase 4
