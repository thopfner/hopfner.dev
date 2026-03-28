# Phase 2: Composed Section In-Context Editor

## Goal

Replace the current custom/composed-section dead-end with an in-context generic composer editor inside the visual workspace.

## Files To Change, In Order

1. `lib/admin/visual-editor/load-page-visual-state.ts`
2. `components/admin/visual-editor/page-visual-editor-types.ts`
3. `components/admin/visual-editor/page-visual-editor-composed-section-panel.tsx`
4. `components/admin/visual-editor/page-visual-editor-inspector.tsx`
5. shared editor reuse from:
   1. `components/admin/section-editor/payload.ts`
   2. `components/admin/section-editor/editors/custom-composer-editor.tsx`
   3. `components/admin/section-editor/editors/custom-block-editor.tsx`
   4. `components/admin/section-editor/content-editor-router.tsx`
6. `tests/visual-editor/...` relevant new or updated behavior tests

## Source Workflows Or Files To Reuse

1. Reuse `normalizeComposerSchema` and `flattenComposerSchemaBlocks`.
2. Reuse `CustomComposerEditor` as the main generic editing surface.
3. Reuse the existing link-menu and media-field resource patterns from the section editor where needed.
4. Reuse the visual editor’s current dirty-draft update path. Do not build a second custom draft store.

## Step-By-Step Implementation

1. Extend `load-page-visual-state.ts` and `page-visual-editor-types.ts` so the visual editor has access to normalized composer schema for custom/composed types.
2. Do not treat `customTypeRegistry` membership alone as sufficient data. Carry the actual schema needed for editing.
3. Replace the current `ComposedSectionPanel` dead-end with a real in-context editor panel.
4. Mount the generic composer editor inside the visual-editor inspector for composed sections.
5. Feed it:
   1. the normalized composer schema for the selected section type
   2. the current dirty or effective draft content
   3. patch helpers that write into the existing visual-editor draft state
   4. the same page/anchor link resources used elsewhere in the visual editor
   5. the same media upload/library controller established in phase 1
6. Keep the existing form-editor link as a secondary escape hatch only, not the primary path.
7. If a composed section has no schema rows or no blocks, show a truthful empty-state message that explains the section has no editable blocks configured.
8. If a specific current block type is unsupported by `CustomBlockEditor`, stop and report the exact block type. Do not regress to a generic “schema lacks metadata” blocker.

## Required Behavior

1. A composed section with a valid schema opens an editable in-context panel in the visual editor.
2. Editing composer fields updates the current visual-editor draft state.
3. Composer image fields can use the same media library and upload flow from phase 1.
4. Composer CTA/link fields can use the same link resource model as the existing editors.
5. The old “use the form editor” dead-end is no longer the primary path for valid composed sections.

## What Must Not Change In This Phase

1. Do not invent a new composer schema format.
2. Do not require full on-canvas direct manipulation for composed sections in this batch.
3. Do not fork custom block editors into a separate visual-editor-only implementation.
4. Do not claim a schema blocker without naming the exact unsupported block type or missing runtime dependency.

## Required Tests For The Phase

1. Add or update a behavior test that verifies composed sections with schema render an in-context editor panel.
2. Add or update a behavior test that verifies custom block edits update draft content paths.
3. Add or update a behavior test that verifies empty-schema composed sections show a truthful empty state instead of a dead-end blocker.

## Gate For Moving Forward

Do not mark this phase complete until all of the following pass:

1. a valid composed section no longer dead-ends to the form editor
2. the in-context composer editor renders for valid schema-backed composed sections
3. edits flow through the current visual-editor draft state
4. media and link resources work inside the composed editor where supported
5. the new behavior tests pass
