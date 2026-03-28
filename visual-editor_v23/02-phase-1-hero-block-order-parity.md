# Phase 1: Hero Block-Order Parity

## Goal

Replace the weak generic hero block-order editor in the visual inspector with the same constrained workflow the form editor already uses.

## Files To Change, In Order

1. `components/admin/section-editor/editors/hero-cta-editor.tsx`
2. new shared helper file for admin-side hero block-order primitives
3. new visual-editor hero block-order component
4. `components/admin/visual-editor/page-visual-editor-inspector.tsx`
5. targeted visual-editor tests

## Step 1: Extract Shared Hero Block-Order Contract

Create one shared admin-side module for hero block-order logic.

It must export:

- `ALL_BLOCK_KEYS`
- `type BlockKey`
- `BLOCK_LABELS`
- `resolveHeroBlockOrder(raw: string[]): BlockKey[]`

Behavior must be identical to the current form editor:

1. only `ctas`, `stats`, and `trust` are valid
2. invalid keys are dropped
3. missing valid keys are appended in default order
4. returned order always includes all three required blocks

Then update `hero-cta-editor.tsx` to import that shared helper instead of keeping a private duplicate.

### Hard Rule

Do not create a second slightly different helper.
There must be one admin-side hero ordering contract.

## Step 2: Build A Dedicated Visual Hero Block-Order Editor

Create a dedicated visual-editor subcomponent for hero block order.

Required behavior:

1. render exactly three rows from `resolveHeroBlockOrder(...)`
2. rows must be labeled with:
   - `CTAs`
   - `Stats`
   - `Trust`
3. each row must have:
   - move up action
   - move down action
4. split layouts only:
   - show left/right segmented control per row
5. non-split layouts:
   - do not show side controls

### Explicitly Forbidden

Do not include:

- add button
- remove button
- free-text block key field
- generic array editing UI

## Step 3: Replace The Current Visual-Editor Hero Path

In `page-visual-editor-inspector.tsx`:

1. remove the current `ContentArrayEditor` usage for hero `Block Order`
2. mount the new dedicated hero block-order component instead
3. derive the rendered rows from normalized order, not raw array length
4. write back to the same existing payload keys only:
   - `content.heroContentOrder`
   - `content.heroContentSides`

### Important

For split layouts, side assignment must render for all normalized blocks, even if the saved raw order was empty or partial.

Do not gate side controls on `strArr(content.heroContentOrder).length > 0`.
Gate them on normalized order plus split layout.

## Step 4: Preserve Existing Frontend Contract

Do not modify `components/landing/hero-section.tsx`.

The renderer already expects:

- `heroContentOrder`
- `heroContentSides`

This batch is only about ensuring the visual editor writes those fields with the same contract the form editor already guarantees.

## Step 5: Required Manual QA

Use a real hero section in the visual editor and confirm:

1. the hero panel shows `CTAs`, `Stats`, and `Trust` rows without any add/remove UI
2. reordering the rows changes the saved order correctly
3. split layouts show left/right controls for each row
4. non-split layouts do not show left/right controls
5. starting from empty or partial `heroContentOrder`, the editor still renders all three blocks in normalized order

## Stop Gate

Do not proceed to final verification until the visual editor no longer uses a generic free-form array control for hero block order.
