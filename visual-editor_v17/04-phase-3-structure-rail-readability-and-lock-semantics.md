# Phase 3: Structure Rail Readability And Lock Semantics

## Goal

Improve rail scanability and restore explicit meaning for global locked sections without reintroducing noise.

## Files To Change, In Order

1. `components/admin/visual-editor/page-visual-editor-structure.tsx`
2. `components/admin/visual-editor/page-visual-editor-node.tsx` only if a small matching semantics adjustment is needed
3. any minimal helper extracted to support row summary or status display
4. the smallest possible test set needed to prove the behavior

## Source Workflows And Files To Reuse

1. reuse the current title-first row model
2. reuse the current single primary status indicator model where it remains effective
3. restore explicit locked/global meaning with the lightest possible signal

## Step-By-Step Implementation

1. Improve title readability in the rail. Use a more forgiving title treatment than the current single-line truncation if that can be done without making rows noisy.
2. Improve the secondary line so type and semantics are easier to parse.
3. Restore explicit locked/global meaning for reusable sections. Do not leave users inferring “locked” from only a world icon.
4. Keep the row visually quiet. Prefer one clearer secondary-line treatment over extra badges.
5. If the drag handle still competes with content, mute it further or reveal it more intentionally.
6. Add or upgrade tests that prove global/locked semantics and the row summary behavior.

## Required Behavior

1. titles are easier to scan on long pages
2. the secondary line is more legible and informative
3. global locked sections communicate both meanings clearly
4. the rail remains calmer than pre-v16

## What Must Not Change In This Phase

1. do not widen the rail into a new layout system
2. do not add more dots, chips, or badges than necessary
3. do not change section ordering mechanics

## Required Tests For The Phase

1. add proof for row summary/status behavior if a helper is extracted
2. add proof for explicit global/locked semantics
3. keep the current visual-editor suite passing

## Gate For Moving Forward

Do not mark this phase complete until all of the following are true:

1. the rail scans faster on long pages
2. locked/global meaning is explicit again
3. the phase tests pass
