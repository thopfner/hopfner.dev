# Phase 1 Handoff Prompt

## Role

You are the coding agent implementing Phase 1 only for `hopfner.dev-main`.

Your job is to extract the shared CMS command layer and server-safe payload utilities that later agent-runtime phases will reuse.

You must stop for QA at every checkpoint in this document.
Do not continue past a checkpoint until the reviewer explicitly tells you to proceed.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

Read these files first, in order:

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/README.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/00-coding-agent-prompt.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/01-architecture-decisions.md`
4. `/var/www/html/hopfner.dev-main/agentic-cms-build/02-root-cause-and-blockers.md`
5. `/var/www/html/hopfner.dev-main/agentic-cms-build/03-phase-01-command-layer.md`

Before making changes:

1. run `git status --short`
2. inspect the live implementation files named in the Phase 1 roadmap
3. stop and report if the live repo materially differs from the roadmap assumptions

## Phase Scope

In scope:
- shared server-safe payload extraction
- shared CMS command layer extraction
- rewiring current admin/editor surfaces to reuse that shared logic
- tests required for Phase 1

Out of scope:
- local worker runtime
- agent job tables
- prompt orchestration
- admin agent workspace
- generated media provider logic
- auto-publish
- custom section type creation

## Hard Rules

- Keep current page editor, visual editor, page list, global section, theme, and media behavior identical.
- Reuse the current publish RPCs and CMS table contracts.
- Do not invent a new architecture outside the Phase 1 roadmap.
- Do not start Phase 2 work.
- Do not silently broaden the write surface.
- Do not remove or weaken existing tests.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/components/admin/section-editor/payload.ts`
2. new shared modules under `lib/cms/commands/*` and related shared payload paths
3. `/var/www/html/hopfner.dev-main/components/admin/section-editor/use-section-editor-resources.ts`
4. `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-page-composition-actions.ts`
5. `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-visual-section-persistence.ts`
6. `/var/www/html/hopfner.dev-main/app/admin/(protected)/pages-list.tsx`
7. `/var/www/html/hopfner.dev-main/app/admin/(protected)/global-sections/page-client.tsx`
8. `/var/www/html/hopfner.dev-main/app/admin/api/media/upload/route.ts`
9. new tests for shared command behavior

## Existing Behavior To Reuse

- section save/publish/delete/restore behavior from `/var/www/html/hopfner.dev-main/components/admin/section-editor/use-section-editor-resources.ts`
- visual editor section add/duplicate/delete/reorder behavior from `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-page-composition-actions.ts`
- visual editor save/publish behavior from `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-visual-section-persistence.ts`
- page creation behavior from `/var/www/html/hopfner.dev-main/app/admin/(protected)/pages-list.tsx`
- theme preset and site formatting behavior from `/var/www/html/hopfner.dev-main/app/admin/(protected)/global-sections/page-client.tsx`

## Execution Plan

### Step 1

Extract shared payload normalization and draft-to-payload logic into server-safe modules.

### Step 2

Create shared CMS command functions for:
- page create
- section add
- section duplicate
- section reorder
- section save draft
- section publish draft
- theme preset create
- theme preset update
- theme preset apply
- media metadata finalize

### Step 3

Rewire the current client/admin surfaces to reuse the extracted shared logic directly or via thin route wrappers.

### Step 4

Add tests that prove shared command behavior and preserve current UI-facing behavior.

### Step 5

Run required checks and stop for Phase 1 QA review.

## Checkpoint A

Goal:
- shared payload and command surfaces exist
- no consumer rewiring beyond minimal compile-safe scaffolding

Required before stopping:
- create the shared module layout
- implement the initial command contracts
- report the exact new files and exported functions
- report any behavior that could not be extracted cleanly

Hard stop:
- stop here and wait for QA approval
- do not start broad consumer rewiring before approval

## Checkpoint B

Goal:
- section editor and visual editor surfaces are rewired to the shared logic

Required before stopping:
- rewire `/components/admin/section-editor/use-section-editor-resources.ts`
- rewire `/components/admin/visual-editor/use-page-composition-actions.ts`
- rewire `/components/admin/visual-editor/use-visual-section-persistence.ts`
- confirm publish RPC behavior is unchanged
- add or update tests for these rewired paths

Hard stop:
- stop here and wait for QA approval
- do not move on to page list/theme/media rewiring before approval

## Checkpoint C

Goal:
- remaining Phase 1 surfaces are rewired and Phase 1 is complete

Required before stopping:
- rewire `/app/admin/(protected)/pages-list.tsx`
- rewire `/app/admin/(protected)/global-sections/page-client.tsx`
- rewire `/app/admin/api/media/upload/route.ts` or related thin server surface as needed
- add remaining command tests
- run final Phase 1 checks

Required checks:
- `npm run test`
- `npm run build`

Hard stop:
- stop here for full Phase 1 QA
- do not start any Phase 2 runtime/job/worker work

## Required Reporting At Every Checkpoint

When you stop, report:
- exact files changed
- exact tests run
- exact behavior preserved
- exact open risks or blockers
- exact reason you stopped

## Stop And Report Immediately If

- the live repo already contains a partial command-layer extraction that conflicts with the roadmap
- the current admin/editor surfaces rely on hidden side effects that cannot be preserved by extraction
- the DB or RLS assumptions differ materially from the roadmap
- Phase 1 requires worker/job/runtime changes to proceed safely

## Completion Condition For Phase 1

Phase 1 is complete only when:
- shared server-safe payload logic exists
- shared CMS command functions exist
- current admin/editor surfaces are rewired to reuse that logic
- UI behavior is unchanged
- tests and build pass
- you have stopped for QA without starting Phase 2
