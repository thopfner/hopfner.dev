# Root Causes And Target State

## Issue List

1. The visual editor edits sections well but does not own page composition.
2. The visual editor loads page-level settings but does not expose them as first-class editable surfaces.
3. Global sections and custom/composed sections still create dead ends.
4. Version history and restore remain buried in the legacy form editor.
5. Media workflows remain stronger in the form editor than in the visual editor.
6. The inspector still exposes too many low-level controls before semantic ones.
7. Undo/redo exists technically but is not productized.

## Why Each Issue Exists

1. The current visual editor was built by layering a canvas and inspector over existing section-version persistence. That solved field editing first, not full page composition.
2. `loadPageVisualState` already hydrates page data, but the no-selection state in the inspector is informational rather than actionable.
3. Global and custom/composed sections were treated defensively to avoid regressions, so the product still routes users out to the old workflows.
4. Save/publish was productized before history/recovery, so version badges exist without restore UX.
5. Text and token editing were prioritized before upload/library integration.
6. The visual editor inherited design-system control vocabulary directly from the CMS backend instead of presenting a semantic-first authoring layer.
7. Keyboard support was added before visible history controls.

## Required Direction

1. Extend the current visual editor. Do not replace it.
2. Pull stable workflows from the form editor into shared helpers or shared UI building blocks.
3. Close the product surface in this order:
   1. composition
   2. page settings
   3. history/recovery
   4. global/custom coverage
   5. media
   6. semantic product polish
4. Prefer safe shared abstractions over one-off patches.

## Files Expected To Change

Primary visual-editor files:

1. `components/admin/visual-editor/page-visual-editor.tsx`
2. `components/admin/visual-editor/page-visual-editor-store.ts`
3. `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
4. `components/admin/visual-editor/page-visual-editor-structure.tsx`
5. `components/admin/visual-editor/page-visual-editor-inspector.tsx`
6. `components/admin/visual-editor/page-visual-editor-node.tsx`
7. `components/admin/visual-editor/use-selected-section-actions.ts`
8. `components/admin/visual-editor/use-visual-section-persistence.ts`
9. `lib/admin/visual-editor/load-page-visual-state.ts`

Likely new visual-editor files:

1. `components/admin/visual-editor/use-page-composition-actions.ts`
2. `components/admin/visual-editor/use-page-settings-actions.ts`
3. `components/admin/visual-editor/page-visual-editor-section-library.tsx`
4. `components/admin/visual-editor/page-visual-editor-section-actions-menu.tsx`
5. `components/admin/visual-editor/page-visual-editor-page-panel.tsx`
6. `components/admin/visual-editor/page-visual-editor-history-panel.tsx`
7. `components/admin/visual-editor/page-visual-editor-global-section-panel.tsx`
8. `components/admin/visual-editor/page-visual-editor-composed-section-panel.tsx`
9. `components/admin/visual-editor/page-visual-editor-media-field.tsx`

Shared-source files to reference or extract from:

1. `app/admin/(protected)/pages/[pageId]/page-editor.tsx`
2. `components/admin/section-editor/section-editor-drawer-shell.tsx`
3. `components/admin/section-editor/use-section-editor-resources.ts`
4. `components/media-library-modal.tsx`
5. `lib/media/upload.ts`

## Stop Condition If Assumptions Break

Stop and report before continuing if either of these is true:

1. The current custom/composed-section schema does not contain enough metadata to drive a safe generic property editor.
2. The page-editor add/duplicate/page-settings/history logic cannot be shared without creating divergent persistence behavior.
