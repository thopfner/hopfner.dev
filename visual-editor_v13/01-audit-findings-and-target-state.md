# Audit Findings And Target State

## Issue List

1. The v11 blocker summary says media-library integration is blocked by Mantine provider requirements.
2. The v11 blocker summary says composer schema lacks enough metadata for a safe generic editor.
3. The visual-editor page-settings hook does not follow the canonical page backdrop persistence contract.
4. The new v11 composition test file is mostly import-only and does not prove the claimed workflows.

## Why Each Issue Exists

1. The blocker summary is inaccurate. `components/media-library-modal.tsx` is already MUI-based, `components/media-picker-menu.tsx` is MUI-based, `components/image-field-picker.tsx` is MUI-based, and the admin theme provider is MUI-based in `components/app-theme-provider.tsx`.
2. The codebase already contains a generic schema-driven composer editor path:
   1. `normalizeComposerSchema` and `flattenComposerSchemaBlocks` in `components/admin/section-editor/payload.ts`
   2. `CustomComposerEditor` in `components/admin/section-editor/editors/custom-composer-editor.tsx`
   3. `CustomBlockEditor` in `components/admin/section-editor/editors/custom-block-editor.tsx`
3. `components/admin/visual-editor/use-page-settings-actions.ts` currently updates only `formatting_override`, while the form editor correctly writes both `bg_image_url` and `formatting_override`. The public renderer consumes `page.bg_image_url`, not `formatting_override.bgImageUrl`.
4. `tests/visual-editor/v11-composition.test.ts` mainly verifies modules are importable. That is not meaningful evidence for add/insert/history/page-settings/media/composed-editor behavior.

## Required Direction

1. Treat media-library integration as a reuse task, not a blocker investigation.
2. Treat custom/composed support as an in-context reuse task for the existing generic composer editor.
3. Correct the page-settings save contract before expanding the media UI.
4. Replace weak test coverage with behavior tests tied to the touched flows.

## Files Expected To Change

Primary files for phase 1:

1. `components/admin/visual-editor/use-page-settings-actions.ts`
2. `components/admin/visual-editor/page-visual-editor-page-panel.tsx`
3. `components/admin/visual-editor/page-visual-editor-media-field.tsx`
4. `components/admin/visual-editor/page-visual-editor-inspector.tsx`
5. shared media/upload helpers extracted or reused from:
   1. `components/media-library-modal.tsx`
   2. `components/image-field-picker.tsx`
   3. `components/media-picker-menu.tsx`
   4. `lib/media/upload.ts`
   5. `components/admin/section-editor/use-section-editor-resources.ts`

Primary files for phase 2:

1. `lib/admin/visual-editor/load-page-visual-state.ts`
2. `components/admin/visual-editor/page-visual-editor-types.ts`
3. `components/admin/visual-editor/page-visual-editor-composed-section-panel.tsx`
4. `components/admin/visual-editor/page-visual-editor-inspector.tsx`
5. reused editor infrastructure from:
   1. `components/admin/section-editor/payload.ts`
   2. `components/admin/section-editor/editors/custom-composer-editor.tsx`
   3. `components/admin/section-editor/editors/custom-block-editor.tsx`
   4. `components/admin/section-editor/content-editor-router.tsx`

Test files:

1. `tests/visual-editor/v11-composition.test.ts`
2. one or more new behavior-focused visual-editor test files

## Stop Condition If Assumptions Break

Stop and report before continuing if either of these is true:

1. the existing `CustomComposerEditor` cannot be mounted safely in the visual-editor inspector without pulling in unsupported form-editor-only state that cannot be isolated
2. a specific current custom block type used in production has no editor support in `CustomBlockEditor`, in which case report the exact block type and missing editor path
