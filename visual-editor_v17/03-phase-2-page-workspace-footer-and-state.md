# Phase 2: Page Workspace Footer And State

## Goal

Make the page-workspace panel feel persistent and intentional by keeping a visible sticky footer with explicit clean/dirty state.

## Files To Change, In Order

1. `components/admin/visual-editor/page-visual-editor-page-panel.tsx`
2. any minimal helper extracted to keep footer state logic testable
3. the smallest possible test set needed to prove the behavior

## Source Workflows And Files To Reuse

1. reuse the current page-settings actions and save/discard path
2. reuse the current premium page header and grouped sections
3. keep the current visual design direction; improve the footer/state model only

## Step-By-Step Implementation

1. Make the footer/action area persist even when the page is clean.
2. When clean, show the action buttons in a disabled or non-primary state with an explicit clean status.
3. When dirty, preserve the current strong save/discard affordance.
4. Keep the footer sticky and visually anchored to the panel.
5. Do not make the panel feel busier; use clearer state communication instead of more controls.
6. Add or upgrade tests that prove the footer exists in both clean and dirty states.

## Required Behavior

1. the page-workspace footer is always visible
2. clean and dirty states are communicated clearly
3. save/discard behavior remains unchanged
4. the panel still feels premium and not more cluttered

## What Must Not Change In This Phase

1. do not change page-settings persistence
2. do not move actions into another panel or toolbar
3. do not add new page-level controls

## Required Tests For The Phase

1. add a behavior test for clean footer state
2. add a behavior test for dirty footer state
3. keep the current visual-editor suite passing

## Gate For Moving Forward

Do not proceed to Phase 3 until all of the following are true:

1. the footer remains visible in clean and dirty states
2. state communication is clearer than before
3. the phase tests pass
