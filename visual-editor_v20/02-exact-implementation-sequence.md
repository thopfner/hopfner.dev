# Exact Implementation Sequence

## Files To Change, In Order

1. `components/admin/section-preview.tsx`
2. `components/admin/visual-editor/page-visual-editor-node.tsx`
3. `tests/visual-editor/...` exact file(s) needed for rendered proof
4. `components/admin/visual-editor/page-visual-editor-canvas.tsx` only if the canvas host itself is proven to contribute after steps 1 and 2

## Step 1: Create An Explicit Embedded Preview Surface Anchor

In `components/admin/section-preview.tsx`:

1. Identify the current embedded-mode host and the inner scaled wrapper.
2. Introduce one explicit `relative` surface-anchor element for visual-editor embedded previews.
3. This surface anchor must represent the real visible section surface, not the outer node boundary.
4. If `bg-background` on the embedded host is what produces the visible fake band, move or remove that background from the wrong layer so the host stops painting a separate row.
5. Preserve the current token/theme context, scaling, and navigation suppression behavior.

Required result of Step 1:

1. the embedded preview has one clear surface wrapper that chrome can target
2. the host no longer paints a visually separate band above the section content

## Step 2: Move Chrome To The Preview Surface

In `components/admin/visual-editor/page-visual-editor-node.tsx`:

1. Stop anchoring the type pill and actions to the outer node wrapper.
2. Remove the current `top-0` + `-translate-y-1/2` boundary-straddling model.
3. Render chrome against the new preview surface anchor from Step 1.
4. Use minimal inset overlay placement:
   - type pill: compact top-left inset
   - actions: compact top-right inset
5. Keep the chip visually small.
6. Keep global/locked and dirty semantics.
7. Keep pointer behavior and selection behavior unchanged.

Required result of Step 2:

1. chrome clearly reads as overlay on the section itself
2. the section no longer appears to gain extra top spacing

## Step 3: Add Rendered Proof For The Actual Regression

Do not stop at pure state resolvers.

Add rendered tests that prove:

1. chrome is no longer rendered with the old boundary-straddling model
2. the embedded preview exposes a surface anchor for node chrome
3. the selected node does not rely on a full-width top chrome row

If a tiny presentational extraction is needed for testability, keep it tiny and local.

## Step 4: Manual QA On Real Selected Sections

Use the live visual editor and verify at minimum:

1. `Card Grid`
2. `Social Proof Strip`
3. `Title/Body List`

The chip must visually sit on the section, not on a fake row above it.

## What Must Not Change

1. no spacing-token edits
2. no frontend renderer edits
3. no footer redesign
4. no broad refactor

## Gate

Do not mark this batch complete until:

1. the old boundary-straddling placement is gone
2. the preview host no longer paints a fake band
3. the selected sections listed above visually look correct
4. the rendered tests pass
