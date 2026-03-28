# Layout Restructure Plan

Goal:

- preserve behavior
- improve scanning order
- make the drawer feel designed instead of accumulated

## Batch Assignment

Everything in this file belongs to **Batch 1**.

This is an admin-only restructuring pass:

- reorder the shell
- reorder built-in editor internals
- expose missing inputs

Do not combine these moves with public renderer subtitle precedence changes.

## Target Shell Order

Current shell order:

1. version status
2. common fields
3. formatting controls
4. content editor
5. version history

Target shell order:

1. version status
2. section basics
3. shared actions
4. section content
5. section layout and display
6. background media
7. formatting controls
8. version history

## Safe Structural Move

Do not try to rebuild the entire shell from scratch.

Use a small extraction pass:

1. split `CommonFieldsPanel` into three focused panels
   - `SectionBasicsPanel`
   - `SectionActionsPanel`
   - `BackgroundMediaPanel`
2. keep `FormattingControls` as-is
3. keep `ContentEditorRouter` as-is at the shell boundary
4. move background media below content and layout controls

## Per-Editor Ordering Rule

Every built-in editor should follow the same internal order:

1. section copy and identity
2. repeater or structured content blocks
3. supporting content blocks
4. layout and display controls

This means:

- no `Layout variant` select above the main content
- no `Card tone` or `Columns` selector before the user can reach cards
- no `Display` toggles before the actual card or list content unless they are tucked into a clearly labeled lower subsection

## Recommended Shared Editor Primitives

Create lightweight presentational wrappers only:

- `EditorSection`
- `EditorSubsection`
- `EditorSubsectionTitle`

These should not own state.
They should only enforce consistent headings, spacing, and order.

## Section-by-Section Reordering

### `hero_cta`

Move to:

1. `Eyebrow`
2. `Bullets`
3. `Trust line`
4. `Trust items`
5. `Hero stats`
6. `Proof panel content`
7. `Layout & display`
   - `Hero layout`
   - `Proof panel type`
   - `Mockup variant`

### `card_grid`

Move to:

1. `Eyebrow`
2. `Cards`
3. within each card:
   - title
   - text
   - image
   - supporting lists
   - metadata
   - display toggles last
4. `Layout & display`
   - `Section variant`
   - `Columns`
   - `Card tone`
   - section-level `cardDisplay` defaults

### `steps_list`

Move to:

1. `Eyebrow`
2. `Steps`
3. `Layout & display`
   - `Layout variant`

### `title_body_list`

Move to:

1. `Eyebrow`
2. `Items`
3. `Layout & display`
   - `Layout variant`

### `rich_text_block`

Move to:

1. `Eyebrow`
2. `Body`

### `label_value_list`

Move to:

1. `Eyebrow`
2. `Items`
3. `Layout & display`
   - `Layout variant`
   - `Compact mode`

### `faq_list`

Move to:

1. `Eyebrow`
2. `Items`

### `cta_block`

Move to:

1. `Eyebrow`
2. `Body`
3. `Layout & display`
   - `Layout variant`

### `footer_grid`

Move to:

1. `Footer cards`
2. `Brand`
3. `Legal`

Within each footer card:

1. title
2. body
3. links or groups
4. subscribe block
5. CTA block

### `nav_links`

Move to:

1. `Logo`
2. `Links`
3. `Primary CTA` remains in shared actions panel

### `social_proof_strip`

Move to:

1. `Eyebrow`
2. `Trust note`
3. `Logos`
4. `Badges`
5. `Layout & display`
   - `Layout variant`

### `proof_cluster`

Move to:

1. `Eyebrow`
2. `Metrics`
3. `Proof card`
4. `Testimonial`
5. `Primary CTA` remains in shared actions panel

### `case_study_split`

Move to:

1. `Eyebrow`
2. `Narrative`
3. `Before / after`
4. `Media`
5. `Stats`
6. `Primary CTA` remains in shared actions panel

## What Not To Do

- do not move `FormattingControls` above section content again
- do not introduce hidden accordions for core fields
- do not create duplicate subtitle controls in both shared and section-local areas
- do not refactor section editor state logic for this pass
- do not mix shell/editor reordering with subtitle data-contract migration in the same commit batch
