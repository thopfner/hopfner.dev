# Exact Root Cause

## Current Code Reality

In `components/admin/section-preview.tsx` embedded mode:

1. the outer host is `relative`
2. the inner preview surface is:
   - `<div ref={embeddedRef} className="bg-background" style={{ transform: scale(...) }}>`
3. `chromeSlot` is rendered **after** that inner surface as a sibling

That means:

1. preview content is rendered in scaled coordinates
2. chrome is rendered in unscaled coordinates
3. the chip and actions are not truly attached to the section surface

## Why The Result Still Looks Wrong

Because the chip is unscaled and mounted outside the scaled surface:

1. it does not visually belong to the same surface as the section
2. it exaggerates the top band / top padding area
3. the eye reads it as a separate row or gap

This is not a padding-token problem.
This is not a design-direction problem.
This is a mount-point problem.

## Target Fix

The target fix is exact:

1. mount `chromeSlot` **inside** the same scaled `embeddedRef` surface wrapper
2. make that inner wrapper `relative`
3. keep chrome absolutely positioned against that inner wrapper
4. keep the outer host responsible only for clipping, theme/token context, and event suppression

After this change, the chip and actions will live in the same coordinate space as the section content they overlay.
