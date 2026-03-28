# Phase 1: Overlay Chrome And Link Safety

## Goal

Fix the two reported UX gaps without expanding scope:

1. make section-type chrome read as inset editor chrome
2. suppress CTA navigation inside the visual-editor preview while preserving editing

## Files To Change, In Order

1. `components/admin/visual-editor/page-visual-editor-node.tsx`
2. `components/admin/section-preview.tsx`
3. `components/landing/editable-link-slot.tsx`
4. `tests/visual-editor/...` new or updated test files

## Source Workflows Or Files To Reuse

1. Reuse the current visual-editor selection and editing model in `page-visual-editor-node.tsx`.
2. Reuse the current `VisualEditingProvider` boundary in `components/admin/section-preview.tsx`.
3. Reuse the current `EditableLinkSlot` affordances instead of introducing a second CTA editing pattern.

## Step-By-Step Implementation

1. In `page-visual-editor-node.tsx`, replace the current flush edge-strip label treatment with an inset overlay chip.
2. The new chip must:
   1. sit inside the section bounds
   2. use pill styling rather than edge-strip styling
   3. avoid border-bottom and border-right treatments that imply a real row
   4. remain clearly visible when selected
   5. stay visually secondary when not selected
3. Keep the chip absolutely positioned so it does not alter layout.
4. Make the chip non-interactive unless interaction is required. It must not interfere with section selection or spacing handles.
5. In `section-preview.tsx`, add a preview-boundary navigation-suppression layer for `visualEditing` mode.
6. The suppression layer must cancel anchor navigation for clicks inside the embedded preview.
7. The suppression layer must preserve:
   1. inline text editing
   2. link-destination editing
   3. section selection
   4. other editor control clicks
8. Prefer `preventDefault` at the preview boundary over broad pointer-event disabling.
9. In `editable-link-slot.tsx`, add explicit editor-control markers only if needed to keep the link-edit button and related UI exempt from the suppression rule.
10. If key-driven anchor activation is still possible in visual-edit mode, suppress that as well at the preview boundary.
11. Do not touch public section renderers unless the preview-boundary solution provably fails.

## Required Behavior

1. The section-type chip must no longer visually imply extra spacing between sections.
2. Clicking a CTA in the visual editor must never navigate to another URL.
3. Clicking CTA label text must still enter label editing where supported.
4. Clicking the CTA link-edit affordance must still open link editing.
5. Section selection and existing overlay controls must still work.

## What Must Not Change In This Phase

1. Do not change saved CTA href values.
2. Do not change public-site CTA behavior.
3. Do not disable all preview interaction.
4. Do not add unrelated shell polish.

## Required Tests For The Phase

1. Add or update a test that verifies visual-edit preview anchor clicks are prevented from navigating.
2. Add or update a test that verifies link-edit controls still work after navigation suppression is added.
3. Add or update a test or render-contract assertion covering the section-label chrome class/position contract.

## Gate For Moving Forward

Do not mark this phase complete until all of the following pass:

1. the section-type label no longer reads like a separate row
2. CTA clicks do not navigate in visual-editor mode
3. CTA label editing still works
4. CTA link-destination editing still works
5. section selection still works
6. the new tests pass
