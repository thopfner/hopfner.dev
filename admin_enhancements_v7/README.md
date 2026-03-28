# Admin Enhancements v7

## Phase 3.2 Finish Batch

This is a very narrow cleanup pass to close the remaining loose ends from Phase 3.1.

Do not broaden scope.
Do not redesign workspace routes again.
Do not touch collection pages.
Do not touch Phase 4 work.

The goal is to close the two remaining quality gaps:

1. incorrect back target in the shared page-workspace identity
2. proof quality for the workspace-page corrections is still too weak

## Scope

Only these items are in scope:

1. correct the shared page-workspace back target to the actual pages index
2. replace weak source-inspection assertions in `tests/admin-foundation/workspace-pages.test.tsx` with stronger rendered proof where practical

Out of scope:

1. any new workspace features
2. any layout redesign
3. any change to save/publish/editor logic
4. any changes outside the touched page-workspace and test files

## Exact Problems To Fix

### 1. Page Workspace Back Target Is Wrong

Current issue:

1. the Page Editor header shows `Back to pages`
2. the Visual Editor toolbar also behaves as a back-to-pages affordance
3. but both currently point to `/admin`, not `/admin/pages`

That is a small but real product inconsistency.

Required correction:

1. Page Editor back target must be `/admin/pages`
2. Visual Editor back target must be `/admin/pages`
3. keep the visible label/meaning as `Back to pages`

Files:

1. `app/admin/(protected)/pages/[pageId]/page-editor.tsx`
2. `components/admin/visual-editor/page-visual-editor-toolbar.tsx`

## 2. Workspace Proof Is Still Mixed

Current issue:

`tests/admin-foundation/workspace-pages.test.tsx` improved slightly, but the route-level proof for:

1. Page Editor
2. Visual Editor
3. Section Library
4. Global Sections

still relies too much on `fs.readFileSync(...)` and source-string assertions.

That is not strong enough for a finish-grade workspace pass.

Required correction:

1. keep the existing `PageWorkspaceModeTabs` rendered tests if they are still useful
2. replace source-inspection assertions for the touched Phase 3.1 outcomes with rendered behavior tests where practical
3. if a route is too heavy to render directly, extract one narrow pure helper or lightweight presentational subcomponent and test that instead
4. do not fall back to more source-grep tests

## Files To Change

Primary:

1. `app/admin/(protected)/pages/[pageId]/page-editor.tsx`
2. `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
3. `tests/admin-foundation/workspace-pages.test.tsx`

Allowed only if needed for testability:

4. `components/admin/ui.tsx`
5. a new narrow helper or presentational component file for shared page-workspace identity

If you add a helper/component:

1. keep it very small
2. keep it presentation-only
3. do not start another refactor

## Exact Implementation Steps

### Step 1: Correct The Back Target

In both route surfaces:

1. change the back target from `/admin` to `/admin/pages`
2. keep the rest of the page-workspace identity unchanged

This must land in:

1. `PageEditorHeader`
2. Visual Editor toolbar back link

### Step 2: Upgrade The Proof

Refactor `tests/admin-foundation/workspace-pages.test.tsx` so it no longer pretends source inspection is route proof.

Minimum acceptable result:

1. render `PageWorkspaceModeTabs` and prove both route links and active mode behavior
2. render a narrow shared page-workspace identity surface, if one exists or is extracted, and prove:
   - back link points to `/admin/pages`
   - page slug is shown
   - mode tabs render correctly
3. prove Section Library primary-create hierarchy without raw source grep if possible:
   - either render the relevant route shell
   - or render a narrow extracted header/action surface
4. prove Global Sections top-level workspace hierarchy without raw source grep if possible:
   - either render the top workspace shell
   - or render a narrow extracted route-top structure

Rules:

1. do not try to render the entire world if route dependencies make that brittle
2. extract a narrow presentational unit when needed
3. prefer testing stable UI output over implementation strings

### Step 3: Keep This Batch Small

Do not touch anything else.

This is a finish batch, not another workspace phase.

## Hard Rules

1. do not change editor logic
2. do not change publishing logic
3. do not redesign the workspace layout
4. do not keep source-inspection tests for these exact Phase 3.1 outcomes unless there is a hard technical blocker and you explicitly report it
5. do not move to Phase 4 from this batch

## Required Validation

Run exactly:

```bash
npm test -- tests/admin-foundation tests/admin-collection-pages
npm test -- tests/visual-editor
npm run build
```

Also run any focused workspace test file directly if you split it out and report it explicitly.

## Acceptance Standard

This batch passes only if:

1. both page-workspace back affordances now target `/admin/pages`
2. the remaining Phase 3.1 proof is materially stronger than source inspection
3. admin-foundation tests pass
4. admin-collection-pages tests pass
5. visual-editor regression tests pass
6. build passes

## Completion Report Format

Return:

1. files changed
2. exact back-target correction
3. exactly which source-inspection assertions were removed or replaced
4. exactly what rendered proof was added
5. exact command output counts

Do not call this complete if the tests still prove the route structure mainly by reading source files.
