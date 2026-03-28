# 01 Target And Non-Negotiables

This document defines the exact target behavior and the guardrails.

## Target Outcome

The visual editor must support true in-place editing for visible plain-text fields and CTA/link fields.

That includes:

- section titles
- section subtitles
- eyebrows/labels
- CTA primary label
- CTA secondary label
- CTA destinations
- plain-text repeater fields rendered on canvas

Examples of repeater coverage:

- card title
- card description
- step title
- step body
- FAQ question
- FAQ answer
- testimonial quote
- testimonial author

## Non-Negotiables

### Do Not Keep The Current Overlay Model

The current `InlineEditOverlay` bottom bar must not remain as the primary text-editing model.

It may survive temporarily during development behind a dead code path, but the shipped result must not use it.

### Do Not Fork The Marketing Renderer

Do not build separate admin-only copies of:

- `hero-section.tsx`
- `what-i-deliver-section.tsx`
- `how-it-works-section.tsx`
- other built-in landing sections

That would create drift and future regressions.

### Do Not Introduce A Second Content Model

Use the existing paths already represented in draft payloads:

- `meta.title`
- `meta.subtitle`
- `meta.ctaPrimaryLabel`
- `meta.ctaPrimaryHref`
- `meta.ctaSecondaryLabel`
- `meta.ctaSecondaryHref`
- `content.eyebrow`
- `content.cards[index].title`
- `content.cards[index].text`
- `content.steps[index].title`
- `content.steps[index].body`
- `content.items[index].question`
- `content.items[index].answer`
- `content.testimonial.quote`

Use path strings or typed path objects. Do not invent a second hidden storage format.

### Do Not Use Global Uncontrolled `contentEditable`

No full-section `contentEditable`.
No arbitrary DOM scraping to guess which field changed.

If `contentEditable` is used at all, it must be tightly scoped to a specific controlled field component with explicit commit/cancel behavior.

### Do Not Ship Raw URL Inputs As The Primary Link UX

The primary CTA destination editing UX must reuse the same internal page, anchor, and external link behavior the form editor already supports.

An escape hatch raw URL input can exist inside the popover, but it is not the main experience.

## Required Interaction Model

Use these states:

1. `section selected`
   The section is selected, spacing handles may show, editable text affordances appear.

2. `field focused`
   A specific editable text or CTA is targeted. Hover/focus chrome is visible on that field only.

3. `field editing`
   The field itself becomes editable in place.

4. `link editing`
   The CTA keeps its place on canvas while a link popover appears anchored to it.

## Exact UX Rules

- Single click selects the section.
- Click on an editable text node inside the selected section enters field focus.
- Second click, Enter, or explicit edit affordance enters edit mode.
- While editing, the text remains in its original location and footprint as closely as possible.
- `Escape` cancels.
- `Enter` commits for single-line fields.
- `Mod+Enter` commits for multiline fields.
- `Tab` moves to the next editable field in the same section.
- While a field is editing, drag/reorder and spacing-handle interactions are disabled for that section.

## Scope Boundary

This phase is for plain-text and CTA/link editing.

Do not expand this phase into:

- full rich-text document editing
- media upload redesign
- nested block composition
- arbitrary inline image editing

Keep it tight and ship-quality.
