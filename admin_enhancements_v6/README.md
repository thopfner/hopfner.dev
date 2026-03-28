# Admin Enhancements v6

## Phase 3.1 Correction Batch

This is a narrow correction pass for Phase 3.

Do not broaden scope.
Do not redesign the admin system again.
Do not touch collection pages.
Do not change underlying editor logic, publishing logic, or data contracts.

The goal is to finish the specific Phase 3 items that were only partially completed.

## Scope

Only these items are in scope:

1. make Page Editor and Visual Editor feel like sibling workspaces
2. remove duplicate primary-action hierarchy in Section Library
3. give Global Sections a real workspace hierarchy instead of just a new header
4. add targeted proof for the routes touched in this batch

Out of scope:

1. any Phase 4 auth or secondary-surface work
2. any collection-page work
3. any visual-editor feature work unrelated to workspace alignment
4. any change to section editing capabilities or backend behavior

## Exact Problems To Fix

### 1. Page Editor And Visual Editor Still Do Not Read As One Workspace Family

The Page Editor now uses `WorkspaceHeader`, but the Visual Editor still presents its older standalone toolbar model.

That means:

1. page identity is not aligned across the two routes
2. status/action hierarchy is not aligned across the two routes
3. the routes still feel related only by URL, not by product design

Required correction:

1. keep the Visual Editor’s custom editing toolbar
2. do **not** flatten it into a generic admin header
3. introduce a shared page-workspace identity pattern used by both:
   - page title
   - slug / public path
   - back-to-pages affordance
   - mode switch between form editor and visual editor
4. make the Page Editor and Visual Editor read as two modes of the same page workspace

Implementation constraint:

The fix must preserve the current Visual Editor strengths:

1. viewport controls
2. save/publish controls
3. add/undo/redo controls

Do not replace those with a generic header. Align identity and mode structure around them.

## 2. Section Library Still Has Duplicate Primary Actions

Current issue:

1. `New custom type` exists in the workspace header
2. `New custom section type` appears again inside the catalog panel

That is not premium hierarchy.

Required correction:

1. keep exactly one primary creation action for the route
2. the single primary creation action must live in the route header
3. remove the duplicate in-panel CTA
4. keep all existing functionality and modal flows

## 3. Global Sections Still Feels Like The Old Screen Under A New Header

Current issue:

1. the route has a new `WorkspaceHeader`
2. but the rest of the page still reads like dense stacked internal-tool papers
3. create flow, site-wide formatting, and management surfaces still do not have clear workspace hierarchy

Required correction:

1. keep all current capabilities
2. reorganize the top of the route into distinct workspace panels with clearer priority
3. create global section must become a clearly bounded primary setup panel
4. site-wide formatting tokens must become a distinct secondary workspace panel
5. error/success/status messaging must sit in predictable workspace positions

Do not change the actual create/apply/save logic.
This is layout and hierarchy work only.

## 4. Proof Is Too Thin For The Touched Workspace Routes

The current admin test surface does not directly prove this Phase 3 work.

Required correction:

Add focused tests that prove the specific outcomes in this batch:

1. Page Editor and Visual Editor expose consistent page-workspace identity affordances
2. Section Library has only one primary creation CTA in the rendered route
3. Global Sections renders the corrected top-level workspace structure

These do not need to be exhaustive workflow tests.
They do need to prove that the structural corrections really landed.

## Files To Change

Primary:

1. `app/admin/(protected)/pages/[pageId]/page-editor.tsx`
2. `components/admin/visual-editor/page-visual-editor.tsx`
3. `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
4. `app/admin/(protected)/section-library/page-client.tsx`
5. `app/admin/(protected)/global-sections/page-client.tsx`
6. targeted admin route tests for these surfaces

Allowed only if clearly needed to avoid duplication:

7. `components/admin/ui.tsx`
8. `lib/admin/route-meta.ts`

If you add a shared primitive, keep it narrow and scoped to page-workspace identity.
Do not start a new design-system refactor.

## Exact Implementation Steps

### Step 1: Finish Page Workspace Identity Alignment

Create one narrow shared pattern for page-workspace identity.

It must cover:

1. page title
2. slug / route identity
3. back-to-pages affordance
4. mode switching between form editor and visual editor

Apply it to:

1. `PageEditorHeader`
2. the top identity zone of the Visual Editor

Rules:

1. keep the Visual Editor toolbar’s existing action controls
2. do not move viewport/save/publish actions into a generic admin header
3. the final result should visually read as:
   - shared page identity + mode context
   - then route-specific editing controls

### Step 2: Remove Section Library Hierarchy Noise

In `app/admin/(protected)/section-library/page-client.tsx`:

1. keep the header-level `New custom type` action
2. remove the duplicate in-panel create button
3. keep all existing create flows working exactly the same
4. ensure the catalog summary row still reads cleanly without the duplicate CTA

### Step 3: Productize The Top Of Global Sections

In `app/admin/(protected)/global-sections/page-client.tsx`:

1. keep `WorkspaceHeader`
2. restructure the top route surfaces into clearly separated workspace panels
3. the first panel should be the primary create/manage entry surface
4. the site-wide formatting/token surface should be clearly secondary
5. preserve every control and capability already present

Do not rewrite the whole route.
The correction is specifically about top-level hierarchy and workspace organization.

### Step 4: Add Targeted Proof

Add focused rendered/admin route tests for:

1. Page Editor / Visual Editor shared page identity affordances
2. Section Library single primary creation CTA
3. Global Sections corrected top-level workspace structure

Proof rules:

1. do not use source-inspection tests for these outcomes
2. render the touched route components where possible
3. if a pure helper is extracted for page-workspace identity, add helper tests too

## Hard Rules

1. do not change save/publish logic
2. do not change visual-editor editing behavior
3. do not remove any Global Sections capability
4. do not duplicate creation actions after this batch
5. do not proceed to Phase 4 from this batch

## Required Validation

Run exactly:

```bash
npm test -- tests/admin-foundation
npm test -- tests/admin-collection-pages
npm test -- tests/visual-editor
npm run build
```

Also run any new targeted admin route tests you add for this batch and report them explicitly.

## Acceptance Standard

This batch passes only if:

1. Page Editor and Visual Editor now read as sibling workspaces through shared page identity and mode context
2. Section Library exposes only one primary create action
3. Global Sections has a clear workspace hierarchy at the top of the route
4. the new structure is proven by rendered tests, not source inspection
5. admin-foundation tests pass
6. admin-collection-pages tests pass
7. visual-editor regression tests pass
8. build passes

## Completion Report Format

Return:

1. files changed
2. exact shared page-workspace identity pattern introduced
3. exact duplicate CTA removed from Section Library
4. exact Global Sections hierarchy changes
5. exact new tests added
6. exact command output counts

Do not describe this batch as complete if the Visual Editor only received incidental refactors or lazy-loading changes.
