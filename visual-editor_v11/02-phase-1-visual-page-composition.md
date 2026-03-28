# Phase 1: Visual Page Composition

## Goal

Make the visual editor own page composition for built-in section workflows.

Required outcomes:

1. Add section from the visual editor.
2. Insert section above or below an existing section.
3. Duplicate a section on the current page.
4. Delete a local section from the visual editor.
5. Reorder sections and save order using the current persistence path.

Do not implement cross-page bulk duplication in this phase. Keep the scope on current-page composition.

## Files To Change, In Order

1. `app/admin/(protected)/pages/[pageId]/page-editor.tsx`
2. `components/admin/visual-editor/use-page-composition-actions.ts`
3. `components/admin/visual-editor/page-visual-editor-store.ts`
4. `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
5. `components/admin/visual-editor/page-visual-editor-structure.tsx`
6. `components/admin/visual-editor/page-visual-editor-node.tsx`
7. `components/admin/visual-editor/page-visual-editor-section-library.tsx`
8. `components/admin/visual-editor/page-visual-editor-section-actions-menu.tsx`
9. `tests/visual-editor/...` relevant new or existing files

## Step-By-Step Implementation

1. Extract the stable section-creation and same-page duplication logic out of `page-editor.tsx` into shared helpers or a shared action module.
2. Keep the legacy form editor calling the shared helper so the behavior does not diverge.
3. Create `use-page-composition-actions.ts` for the visual editor. It must expose:
   1. `addSection(sectionType, position?)`
   2. `insertRelative(targetSectionId, direction, sectionType)`
   3. `duplicateSection(sectionId)`
   4. `deleteSection(sectionId)`
4. Use the same seeded defaults and version-insert semantics as the form editor. Do not create a visual-editor-only initialization path.
5. Add a section library surface that opens from:
   1. the top toolbar
   2. the structure rail
   3. inline insertion affordances between sections on the canvas
6. The section library must show built-in section label, type, and a short description. It must support search.
7. Add a selected-section actions menu with:
   1. insert above
   2. insert below
   3. duplicate
   4. hide/show
   5. delete
8. Restrict destructive delete to local sections in this phase. Global sections must not be deletable from page context.
9. Keep reorder behavior in the current structure rail. Do not rewrite drag-and-drop architecture in this phase.
10. After every add, insert, duplicate, delete, or reorder action:
   1. refresh page state
   2. preserve or reassign selection intentionally
   3. surface success or error feedback

## Required Behavior

1. A new section inserted between two existing sections must land in the correct position without requiring manual reorder cleanup.
2. Duplicating a section must preserve the current content and formatting payload for the new local section.
3. Deleting a section must require confirmation and must not affect global sections on other pages.
4. No current save/publish behavior may regress.

## What Must Not Change In This Phase

1. Do not alter the frontend renderer.
2. Do not add cross-page duplication UI.
3. Do not build template marketplace or pattern packs.
4. Do not modify database schema.

## Gate For Moving Forward

Do not proceed until all of the following pass:

1. A built-in section can be added from the visual editor.
2. A section can be inserted above and below another section.
3. A section can be duplicated on the current page.
4. A local section can be deleted with confirmation.
5. Reorder still saves correctly.
6. The old form editor still performs add and duplicate correctly.
7. Targeted visual-editor tests for add/insert/duplicate/delete/reorder pass.
