# Phase 1: Floating Surfaces And Linking

This phase must be completed first.

## Goal

Replace local inline dropdown/popover behavior with one shared floating-surface pattern for:

1. page chooser
2. CTA/link picker

Do not start Phase 2 until this phase is fully gated.

## Files To Change, In Order

1. Create `components/admin/visual-editor/floating-surface.tsx`
2. Update `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
3. Update `components/landing/editable-link-slot.tsx`
4. Update `components/admin/visual-editor/page-visual-editor-canvas.tsx` only if canvas overflow behavior still interferes after the popovers are portaled
5. Add targeted tests under `tests/visual-editor`

## Step-By-Step Implementation

### Step 1. Create one shared floating surface primitive

Create:
- `components/admin/visual-editor/floating-surface.tsx`

It must support:

- `anchorRect` input
- `open` boolean
- `onClose`
- `createPortal(..., document.body)`
- `position: fixed`
- viewport clamping
- max width and max height clamping
- `overflow-y-auto`
- `overflow-x-hidden`
- outside-click close
- `Escape` close
- strong opaque surface styling

Do not make this a generic app-wide primitive. Keep it local to visual editor code.

### Step 2. Move PageChooser onto the floating surface

Update:
- `components/admin/visual-editor/page-visual-editor-toolbar.tsx`

Required changes:

- toolbar root becomes a true shell layer:
  - `relative`
  - `z-*`
  - `isolate`
- chooser trigger stores its anchor rect
- chooser panel renders through `FloatingSurface`
- chooser selected item gets a solid selected background, not a faint wash
- chooser search stays at the top
- page results remain vertical

Required UX:

- no preview bleed through the chooser
- `Escape` closes
- outside click closes
- current page is immediately readable

### Step 3. Move CTA link picker onto the floating surface

Update:
- `components/landing/editable-link-slot.tsx`

Required changes:

- remove inline absolute popover as the primary link-picker surface
- preserve label editing in place
- open destination picker via `FloatingSurface`
- clamp width to viewport
- force vertical layout for all option groups
- truncate long slug/href previews instead of expanding layout
- keep the current semantic link system:
  - `parseHref`
  - `buildHref`
  - existing page/anchor loaders

### Step 4. Only touch canvas overflow if still necessary

File:
- `components/admin/visual-editor/page-visual-editor-canvas.tsx`

Rule:

Do not change canvas overflow behavior unless the portaled picker still causes a bad interaction.

The primary fix is portal + viewport clamping, not canvas surgery.

### Step 5. Add tests before moving on

Add or extend tests for:

- chooser uses top-layer surface behavior
- chooser open state is not inline-only
- chooser selected state is rendered distinctly
- link picker renders in the shared floating surface path
- link picker content area uses vertical scroll and not horizontal overflow
- `Escape` closes chooser and link picker

## Gate 1: Must Pass Before Phase 2

Run:

```bash
cd /var/www/html/hopfner.dev-main
npm test -- tests/visual-editor
```

Manual QA required:

1. Open the visual editor.
2. Open the page chooser over a visually busy section.
3. Confirm the chooser is fully readable and the selected page is obvious.
4. Edit a CTA link at desktop, tablet, and mobile preview widths.
5. Confirm the user never has to horizontally scroll the canvas to complete link selection.

If any of those fail, stop here and fix them before Phase 2.
