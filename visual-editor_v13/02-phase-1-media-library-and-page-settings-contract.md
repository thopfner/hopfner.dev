# Phase 1: Media Library And Page Settings Contract

## Goal

Finish the visual-editor media workflow using the existing backend media stack and correct page backdrop persistence to match the canonical DB contract.

## Files To Change, In Order

1. `components/admin/visual-editor/use-page-settings-actions.ts`
2. `components/admin/visual-editor/page-visual-editor-page-panel.tsx`
3. `components/admin/visual-editor/page-visual-editor-media-field.tsx`
4. `components/admin/visual-editor/page-visual-editor-inspector.tsx`
5. shared helper extraction or reuse in:
   1. `components/admin/section-editor/use-section-editor-resources.ts`
   2. `lib/media/upload.ts`
   3. `components/media-library-modal.tsx`
   4. `components/image-field-picker.tsx`
   5. `components/media-picker-menu.tsx`
6. `tests/visual-editor/...` relevant new or updated behavior tests

## Source Workflows Or Files To Reuse

1. Reuse the canonical page backdrop save behavior from `app/admin/(protected)/pages/[pageId]/page-editor.tsx`.
2. Reuse the current CMS media upload path from `lib/media/upload.ts`.
3. Reuse `MediaLibraryModal` instead of creating a new modal.
4. Reuse `ImageFieldPicker` or wrap it for visual-editor usage instead of maintaining a parallel lightweight media field.

## Step-By-Step Implementation

1. Fix `use-page-settings-actions.ts` first.
2. Make the hook load and persist page backdrop state using:
   1. `pages.bg_image_url` for the background image URL
   2. `pages.formatting_override` for backdrop scope and opacity settings
3. Keep the save payload aligned with the form editor’s `updatePageSettings` behavior. Do not create a visual-editor-only page settings contract.
4. In `page-visual-editor-page-panel.tsx`, stop reading backdrop image URL from ad hoc keys inside `formatting_override`.
5. Initialize the page panel from `pageState.pageBgImageUrl` plus `pageState.pageFormattingOverride`.
6. Replace or rewrite `page-visual-editor-media-field.tsx` so the visual editor uses the same media interaction model as the rest of the backend.
7. The resulting visual-editor media field must support:
   1. choose from library
   2. upload new
   3. paste or edit URL where the current CMS contract allows URL storage
   4. clear value
   5. thumbnail preview
8. Use the existing MUI modal and picker stack. Do not reintroduce Mantine and do not create a second custom modal.
9. Wire the media field into the currently supported visual-editor surfaces:
   1. page backdrop image in the page panel
   2. section background media in the inspector
10. If helper extraction is needed, extract a shared visual-editor-safe media controller instead of copying upload/library logic out of the form editor.

## Required Behavior

1. Saving page backdrop settings from the visual editor must update the same canonical DB fields as the form editor.
2. Reopening the page panel after reload must show the saved backdrop image from `pageState.pageBgImageUrl`.
3. Choosing an image from the media library must populate the active visual-editor media field without leaving the page.
4. Uploading a new image must use the existing CMS media pipeline and produce a usable URL.
5. The visual editor must remain visually consistent with the current backend MUI-based modal/picker system.

## What Must Not Change In This Phase

1. Do not change the public renderer.
2. Do not create a second upload pipeline.
3. Do not leave the old lightweight URL-only media field as the primary implementation.
4. Do not store canonical backdrop URL only inside `formatting_override`.

## Required Tests For The Phase

1. Add or update a behavior test that verifies page-settings save writes the canonical page fields.
2. Add or update a behavior test that verifies the media-library picker can open from the visual-editor media field.
3. Add or update a behavior test that verifies media selection updates the current field value.

## Gate For Moving Forward

Do not proceed until all of the following pass:

1. page backdrop editing saves through the canonical DB contract
2. the page panel reloads with the saved backdrop correctly
3. the visual editor can open the existing media library
4. the visual editor can select and clear media for currently wired fields
5. the new behavior tests pass
