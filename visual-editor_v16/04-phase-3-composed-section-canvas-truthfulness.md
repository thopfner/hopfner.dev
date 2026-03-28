# Phase 3: Composed Section Canvas Truthfulness

## Goal

Remove the current contradiction where schema-backed composed sections are editable in the visual-editor inspector but still visually blocked on canvas.

## Files To Change, In Order

1. `components/admin/visual-editor/page-visual-editor-node.tsx`
2. `components/admin/visual-editor/page-visual-editor-composed-section-panel.tsx`
3. the smallest possible test set needed to prove the new truthfulness

## Source Workflows And Files To Reuse

1. reuse the current schema-backed composed-section editor path in `page-visual-editor-composed-section-panel.tsx`
2. reuse the current truthful fallback behavior only for sections that are actually unsupported
3. reuse the current section-preview path instead of inventing a second composed preview model

## Step-By-Step Implementation

1. Narrow or remove the current blocking banner in `page-visual-editor-node.tsx` for schema-backed composed sections that the current inspector/editor path already supports.
2. Keep a truthful fallback only when there is genuinely no usable schema or no editable block path.
3. Ensure the canvas treatment and the inspector treatment tell the same story.
4. If a lighter informational state is still needed for composed sections, make it supportive rather than blocking.
5. Add or upgrade tests that prove:
   - schema-backed composed sections are not hard-blocked on canvas
   - unsupported composed sections still show a truthful fallback

## Required Behavior

1. schema-backed composed sections no longer tell the user “visual editing is not available” when it actually is
2. truly unsupported composed sections still have a truthful fallback path
3. the visual editor feels internally consistent for composed sections

## What Must Not Change In This Phase

1. do not fake support for sections that still lack usable schema
2. do not change composed-section persistence contracts
3. do not widen into new schema or composer architecture work

## Required Tests For The Phase

1. add behavior-oriented proof for schema-backed composed sections no longer being blocked on canvas
2. add proof that unsupported composed sections still fall back truthfully
3. keep the current visual-editor suite passing

## Gate For Moving Forward

Do not mark this phase complete until all of the following are true:

1. supported composed sections are no longer visually contradicted on canvas
2. unsupported composed sections still have a truthful fallback
3. the phase tests pass
