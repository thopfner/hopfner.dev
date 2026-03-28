# 03 Phase 1 Truthful Preview and Data Model Alignment

This phase makes the visual editor trustworthy.

## Phase Goal

Ensure the visual editor displays and edits the same effective section state that the live frontend renders.

## Principle

The visual editor is only useful if preview truth is high.

It must follow the same effective merge semantics as the public page renderer.

## Required Alignment Work

### 1. Match effective formatting merge order

Target merge order for section preview:

1. site-level base formatting
2. section type default formatting
3. section row `formatting_override`
4. effective version `formatting`

Relevant sources of truth:

- `app/(marketing)/[slug]/page.tsx`
- `lib/cms/get-published-page.ts`

### 2. Match effective content merge order

Target merge order:

1. section type default content
2. effective version content

Do not invent extra content layers.

### 3. Preserve version precedence rules

For page-local sections in the visual editor:

- use latest draft when present
- otherwise use published

For global sections shown on a page:

- use global draft/published for preview purposes only
- do not mutate them from the page route

### 4. Handle page-level visual context

The editor currently previews sections in isolation. v2 should improve page truth where safe.

Recommended additions:

- page background context shell
- page-level tone/background chrome where it materially affects perception
- consistent viewport framing

Do not reproduce every page-shell behavior if it risks drift. Prefer a simplified but truthful page frame over a fake full-page simulation.

## Custom / Composed Handling

v2 should stay conservative.

### Supported in v2

- built-in sections with truthful preview and formatting editing

### Read-only or deferred in v2

- custom/composed sections unless the preview can be wired to the current composed renderer without special casing

If read-only:

- make the state look intentional
- explain why it is locked
- provide one-click route back to the current form editor

## File Touchpoints

Primary files:

- `lib/admin/visual-editor/load-page-visual-state.ts`
- `components/admin/visual-editor/page-visual-editor-node.tsx`
- `components/admin/visual-editor/page-visual-editor-types.ts`
- `components/admin/section-preview.tsx`

Optional additive helper:

- `lib/admin/visual-editor/resolve-effective-visual-section.ts`

Recommendation:

- introduce a pure helper that computes effective preview data from page state + section node + dirty draft
- test that helper directly

## Tests For This Phase

- effective formatting merge parity test
- effective content merge parity test
- local draft precedence test
- global preview source test
- custom/composed lock-state test

## Exit Criteria

- visual preview matches the public renderer for supported built-in sections
- row-level overrides are respected
- draft precedence is correct
- unsupported states are explicit, not misleading
