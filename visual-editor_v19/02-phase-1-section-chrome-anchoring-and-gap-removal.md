# Phase 1: Section Chrome Anchoring And Gap Removal

## Goal

Remove the false top gutter created by the current node chrome and make the section chip/actions read as true overlay chrome.

## Files To Change, In Order

1. `components/admin/visual-editor/page-visual-editor-node.tsx`
2. `components/admin/section-preview.tsx` only if a small presentational anchor wrapper is strictly needed
3. any focused tests that prove the new chrome placement model

## Source Workflows And Files To Reuse

1. reuse the current node selection, dirty-state, and global/locked logic
2. reuse the current section preview renderer contract
3. keep the current lightweight type/global/dirty semantics

## Step-By-Step Implementation

1. Remove the current full-width top chrome row.
2. Replace it with edge-docked floating chrome that cannot be mistaken for real section spacing.
3. Preferred model:
   - top-left chip cluster anchored to the section edge, not stretched across the full width
   - top-right actions cluster anchored independently to the opposite edge
   - both clusters visually overlap the section boundary or sit just outside it
4. Ensure the chip cluster does not create or imply a content row above the section.
5. Ensure the right-side actions cluster also does not create a false horizontal band.
6. Keep the chip compact. Do not widen it with unnecessary padding.
7. Keep global/locked and dirty semantics visible in the chip cluster.
8. If a small wrapper around the embedded preview is needed so chrome can anchor to the correct surface, add the smallest wrapper possible. Do not alter renderer spacing behavior.
9. Verify selected and hover states both work. The regression must be fixed in both.

## Required Behavior

1. the `Card Grid` style chip no longer appears to occupy its own row
2. there is no apparent blank band above the section that is not present in the frontend
3. chip and actions read as overlay chrome, not content
4. node selection and actions still work

## What Must Not Change In This Phase

1. do not change section spacing tokens
2. do not change the public page renderer
3. do not solve this with fake negative margin hacks on the section content
4. do not regress current dirty/global/locked semantics

## Required Tests For The Phase

1. add a rendered behavior test for the node-chrome layout model
2. prove the chip/actions are not rendered as one full-width top row anymore
3. prove the semantic content of the chip still includes global/locked and dirty states where appropriate

## Gate For Moving Forward

Do not proceed to Phase 2 until all of the following are true:

1. the full-width chrome row is gone
2. selected sections no longer show a false top gutter
3. the phase tests pass
4. manual local visual verification confirms the selected section looks like overlay chrome, not extra spacing
