# Phase 3 Checkpoint B Handoff Prompt

## Status

Phase 3 Checkpoint A is approved on the live VPS repo after the fix round.

Approved baseline now in place:

- `site_build_draft` exists as a constrained Phase 3 job kind
- prompt JSON is validated into a normalized internal draft plan
- unsupported section types, custom schema creation, and `autoPublish: true` are rejected
- plan-only idempotency scaffolding exists in `result.phase3`
- snapshot capture and rollback helpers exist
- snapshot restore now correctly handles both:
  - page existed before capture
  - page did not exist before capture
- touched page slugs and plan summaries are already recorded on the job result
- live `npm test` passed
- live `npm run build` passed

Do not re-open Checkpoint A unless you hit a true blocker while implementing Checkpoint B.

## Role

You are implementing Phase 3 Checkpoint B only for `hopfner.dev-main`.

You must stop for QA at the end of this checkpoint.
Do not start Phase 4.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/05-phase-03-draft-orchestration.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/16-phase-03-handoff-prompt.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/17-phase-03-checkpoint-a-fix-prompt.md`
4. `/var/www/html/hopfner.dev-main/agentic-cms-build/18-phase-03-checkpoint-b-handoff-prompt.md`

Before making changes:

1. run `git status --short`
2. inspect the approved Phase 1 command-layer modules under `/var/www/html/hopfner.dev-main/lib/cms/commands`
3. inspect the current Phase 3 planning/idempotency/snapshot modules
4. inspect the existing read paths:
   - `/var/www/html/hopfner.dev-main/lib/admin/visual-editor/load-page-visual-state.ts`
   - `/var/www/html/hopfner.dev-main/app/admin/api/pages/overview/route.ts`
5. stop and report if the live repo materially differs from this prompt

## Checkpoint B Goal

Enable real draft-only `site_build_draft` execution through the CMS-native command layer, with rollback proof and read-path proof.

## Scope

In scope:

- `/var/www/html/hopfner.dev-main/lib/agent/execution/*`
- `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts`
- `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts` only if needed for result/status persistence
- narrow additions to `/var/www/html/hopfner.dev-main/lib/cms/commands/*` only if the existing command layer is missing a required deterministic draft-apply primitive
- Phase 3 tests for apply, rollback, idempotency, and read-path proof

Out of scope:

- model-provider integration
- generated media
- auto-publish
- new section schemas
- Phase 4 admin workspace UI
- broad admin API expansion unless strictly required for existing job detail visibility

## Hard Rules

- Draft-only output is mandatory.
- Use existing section types only.
- Use existing theme controls only.
- Do not publish anything.
- Do not bypass the CMS command layer from the worker execution path.
- If the current command layer lacks a required primitive, extract that primitive into the command layer first; do not insert ad hoc raw table writes into the worker.
- Preserve `site_build_noop`.
- Preserve plan-only behavior when apply is not requested.
- Preserve the approved `result.phase3` structure and extend it only as needed for apply-state reporting.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/agent/execution/*`
2. `/var/www/html/hopfner.dev-main/lib/cms/commands/*` only if required to close a real command-layer gap
3. `/var/www/html/hopfner.dev-main/lib/agent/jobs/handlers.ts`
4. `/var/www/html/hopfner.dev-main/lib/agent/jobs/worker-service.ts` only if required
5. Phase 3 tests:
   - `/var/www/html/hopfner.dev-main/tests/agent-draft-execution.test.ts`
   - `/var/www/html/hopfner.dev-main/tests/agent-draft-job-handler.test.ts`
   - targeted read-path tests using existing overview/visual-editor loaders

## Required Implementation

### 1. Keep plan-only mode intact

If `site_build_draft` is not explicitly requesting apply, keep the current plan-only behavior intact.

### 2. Add real apply orchestration when apply is requested

For apply-requested runs:

1. parse and validate the prompt into the existing constrained plan
2. compute the existing idempotency key
3. if the same prompt+plan has already completed apply successfully, short-circuit without creating duplicate draft structures
4. capture a pre-run snapshot for the touched page slugs
5. execute the plan through the shared CMS command layer
6. record apply result details back onto `result.phase3`

### 3. Apply semantics

Required semantics:

- create missing pages for planned slugs
- reuse existing pages for planned slugs
- ensure each targeted page ends in the exact planned section order
- ensure each targeted section ends with the planned draft content/formatting/meta
- apply allowed theme changes only from the constrained plan
- do not affect untargeted pages
- do not publish

If deterministic reconciliation requires deleting or replacing existing targeted sections, do that through extracted/reused command-layer primitives, not ad hoc worker SQL.

### 4. Rollback bookkeeping

Record enough information in `result.phase3` to prove rollback capability for the apply run, including:

- apply state
- snapshot state
- rollback snapshot id
- touched page slugs
- plan summary

If you need to extend the Phase 3 result type, keep it backward-compatible with the approved Checkpoint A plan-only result shape.

### 5. Read-path proof

Add targeted proof that the resulting drafts can be loaded through the existing CMS-native admin read paths.

Preferred proof surfaces:

- `/var/www/html/hopfner.dev-main/lib/admin/visual-editor/load-page-visual-state.ts`
- `/var/www/html/hopfner.dev-main/app/admin/api/pages/overview/route.ts`

Do not add new UI in this checkpoint.

## Non-Goals

- no browser workspace UI
- no prompt provider integration
- no publishing workflow changes
- no media generation
- no section-schema registry changes

## Stop And Report If

- deterministic apply cannot be achieved without widening the plan model beyond approved Phase 3 scope
- the existing command layer is missing a required primitive and you cannot extract it safely from live behavior
- rollback proof would require broad new admin APIs or Phase 4 UI work
- idempotent apply cannot be implemented without breaking the current plan-only result contract

## Required Checks

- targeted eslint on every changed Phase 3 and command-layer file
- targeted Vitest for:
  - draft apply behavior
  - rollback behavior
  - idempotent re-run behavior
  - read-path proof for overview/visual-editor loading
- `npm test`
- `npm run build`

## Required Reporting At Stop

When you stop, report:

- exact files changed
- exact apply path used
- exact command-layer primitives reused
- any new command-layer primitives extracted
- exact `result.phase3` fields added or changed
- exact sample prompt used
- exact touched pages produced
- exact rollback snapshot id/result proof
- exact read-path tests proving the drafts load in existing admin flows
- exact tests run
- explicit confirmation that Phase 4 work was not started

## Stop Condition

Stop for QA as soon as real draft-only apply, rollback proof, idempotent re-run protection, and read-path proof are complete.
