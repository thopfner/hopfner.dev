# 04 Phase 2 Elite Drag Drop and Shell Upgrade

This phase upgrades the current shell from "works" to "premium".

## Phase Goal

Deliver a focused, premium, section-based drag-and-drop experience using `dnd-kit`.

## Product Standard

The current shell is functional but not elite.

v2 should feel closer to a polished SaaS editor:

- fluid drag feedback
- obvious insertion targets
- high confidence selection
- strong information scent
- low-friction page scanning

## Recommended Interaction Model

### Keep

- left structure rail
- center visual canvas
- right inspector
- top toolbar

### Upgrade

- drag from both structure rail and selected canvas handle
- `DragOverlay` for premium drag feedback
- insertion line / drop target indicator
- auto-scroll during drag
- keyboard sortable parity
- stronger selected/hover states
- sticky inspector actions
- cleaner dirty/save/publish affordances

## Specific UI Work

### Structure Rail

Upgrade to:

- clearer section titles and status tokens
- visible local/global ownership
- visible unpublished state
- hover affordance that mirrors canvas selection
- compact but elegant density

### Canvas

Upgrade to:

- drag handle visible on selected and hover states
- cleaner selection ring and focus treatment
- section labels that do not block content
- drop indicator between sections
- optional collapse of unsupported overlays into lighter, less disruptive locked cards

### Inspector

Upgrade to:

- grouped sections with stronger hierarchy
- preset surface that explains inherited vs explicit state where feasible
- sticky bottom save/publish bar
- better disabled/locked messaging
- page-context summary at top

### Toolbar

Upgrade to:

- pilot badge when feature enabled
- viewport switcher with stronger active state
- save-order action that becomes contextual and quiet
- page slug/title display with clearer emphasis

## What Not To Add

Do not expand scope with:

- nested drag inside sections
- freeform canvas positioning
- multi-select
- inline content array editing
- arbitrary block composition

Those would move the editor away from the current CMS model.

## Technical Recommendations

- continue using `dnd-kit`
- use `DragOverlay` instead of only moving the source item
- keep drag state separate from persistence state
- keep reorder optimistic locally
- persist order only on explicit action or a tightly controlled autosave model

Recommendation for v2:

- explicit `Save order` is acceptable
- if autosave is considered, require rollback and strong error handling first

## File Touchpoints

- `components/admin/visual-editor/page-visual-editor-structure.tsx`
- `components/admin/visual-editor/page-visual-editor-canvas.tsx`
- `components/admin/visual-editor/page-visual-editor-node.tsx`
- `components/admin/visual-editor/page-visual-editor-toolbar.tsx`
- optional:
  - `components/admin/visual-editor/page-visual-editor-drag-overlay.tsx`
  - `components/admin/visual-editor/page-visual-editor-drop-indicator.tsx`

## Tests For This Phase

- reorder reducer/store test
- keyboard reorder test
- drag overlay render test
- save-order success/failure state test
- selection sync between structure and canvas test

## Exit Criteria

- reordering feels premium in both keyboard and pointer flows
- selected state is obvious and stable
- drag feedback is materially better than the current build
- UI remains focused on section-level operations only
