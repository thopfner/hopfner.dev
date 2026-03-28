# Phase 2: Page Preview Truth, Composed Parity, And Preview Safety

## Goal

Make the visual editor truthfully preview unsaved page settings, finish composed-section link/media parity, and fully suppress live navigation inside the canvas.

## Files To Change, In Order

1. `components/admin/visual-editor/use-page-settings-actions.ts`
2. `components/admin/visual-editor/page-visual-editor-page-panel.tsx`
3. `components/admin/visual-editor/page-visual-editor.tsx`
4. `components/admin/visual-editor/page-visual-editor-canvas.tsx`
5. `components/admin/visual-editor/page-visual-editor-composed-section-panel.tsx`
6. `components/admin/section-preview.tsx`
7. the smallest possible set of visual-editor tests needed to prove the behavior

## Source Workflows And Files To Reuse

1. reuse the canonical page save contract from `app/admin/(protected)/pages/[pageId]/page-editor.tsx`
2. reuse current page-settings actions rather than creating a second persistence model
3. reuse the existing section-editor link resource loaders and link field workflows for page lists, anchors, and external/custom URLs
4. reuse the existing MUI-based media library and picker stack already used in admin
5. reuse the current preview-boundary suppression pattern in `components/admin/section-preview.tsx`, but finish it instead of duplicating it per section

## Step-By-Step Implementation

1. Thread unsaved page draft values into the visual-editor preview path so page-level edits are visible before save.
2. Keep persistence canonical. The save operation must continue to write the same page fields as the existing form-editor contract.
3. Do not create a shadow preview model that diverges from the save model. The preview draft should be a view-layer extension of the current page settings path.
4. In the composed-section panel, replace stubbed link resources with the real page/anchor/custom-link resources used by the form editor.
5. In the composed-section panel, replace the no-op image-library opening path with the real media-library open/select flow already used elsewhere in admin.
6. Keep the composed-section editor in-context inside the visual editor. Do not regress it back into a “use form editor” dead end for currently supported schemas.
7. Harden `section-preview.tsx` so preview anchors cannot navigate by keyboard activation. Handle the relevant activation keys at the preview boundary rather than patching individual CTA components.
8. Add behavior tests that prove:
   - unsaved page settings affect the preview
   - composed sections can use real link resources
   - composed sections can open/select media through the real flow
   - preview anchors are inert for both click and keyboard activation

## Required Behavior

1. page backdrop and related page-level settings visibly affect the visual preview before save
2. saving page settings still persists through the canonical page fields and existing save path
3. composed-section editing can use real link selection rather than stubbed values
4. composed-section editing can use the real media library rather than a dead button or URL-only fallback
5. CTA and link surfaces in the preview do not navigate by mouse or keyboard while still remaining editable/selectable

## What Must Not Change In This Phase

1. do not change the public renderer contract
2. do not redesign the composed-section schema
3. do not add section-specific navigation suppression logic
4. do not widen page settings into a full new page-builder mode

## Required Tests For The Phase

1. add a behavior test proving unsaved page settings update the preview view model
2. add a behavior test proving composed-section link resources are real and not stubbed
3. add a behavior test proving composed-section media selection uses the real admin media flow
4. add a behavior test proving preview anchors are inert for click
5. add a behavior test proving preview anchors are inert for keyboard activation

## Gate For Moving Forward

Do not mark this phase complete until all of the following are true:

1. page settings preview changes are visible before save
2. page settings still save through the canonical contract
3. composed sections no longer use stubbed link/media resources in the supported generic editor path
4. preview anchors are inert for both click and keyboard activation
5. the phase behavior tests pass
