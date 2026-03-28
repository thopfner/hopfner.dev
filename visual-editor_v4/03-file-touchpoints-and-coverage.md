# 03 File Touchpoints And Coverage

This document tells the coding agent exactly where to work.

## Files To Change First

### Admin Visual Editor

- `components/admin/visual-editor/page-visual-editor-node.tsx`
- `components/admin/visual-editor/page-visual-editor-store.ts`
- `components/admin/visual-editor/page-visual-editor-inspector.tsx`
- `components/admin/visual-editor/page-visual-editor-inline-edit.tsx`
- `components/admin/visual-editor/page-visual-editor-spacing-handles.tsx`

### Admin Preview Integration

- `components/admin/section-preview.tsx`

### Shared Section Components

At minimum, cover every built-in section currently rendered by `SectionPreview` that has editable plain-text or CTA fields:

- `components/landing/hero-section.tsx`
- `components/landing/what-i-deliver-section.tsx`
- `components/landing/how-it-works-section.tsx`
- `components/landing/workflows-section.tsx`
- `components/landing/faq-section.tsx`
- `components/landing/final-cta-section.tsx`
- `components/landing/social-proof-strip-section.tsx`
- `components/landing/proof-cluster-section.tsx`
- `components/landing/case-study-split-section.tsx`
- `components/landing/booking-scheduler-section.tsx`
- any shared typography/heading primitive used by multiple sections

## New Files Recommended

Keep the new primitives concentrated and reusable.

Recommended:

- `components/landing/visual-editing-context.tsx`
- `components/landing/editable-text-slot.tsx`
- `components/landing/editable-link-slot.tsx`
- `components/admin/visual-editor/page-visual-editor-inline-field.tsx`
- `components/admin/visual-editor/page-visual-editor-link-popover.tsx`
- optional:
  - `components/admin/visual-editor/page-visual-editor-field-order.ts`
  - `components/admin/visual-editor/page-visual-editor-field-paths.ts`

## Coverage Rules By Field Type

### Top-Level Shared Fields

These must be editable in place wherever rendered:

- `meta.title`
- `meta.subtitle`
- `content.eyebrow`
- `meta.ctaPrimaryLabel`
- `meta.ctaSecondaryLabel`

### CTA Destinations

These must be editable from the CTA itself:

- `meta.ctaPrimaryHref`
- `meta.ctaSecondaryHref`

Required UX:

- anchored link popover
- current destination visible
- same internal/external/anchor logic as form editor

### Repeater Fields

These must use explicit path-based field slots:

- `content.cards[index].title`
- `content.cards[index].text`
- `content.steps[index].title`
- `content.steps[index].body`
- `content.items[index].title`
- `content.items[index].body`
- `content.items[index].question`
- `content.items[index].answer`
- `content.metrics[index].label`
- `content.metrics[index].value`

Only include fields that are visibly rendered in the canvas.

### Not In Scope For True In-Place In This Cycle

These can remain inspector-first for now:

- background-media upload flows
- fully rich text HTML/Tiptap bodies
- hidden configuration fields not visible on canvas
- complex media arrays where no stable visible text exists

## Required Behavior For Section Components

Each section component must stay valid without the provider.

That means:

- no visual-editor dependency should break normal public rendering
- the slot component must degrade to plain text/link output by default
- the public page must not know it is “editable”

## Explicit Prohibitions

- no mirrored admin-only copy of section markup
- no DOM query heuristic that matches text by string value
- no detached floating panel as the main text editing surface
- no “temporary” hardcoded field maps inside one section component without central path naming
