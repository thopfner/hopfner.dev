# Phase 1: Canvas Chrome And Structure Rail Polish

## Goal

Make the canvas calmer and the structure rail faster to scan without losing editing power.

## Files To Change, In Order

1. `components/admin/visual-editor/page-visual-editor-node.tsx`
2. `components/admin/visual-editor/page-visual-editor-structure.tsx`
3. any minimal shared style/helper extraction needed to keep the changes disciplined
4. the smallest possible test set needed to prove the changed behavior

## Source Workflows And Files To Reuse

1. reuse the current selected-state and section-actions behavior in `page-visual-editor-node.tsx`
2. reuse the current title-first structure-rail model in `page-visual-editor-structure.tsx`
3. reuse existing status concepts rather than inventing new ones

## Step-By-Step Implementation

1. In `page-visual-editor-node.tsx`, consolidate the current chip/badge treatment so the preview remains visually primary.
2. Keep the section type visible, but make it feel like metadata rather than a competing header strip.
3. Reduce duplicate status presentation. If selected state, edited state, and locked state can be communicated with fewer elements, do that.
4. Keep section actions available, but do not let the action cluster dominate the top-right corner when the section is simply selected.
5. In `page-visual-editor-structure.tsx`, improve row hierarchy for long titles and dense pages.
6. Keep title first and type second, but improve truncation, spacing, and status readability.
7. Prefer clearer selected-state treatment and cleaner status grouping over additional dots or pills.
8. If a small supporting helper is needed for display-title resolution or status summarization, extract it cleanly and test it.

## Required Behavior

1. selected sections still have clear affordances, but the preview remains the visual focus
2. section type and status are still visible without consuming unnecessary visual weight
3. structure-rail rows scan faster on long pages
4. long section titles degrade more gracefully than they do now

## What Must Not Change In This Phase

1. do not remove any critical action without providing an equally discoverable replacement
2. do not change section ordering mechanics
3. do not redesign the entire canvas layout
4. do not touch page settings or composed-section behavior in this phase

## Required Tests For The Phase

1. add or upgrade tests around structure-rail row rendering and status summarization if helpers are extracted
2. add behavior-oriented proof for any new chrome state logic that affects selection or status visibility
3. keep the current visual-editor suite passing

## Gate For Moving Forward

Do not proceed to Phase 2 until all of the following are true:

1. the canvas looks calmer than before
2. structure-rail scanning is improved without loss of clarity
3. the phase tests pass
