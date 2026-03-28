# Phase 2: Page Workspace Action Consistency

## Goal

Turn the page-workspace footer from a persistent but shape-shifting footer into a stable premium action bar that keeps the same layout in clean and dirty states.

## Files To Change, In Order

1. `components/admin/visual-editor/page-visual-editor-page-panel.tsx`
2. `components/admin/visual-editor/use-page-settings-actions.ts` only if a small helper/state addition is strictly needed
3. the exact tests added in Phase 1 for footer behavior

## Source Workflows And Files To Reuse

1. reuse the current `isDirty`, `savePageSettings`, and `discardPageSettings` contract
2. reuse the current premium page-panel layout and grouped controls
3. keep the current media-library and backdrop/display editing behavior unchanged

## Step-By-Step Implementation

1. Keep the footer always rendered.
2. Keep the primary action area visually stable in both clean and dirty states.
3. In clean state:
   - keep the primary `Save page settings` button visible but disabled
   - keep a clear saved-state label in the same footer row
   - do not collapse the footer into status text only
4. In dirty state:
   - enable `Save page settings`
   - keep `Discard` visible
   - preserve the same overall footer structure and alignment used in clean state
5. Keep the footer copy short and productized. Avoid internal-tool language.
6. If you surface a "Saved" status, make it factual and local. Do not invent server timestamps that are not already tracked.
7. Ensure keyboard focus and disabled states are visually obvious and accessible.

## Required Behavior

1. the footer remains visible at all times
2. clean state still looks like an action bar, not a collapsed info row
3. dirty state and clean state use the same visual hierarchy
4. save/discard semantics remain truthful

## What Must Not Change In This Phase

1. do not change page persistence behavior
2. do not add new page settings
3. do not add async timestamp plumbing unless it already exists

## Required Tests For The Phase

1. test that the footer always renders
2. test that clean state shows a disabled primary action plus saved status
3. test that dirty state shows enabled save plus discard
4. test that action order/hierarchy stays consistent between states

## Gate For Moving Forward

Do not proceed to Phase 3 until all of the following are true:

1. the footer layout is stable across clean and dirty states
2. the clean state still exposes the primary action area
3. the dirty state still exposes truthful save/discard actions
4. the phase tests pass
