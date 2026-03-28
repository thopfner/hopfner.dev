# Phase 1 Checkpoint B Handoff Prompt

## Status

Checkpoint A has passed QA.

Approved baseline from Checkpoint A:
- shared payload extraction is acceptable
- shared CMS command layer is acceptable
- no blocking regressions were found in the extracted code
- targeted eslint passed
- targeted Vitest passed for:
  - `tests/pages-list.create-modal.test.tsx`
  - `tests/visual-editor/load-page-visual-state.test.ts`

Do not re-open Checkpoint A work unless a true blocker is found during rewiring.

## Role

You are the coding agent implementing Checkpoint B only for Phase 1.

Your job is to rewire the section editor and visual editor surfaces to the approved shared command layer while preserving existing behavior exactly.

You must stop for QA at the end of this checkpoint.
Do not continue to page list, global sections, theme presets, or media-route rewiring.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/README.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/00-coding-agent-prompt.md`
3. `/var/www/html/hopfner.dev-main/agentic-cms-build/03-phase-01-command-layer.md`
4. `/var/www/html/hopfner.dev-main/agentic-cms-build/10-phase-01-handoff-prompt.md`
5. `/var/www/html/hopfner.dev-main/agentic-cms-build/11-phase-01-checkpoint-b-handoff-prompt.md`

Before editing:

1. run `git status --short`
2. inspect the current Checkpoint A files and the three consumer files listed below
3. stop and report if Checkpoint A code has changed unexpectedly

## Scope

In scope:
- `/var/www/html/hopfner.dev-main/components/admin/section-editor/use-section-editor-resources.ts`
- `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-page-composition-actions.ts`
- `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-visual-section-persistence.ts`
- tests directly required to prove these rewires

Out of scope:
- `/app/admin/(protected)/pages-list.tsx`
- `/app/admin/(protected)/global-sections/page-client.tsx`
- `/app/admin/api/media/upload/route.ts`
- worker, jobs, orchestration, admin workspace, media generation

## Hard Rules

- Keep current section editor behavior identical.
- Keep current visual editor behavior identical.
- Keep current publish RPC usage identical.
- Reuse the approved shared command layer from Checkpoint A.
- Do not introduce new architecture in these consumers.
- Do not start Checkpoint C work.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/components/admin/section-editor/use-section-editor-resources.ts`
2. `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-page-composition-actions.ts`
3. `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-visual-section-persistence.ts`
4. tests directly covering these rewired behaviors

## Existing Behavior To Preserve

- section editor draft save, save+publish, publish, delete draft, restore, and media upload behavior from `/var/www/html/hopfner.dev-main/components/admin/section-editor/use-section-editor-resources.ts`
- visual editor add/insert/duplicate/delete/reorder/toggle behavior from `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-page-composition-actions.ts`
- visual editor save/publish behavior from `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-visual-section-persistence.ts`

## Execution Plan

### Step 1

Rewire the section editor resource hook to call the approved shared command functions for save/publish/restore-adjacent draft behavior where applicable.

### Step 2

Rewire visual editor composition actions to call the approved shared command functions.

### Step 3

Rewire visual editor persistence to call the approved shared command functions.

### Step 4

Add or update tests that prove:
- save/publish behavior is unchanged
- publish RPC argument behavior is unchanged
- section composition behavior is unchanged

### Step 5

Run required checks and stop for QA.

## Required Checks

- `npx eslint components/admin/section-editor/use-section-editor-resources.ts components/admin/visual-editor/use-page-composition-actions.ts components/admin/visual-editor/use-visual-section-persistence.ts`
- `npx vitest run tests/visual-editor/load-page-visual-state.test.ts tests/visual-editor/v11-composition.test.ts`

If broader checks are safe in your environment, also run:
- `npm run test`

If a broader check fails due to a pre-existing unrelated issue, report that separately and do not hide it.

## Required Behavior

- section editor still validates Tailwind classes exactly as before
- section editor still preserves scope-specific publish RPC behavior
- visual editor composition still preserves position shifting, duplication rules, and global-section constraints
- visual editor draft save/publish still preserves current result shape and error behavior
- no visible regression is introduced

## Stop And Report Immediately If

- the shared command layer cannot preserve an existing consumer contract without adding new Phase 1 scope
- the current consumers depend on side effects that are not represented in the approved shared commands
- a rewire would force premature changes to page list, theme preset, or media-route surfaces

## Required Reporting At Stop

When you stop, report:
- exact files changed
- exact tests run
- any behavior differences you intentionally preserved via thin adapters
- any remaining mismatch between shared commands and current consumer expectations
- explicit confirmation that Checkpoint C work was not started

## Completion Condition For Checkpoint B

Checkpoint B is complete only when:
- the section editor consumer is rewired
- both visual editor consumers are rewired
- targeted lint and targeted visual-editor tests pass
- publish RPC behavior is unchanged
- you stop for QA without starting page list/theme/media rewiring
