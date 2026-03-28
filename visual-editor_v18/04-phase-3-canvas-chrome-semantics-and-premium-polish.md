# Phase 3: Canvas Chrome Semantics And Premium Polish

## Goal

Make the canvas node chrome communicate the same state story as the improved structure rail, without reintroducing badge clutter or visual noise.

## Files To Change, In Order

1. `components/admin/visual-editor/page-visual-editor-node.tsx`
2. `components/admin/visual-editor/page-visual-editor-structure.tsx` only if a tiny alignment tweak is required
3. any tests created in Phase 1 that cover state semantics

## Source Workflows And Files To Reuse

1. reuse the current consolidated canvas chrome row
2. reuse the rail’s stronger global/locked semantics as the semantic source of truth
3. reuse current dirty-state and selected-state logic

## Step-By-Step Implementation

1. Review the current canvas type pill and compare it directly with the rail semantics.
2. Make global reusable sections communicate both meanings clearly in canvas chrome:
   - global
   - locked/reusable
3. Keep this explicit, but lightweight. Use concise icon-plus-label treatment or equivalent compact semantics. Do not revert to the old noisy badge stack.
4. Keep unsaved/dirty indication visible without competing with the primary section-type label.
5. Keep selected, hover, global, locked, and dirty states visually ordered by importance:
   - section identity first
   - reusable/global semantics second
   - unsaved attention signal third
6. Align labels/tooltips/copy with the structure rail so the user does not see two different meanings in two places.
7. If the rail needs a tiny wording or tooltip adjustment to fully align with canvas, make the smallest change necessary.

## Required Behavior

1. canvas and rail communicate compatible state semantics
2. global sections are not reduced to ambiguous icon shorthand in canvas chrome
3. dirty state remains obvious but visually restrained
4. the touched chrome feels quieter and more premium

## What Must Not Change In This Phase

1. do not add new menus, chips, or status clutter
2. do not make canvas chrome taller or visually heavier than necessary
3. do not change selection, ordering, or section-action functionality

## Required Tests For The Phase

1. test the rendered global/locked semantics in canvas chrome
2. test the rendered dirty-state indication in the touched node state
3. if rail wording changes, test that the touched wording remains aligned

## Gate For Moving Forward

Do not mark the batch complete until all of the following are true:

1. canvas state semantics are explicit and lightweight
2. rail and canvas tell the same story for global/locked sections
3. dirty-state signaling remains visible and restrained
4. the phase tests pass
