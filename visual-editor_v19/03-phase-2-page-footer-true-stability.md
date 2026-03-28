# Phase 2: Page Footer True Stability

## Goal

Finish the footer stabilization work so the footer keeps the same slot footprint and hierarchy in both clean and dirty states.

## Files To Change, In Order

1. `components/admin/visual-editor/page-visual-editor-page-panel.tsx`
2. `components/admin/visual-editor/presentation-state.ts` only if the footer resolver needs a small extension
3. the exact tests that cover page footer behavior

## Source Workflows And Files To Reuse

1. reuse the current `Save page settings` primary action
2. reuse the current discard behavior
3. reuse the current saved-state meaning

## Step-By-Step Implementation

1. Keep the footer always visible.
2. Keep the primary slot always present, as v18 already does.
3. Keep the secondary slot footprint present in both states as well.
4. In clean state:
   - keep the primary action visible and disabled
   - keep a secondary saved-state/status treatment in the secondary slot
5. In dirty state:
   - keep the primary action enabled
   - replace the secondary slot content with the discard action
6. Keep alignment, spacing, and slot widths stable between the two states.
7. Keep copy short and productized.

## Required Behavior

1. clean and dirty states use the same footer structure
2. the footer does not visually jump when state changes
3. save/discard semantics remain truthful

## What Must Not Change In This Phase

1. do not add new page settings
2. do not alter save/discard persistence behavior
3. do not remove the stable primary action pattern introduced in v18

## Required Tests For The Phase

1. test that the footer renders the same slot structure in both clean and dirty states
2. test the exact clean-state slot content
3. test the exact dirty-state slot content

## Gate For Moving Forward

Do not proceed to Phase 3 until all of the following are true:

1. the footer uses one stable structure in both states
2. the clean-state footer is still actionable and explicit
3. the dirty-state footer is truthful and visually aligned
4. the phase tests pass
