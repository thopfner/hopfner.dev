# Phase 1: Composed Support Truth

## Goal

Make canvas and inspector use the exact same standard for deciding whether a composed section is supported in the visual editor.

## Files To Change, In Order

1. `components/admin/visual-editor/page-visual-editor-composed-section-panel.tsx`
2. a small shared helper file for composed support classification if needed
3. `components/admin/visual-editor/page-visual-editor-node.tsx`
4. the smallest possible test set needed to prove the behavior

## Source Workflows And Files To Reuse

1. reuse `normalizeComposerSchema`
2. reuse `flattenComposerSchemaBlocks`
3. reuse the current composed-section fallback behavior only for truly unsupported cases

## Step-By-Step Implementation

1. Create one shared support-classification path for composed sections.
2. Base support on the same real conditions already used by the inspector path: normalized schema plus usable flattened blocks.
3. Use that shared support result in `page-visual-editor-composed-section-panel.tsx`.
4. Use the same shared support result in `page-visual-editor-node.tsx`.
5. Keep the supportive “Composed” canvas treatment only for sections that are truly supported.
6. Keep the unsupported fallback banner only for sections that are genuinely unsupported.
7. Do not let raw schema presence alone count as support anymore.
8. Add or upgrade tests that prove supported and unsupported composed sections are classified consistently.

## Required Behavior

1. supported composed sections do not show an unsupported banner on canvas
2. unsupported composed sections still show a truthful fallback
3. canvas and inspector can no longer disagree about support status

## What Must Not Change In This Phase

1. do not change composed-section persistence
2. do not widen into a schema redesign
3. do not add new composed editing capabilities

## Required Tests For The Phase

1. add a behavior or helper test for supported composed classification
2. add a behavior or helper test for unsupported composed classification
3. prove both canvas and inspector consume the same support decision

## Gate For Moving Forward

Do not proceed to Phase 2 until all of the following are true:

1. one shared composed-support decision exists
2. supported and unsupported sections are classified consistently across canvas and inspector
3. the phase tests pass
