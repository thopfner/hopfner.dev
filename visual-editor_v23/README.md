# Visual Editor v23

## Purpose

This is a narrow corrective batch.

Do not broaden scope.
Do not redesign the inspector.
Do not touch frontend hero rendering.

The only goal is to finish `hero_cta` content-order parity in the visual editor so it matches the existing form-editor contract exactly.

## Audit Result

Against the last parity brief, the current status is:

- `rich_text_block`: aligned
- `booking_scheduler`: aligned for intake-field labels/help text
- `proof_cluster`: aligned for proof-card + testimonial image fields
- `case_study_split`: aligned for media title/image
- `hero_cta`: mostly aligned, but `Content block order` is still not parity-correct

The remaining hero defect is specific:

- the visual editor still uses a generic free-form array editor for `heroContentOrder`
- the form editor uses a constrained block-order workflow with fixed keys, explicit labels, move up/down actions, and split-layout left/right assignment

That gap is why the hero section still does not feel aligned.

## Execution Order

1. Read [00-coding-agent-prompt.md](./00-coding-agent-prompt.md)
2. Read [01-audit-gap-vs-v22.md](./01-audit-gap-vs-v22.md)
3. Execute [02-phase-1-hero-block-order-parity.md](./02-phase-1-hero-block-order-parity.md)
4. Verify [03-qa-acceptance-and-stop-gates.md](./03-qa-acceptance-and-stop-gates.md)

## Scope Lock

In scope:

- `hero_cta` content block order
- `hero_cta` block left/right placement for split layouts
- admin-only helper/component reuse needed to make form editor and visual editor use the same contract
- tests for this exact workflow

Out of scope:

- any other section type
- broader formatting parity
- visual-editor shell polish
- frontend hero rendering behavior
