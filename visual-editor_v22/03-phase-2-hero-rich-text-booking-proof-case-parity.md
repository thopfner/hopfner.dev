# Phase 2: Hero, Rich Text, Booking, Proof Cluster, And Case Study Parity

## Goal

Close the highest-visibility content-control gaps first.

## Target Sections

1. `hero_cta`
2. `rich_text_block`
3. `booking_scheduler`
4. `proof_cluster`
5. `case_study_split`

## Exact Work By Section

### `hero_cta`

Bring the following to parity:

1. bullets
2. trust line
3. trust items
4. hero stats
5. proof panel fields
6. content block order
7. content block left/right placement for split layouts

Do not stop at headline/subtitle/CTA parity. That is already done.

### `rich_text_block`

Bring the rich text body editor into the visual editor using the existing rich-text pipeline.

Do not leave this as “use the form editor”.

### `booking_scheduler`

Bring intake field configuration to parity:

1. label for each intake field
2. help text for each intake field

### `proof_cluster`

Bring the missing proof-card and testimonial fields to parity:

1. proof card title
2. proof card body
3. proof card stats
4. testimonial image URL

### `case_study_split`

Bring media fields to parity:

1. media title
2. media image URL

## Files To Change, In Order

1. `components/admin/visual-editor/page-visual-editor-inspector.tsx`
2. any small reusable subcomponents needed for hero ordering, stats/items, and rich text
3. targeted tests

## What Must Not Change

1. do not redesign the visual inspector shell
2. do not invent new content schema
3. do not substitute simpler controls for the explicit hero ordering workflow

## Gate

Do not proceed to Phase 3 until:

1. the hero content-order workflow exists in the visual editor
2. `rich_text_block` is no longer a dead end
3. booking intake-field editing is present
4. proof cluster and case study missing fields are present
5. tests and build pass
