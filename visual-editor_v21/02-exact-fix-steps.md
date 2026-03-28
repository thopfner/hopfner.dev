# Exact Fix Steps

## Files To Change

1. `components/admin/section-preview.tsx`
2. `components/admin/visual-editor/page-visual-editor-node.tsx`
3. the smallest possible rendered test file(s) in `tests/visual-editor`

## Step 1: Fix The `chromeSlot` Mount Point

In `components/admin/section-preview.tsx` embedded mode:

1. Find the current block that renders:
   - outer `relative` host
   - inner `<div ref={embeddedRef} className="bg-background" style={{ transform: ... }}>`
   - `{chromeSlot}` after that inner div
2. Move `{chromeSlot}` so it renders **inside** the `embeddedRef` div, not after it.
3. Make the `embeddedRef` div `relative bg-background`.
4. Keep the transform, width, and transform origin on this same div.
5. Keep the outer host `relative` only for clipping and event handling. The outer host must not be the chrome anchor.

Required result of Step 1:

1. `chromeSlot` is now a child of the scaled preview surface
2. chrome and content share the same coordinate space

## Step 2: Keep Node Chrome Simple

In `components/admin/visual-editor/page-visual-editor-node.tsx`:

1. Keep using `chromeSlot`.
2. Keep the chip/actions absolutely positioned.
3. Do not redesign the chrome.
4. Do not re-anchor it to the outer node wrapper.
5. If needed, make only minimal inset adjustments after Step 1, but only after verifying the mount-point fix first.

Required result of Step 2:

1. no architectural ambiguity remains
2. the node still passes chrome into `SectionPreview`
3. the chrome is visually overlayed on the section itself

## Step 3: Add Rendered Proof

Add tests that prove:

1. `chromeSlot` is rendered inside the scaled preview surface wrapper
2. the old sibling mount pattern is no longer used
3. the node still renders the chip/actions through `chromeSlot`

This proof must be rendered/component proof, not only pure-state resolver proof.

## What Must Not Change

1. no padding token changes
2. no section spacing changes
3. no public renderer changes
4. no footer or inspector changes

## Gate

Do not call this batch complete until:

1. `chromeSlot` is inside `embeddedRef`
2. the old sibling mount is gone
3. live QA shows the chip visually sitting on the section surface
4. tests and build pass
