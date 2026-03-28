# Phase 2: Page Workspace, History, And Coverage

## Goal

Remove the biggest reasons a user still has to leave the visual editor.

Required outcomes:

1. No-selection state becomes an editable page workspace.
2. Section history and restore are available inside the visual editor.
3. Global sections have a usable in-context workflow.
4. Custom/composed sections no longer dead-end the user.
5. Undo/redo becomes visible and trustworthy.

## Files To Change, In Order

1. `app/admin/(protected)/pages/[pageId]/page-editor.tsx`
2. `components/admin/section-editor/use-section-editor-resources.ts`
3. `lib/admin/visual-editor/load-page-visual-state.ts`
4. `components/admin/visual-editor/use-page-settings-actions.ts`
5. `components/admin/visual-editor/page-visual-editor-inspector.tsx`
6. `components/admin/visual-editor/page-visual-editor-page-panel.tsx`
7. `components/admin/visual-editor/page-visual-editor-history-panel.tsx`
8. `components/admin/visual-editor/page-visual-editor-global-section-panel.tsx`
9. `components/admin/visual-editor/page-visual-editor-composed-section-panel.tsx`
10. `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
11. `components/admin/visual-editor/page-visual-editor-node.tsx`
12. `tests/visual-editor/...` relevant new or existing files

## Step-By-Step Implementation

1. Extract page-settings update logic from `page-editor.tsx` into shared helpers or a dedicated hook the visual editor can reuse.
2. In the visual editor, replace the passive no-selection inspector state with `page-visual-editor-page-panel.tsx`.
3. The page panel must support the same current page backdrop/layout fields already handled in the form editor:
   1. background image URL or library selection
   2. backdrop scope
   3. nav overlay opacity
   4. backdrop image opacity
   5. page panel opacity
4. The page panel must support save and discard behavior with proper dirty-state semantics.
5. Extract or reuse the existing version-history/restore resource logic from `use-section-editor-resources.ts`. Do not create a second restore implementation.
6. Add a history panel for the selected section. It must show:
   1. version number
   2. status
   3. created timestamp
   4. published timestamp
   5. restore action
7. Add visible undo and redo buttons in the toolbar. Keep keyboard shortcuts, but do not rely on them as the primary UX.
8. Replace the current global-section hard-stop with an in-context panel. Minimum acceptable behavior:
   1. explain that the section is shared
   2. show the current global-section identity
   3. allow opening the shared section editor in a modal, drawer, or context-preserving route
   4. preserve return-to-page context
9. Replace the custom/composed hard-stop with a safe fallback panel.
10. The custom/composed fallback must be schema-driven. Use `section_type_registry.composer_schema` and existing payload contracts. Do not invent ad hoc per-section custom UIs.
11. If the composer schema lacks enough metadata for a safe generic editor, stop here and report the exact missing metadata. Do not ship a fake visual editor for custom/composed sections.

## Required Behavior

1. A user can update page backdrop settings and see the preview remain truthful.
2. A user can restore an older section version from the visual editor.
3. Undo/redo buttons reflect actual availability state.
4. Opening a global-section workflow does not strand the user outside the current page context.
5. Custom/composed sections must either have a safe editable fallback or remain blocked with a documented schema blocker. Silent dead ends are not acceptable.

## What Must Not Change In This Phase

1. Do not change published-page assembly semantics.
2. Do not create custom-section persistence outside the current version tables.
3. Do not remove the existing form-editor history UI.

## Gate For Moving Forward

Do not proceed until all of the following pass:

1. No selection shows an editable page panel, not passive text.
2. Page settings save and discard correctly.
3. A section version can be restored from the visual editor.
4. Undo and redo are visible and function correctly.
5. Global sections no longer present a dead-end blocker.
6. Custom/composed sections either have a safe schema-driven fallback or an explicit documented blocker with no partial broken UI.
7. Targeted visual-editor tests for page settings, history restore, and undo/redo pass.
