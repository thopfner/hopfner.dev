# Root Causes And Non-Negotiable Direction

This file is not optional reading. It defines what the coding agent is and is not allowed to do.

## Issue 1: Page Chooser Readability

### Current failure

File:
- `components/admin/visual-editor/page-visual-editor-toolbar.tsx`

Why it fails:
- chooser panel is local inline UI, not a true floating surface
- selected row treatment is too translucent
- toolbar is not treated as a hardened shell layer

### Required direction

Do not “darken the dropdown” and move on.

Fix:
- layering
- opacity
- selected-row contrast
- focus/escape behavior

## Issue 2: Link Picker UX

### Current failure

Files:
- `components/landing/editable-link-slot.tsx`
- `components/admin/visual-editor/page-visual-editor-canvas.tsx`

Why it fails:
- link picker is trapped inside the scaled preview DOM
- the canvas is the scroll container
- narrow layouts convert link editing into sideways canvas interaction

### Required direction

Do not patch the existing inline popover with more width.

Fix:
- move picker to a portaled anchored surface
- clamp to viewport
- prevent horizontal overflow by design

## Issue 3: Spacing Handle Truthfulness

### Current failure

Files:
- `components/admin/visual-editor/page-visual-editor-spacing-handles.tsx`
- `components/admin/section-preview.tsx`
- `app/(marketing)/[slug]/page.tsx`

Why it fails:
- drag handle writes `paddingY`
- public renderer consumes `paddingY` through wrapper/container logic
- admin preview does not apply that same wrapper/container logic

### Required direction

Do not change handle math first.

Fix:
- extract shared wrapper/container logic from the public renderer
- make admin preview use that exact logic
- only then validate handle behavior

## Issue 4: Save/Publish Discoverability

### Current failure

Files:
- `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
- `components/admin/visual-editor/page-visual-editor-inspector.tsx`
- `components/admin/visual-editor/page-visual-editor.tsx`

Why it fails:
- real actions live in the inspector
- toolbar shows status but not the primary section actions
- the shell does not degrade well at narrower widths

### Required direction

Do not just shrink button text.

Fix:
- put section-level actions in the toolbar
- keep inspector actions as a secondary path
- make the toolbar layout responsive without hiding the important controls

## One Architectural Rule For This Batch

There are two fixes here:

1. floating surfaces
2. wrapper/render parity

Everything else is downstream of those two.

Do not start shell polish or button tweaks before those foundations are in place.

## Files The Coding Agent Is Expected To Touch

High-confidence touch list:

- `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
- `components/landing/editable-link-slot.tsx`
- `components/admin/visual-editor/page-visual-editor-canvas.tsx`
- `components/admin/visual-editor/page-visual-editor.tsx`
- `components/admin/visual-editor/page-visual-editor-inspector.tsx`
- `components/admin/visual-editor/page-visual-editor-spacing-handles.tsx`
- `components/admin/section-preview.tsx`
- `app/(marketing)/[slug]/page.tsx`

Expected new helpers:

- `components/admin/visual-editor/floating-surface.tsx`
- `lib/cms/section-container-props.ts`
- optional shared action hook for toolbar + inspector

## Stop Condition

If the coding agent finds they cannot implement a change without altering public-render output or schema shape, they must stop and report that conflict instead of improvising.
