# Admin Enhancements v11

## Final Toolbar And Back-Link Correction Runbook

Opus, this is a tiny correction batch.

Do not expand scope.
Do not touch any routes except the ones listed below.
Do not reopen Section Library, Global Sections, Email Templates, or shell work in this batch.

This batch exists for exactly two reasons:

1. the page-workspace back links are wrong and currently route to a non-existent `/admin/pages`
2. the Visual Editor toolbar is close, but the center zone still reads as assembled pieces rather than one premium tool rail

## Objective

Close the last obvious admin defects by:

1. fixing the broken workspace back target
2. finishing the Visual Editor toolbar so it feels fully intentional

without changing:

1. workflow
2. save/publish behavior
3. route structure
4. visual-editor page layout

## Non-Negotiables

1. no feature regression
2. no route rewrites
3. no persistence changes
4. no auth changes
5. no visual-editor logic changes beyond presentation and correct back navigation
6. no changes to unrelated admin routes

If anything starts to widen beyond the files listed below, stop.

## Exact Problems To Fix

### 1. Broken back links

These two files currently point to `/admin/pages`:

1. [page-editor.tsx](/var/www/html/hopfner.dev-main/app/admin/(protected)/pages/[pageId]/page-editor.tsx#L887)
2. [page-visual-editor-toolbar.tsx](/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-toolbar.tsx#L177)

This is wrong for the current app.

The real pages list route is `/admin`, not `/admin/pages`.

So today:

1. the back arrow in form editor is wrong
2. the back arrow in visual editor is wrong
3. tests in [workspace-pages.test.tsx](/var/www/html/hopfner.dev-main/tests/admin-foundation/workspace-pages.test.tsx#L63) are also asserting the wrong target

### 2. Toolbar center rail still not premium enough

The toolbar is improved, but the center zone is still composed as:

1. standalone `Add`
2. divider
3. undo/redo pill
4. divider
5. viewport pill

That is functionally correct, but it still reads like pieces placed next to each other rather than one intentional workspace tool rail.

The current implementation is here:

- [page-visual-editor-toolbar.tsx](/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-toolbar.tsx#L199)

## Scope

Only these files should change:

1. `app/admin/(protected)/pages/[pageId]/page-editor.tsx`
2. `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
3. `tests/admin-foundation/workspace-pages.test.tsx`

Optional:

4. one tiny shared presentational helper in `components/admin/ui.tsx` only if it is clearly reused by the toolbar and does not broaden scope

Do not change any other route files.

## Execution Order

1. fix back-link targets first
2. update tests for the real route target
3. finish the toolbar center rail
4. rerun verification

Do not do the toolbar polish first.
Fix the broken navigation first.

---

## Phase A — Fix The Broken Back Links

### Required Changes

1. Change the Page Editor `WorkspaceHeader` back target from `/admin/pages` to `/admin`.
2. Change the Visual Editor back `Link` target from `/admin/pages` to `/admin`.
3. Keep the label text `Back to pages` if you want. The target is what must be corrected.

### What Must Not Change

1. do not change page mode tab destinations
2. do not change the PageChooser
3. do not change route-meta collection behavior
4. do not create a new `/admin/pages` route in this batch

### Acceptance

Both workspace back affordances must route to the actual pages list route:

1. `/admin`

---

## Phase B — Fix The Proof

The current tests are reinforcing the wrong route target.

### Required Changes

Update the relevant assertions in:

1. `tests/admin-foundation/workspace-pages.test.tsx`

So they assert:

1. `backHref="/admin"`
2. rendered back links point to `/admin`

### Additional Requirement

The test descriptions should stop saying “back to /admin/pages”.
They should reflect the real route target.

---

## Phase C — Finish The Toolbar Center Rail

### Goal

Make the center zone read as one premium tool rail.

### Current Problem

The current composition still reads as:

1. freestanding `Add`
2. separate undo/redo cluster
3. separate viewport cluster

The fix is not to add features.
The fix is to make the zone feel unified.

### Required Structural Outcome

The center zone must read as one cohesive control group containing:

1. Add
2. undo
3. redo
4. viewport switcher

### Exact Implementation Requirements

1. Keep `Add` in the center zone.
2. Do not move it back into the identity zone.
3. Visually unify `Add`, undo/redo, and viewport controls into one rail treatment.
4. Reduce the feeling of separate assembled pills.
5. Keep the controls readable and calm.

### Specific Fix Direction

Use one shared rail container for the whole center zone.

Inside that rail:

1. `Add` should be the first control
2. undo/redo should be the second control group
3. viewport should be the third control group

Rules:

1. internal separators should be subtle
2. control sizing should be consistent
3. `Add` should feel like part of the tool system, not a floating CTA
4. the rail should feel balanced relative to the identity lane and the right-side status lane

### What Must Not Change

1. no new buttons
2. no behavior changes
3. no viewport logic changes
4. no undo/redo logic changes
5. no add-section behavior changes

### Acceptance

The center zone should read at a glance as one deliberate workspace tool rail, not as three adjacent fragments.

---

## Required Verification

Run exactly:

1. `npm test`
2. `rm -rf .next && npm run build`

Do not claim completion if either fails.

## Definition Of Done

This batch is complete only if:

1. both back links route to `/admin`
2. the tests assert `/admin`, not `/admin/pages`
3. the toolbar center zone reads as one unified tool rail
4. no workspace behavior regressed
5. `npm test` passes
6. `rm -rf .next && npm run build` passes

## Required Completion Report

Report exactly:

1. files changed
2. old back targets vs new back targets
3. what was changed in the toolbar center rail
4. exact tests run
5. exact build command run

Do not say “all admin work complete.”
This is a final cleanup batch.
