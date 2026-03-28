# New Sections Follow-Up Plan

## Goal

Add new premium content sections relevant to an AI / SaaS / automation business without reintroducing the same CMS/frontend truthfulness problems.

The requested direction includes:

- comparison tables
- pricing tables
- bento grids
- scroll progress sections
- floating CTAs
- color accent variants

These are all valid additions.
They are content-dependent, but that does not block implementation.

The correct approach is:

- implement them with clean seed content
- keep all seed content in registry/schema/default data
- do not hardcode that content in public renderers

---

## Non-Negotiable Rules for New Sections

### Rule 1

Seed/demo content belongs in:

- SQL migrations
- section library starter schemas
- blueprint/default content

It does **not** belong in the public renderer.

### Rule 2

Every new section must have:

- frontend renderer support
- editor support
- published-data support
- safe null behavior

### Rule 3

If a section type is highly structured, create explicit editor fields instead of forcing everything into freeform rich text.

### Rule 4

If a section introduces interactive behavior, its state and display rules must be configurable from the backend.

### Rule 5

Every new section must define what happens when required content is missing.

On the public site:

- omit the missing sub-element, or
- hide the section, or
- show a neutral shell

Never emit fake marketing copy from the renderer.

---

## Proposed Roadmap

Implement these in phases.

Do not start all of them at once.

---

## Phase 1: High-Value Structured Sections

These should come first because they are high impact and mostly data-structured.

### 1. Pricing / Engagement Table

Recommended key:

- `pricing_matrix`

Business purpose:

- present productized service packages
- clarify scope and buying path
- reduce friction for discovery calls

Recommended data model:

- section eyebrow
- title
- subtitle
- plans[]
- each plan:
  - name
  - short descriptor
  - price line
  - billing note
  - highlight flag
  - badge
  - features[]
  - outcome bullets[]
  - CTA label
  - CTA href
  - footnote
- comparison rows[]
  - label
  - values by plan
- disclaimer

Frontend behavior:

- responsive desktop table / mobile stacked cards
- highlighted “recommended” plan
- strong CTA treatment on the primary plan
- optional row-group headings

Backend/editor requirements:

- explicit repeater UI for plans
- explicit repeater UI for comparison rows
- per-plan highlight toggle
- CTA fields per plan
- optional badges

Fallback rule:

- if no plans exist, do not render the section on the public site
- in admin/library preview only, use seed plans

Seed content guidance:

- `Strategy Sprint`
- `Automation Build`
- `Ops Transformation Program`

### 2. Comparison Table

Recommended key:

- `comparison_table`

Note:

You already have a `comparison` block, but that is not the same thing as a robust full-width comparison section.

Business purpose:

- compare manual vs automated
- compare in-house vs external operator model
- compare current-state vs future-state

Recommended data model:

- eyebrow
- title
- subtitle
- columns[]
- rows[]
- each row:
  - label
  - values[]
  - optional emphasis flags
- optional summary CTA

Frontend behavior:

- desktop table
- mobile accordion or stacked cards
- support icons/checks/warnings
- support highlighted “recommended” column

Backend/editor requirements:

- column editor
- row editor
- cell-type select
  - text
  - boolean
  - badge
  - metric

Fallback rule:

- if there are fewer than 2 columns or no rows, hide the section publicly

### 3. Bento Grid

Recommended key:

- `bento_grid`

Business purpose:

- show capabilities, offers, proof, use cases, or process advantages in a more premium way than equal cards

Recommended data model:

- eyebrow
- title
- subtitle
- items[]
- each item:
  - title
  - body
  - icon
  - image
  - metric
  - CTA label
  - CTA href
  - row span
  - column span
  - media alignment
  - emphasis mode

Frontend behavior:

- responsive asymmetric grid
- support 1x1, 2x1, 1x2, 2x2 items
- maintain clean collapse rules on tablet/mobile

Backend/editor requirements:

- item repeater
- span selectors
- emphasis selector
- icon/media fields

Fallback rule:

- if fewer than 2 items exist, render as a simple card stack or hide publicly

Seed content guidance:

- `Workflow Mapping`
- `AI Readiness`
- `Automation Delivery`
- `Governance`
- `ROI Tracking`
- `Tool Integration`

---

## Phase 2: Behavior-Driven Sections

These require more frontend behavior and stricter admin rules.

### 4. Scroll Progress Story Section

Recommended key:

- `scroll_story`

Business purpose:

- explain a transformation narrative
- walk users through audit -> design -> build -> scale
- visually reinforce method and maturity

Recommended data model:

- eyebrow
- title
- subtitle
- steps[]
- each step:
  - label
  - title
  - body
  - supporting metric
  - image / diagram / media
  - optional CTA
- progress style
- sticky behavior toggle

Frontend behavior:

- sticky visual or sticky progress rail
- active step changes on scroll
- progress marker fills as user moves through the section

Backend/editor requirements:

- ordered step repeater
- media support per step
- sticky mode toggle
- progress style select

Fallback rule:

- if JS is unavailable, degrade to a clean stacked step layout
- if steps are missing, hide section publicly

Implementation note:

This likely needs a dedicated renderer, not just a simple composed block.

### 5. Floating CTA

Recommended key:

- `floating_cta`

Business purpose:

- keep one high-intent CTA visible without repeating large CTA blocks everywhere

Recommended data model:

- label
- href
- secondary label
- secondary href
- trigger behavior
  - always after hero
  - after scroll percentage
  - after section ID
- hide near footer toggle
- dismissible toggle
- icon
- mobile behavior

Frontend behavior:

- anchored bottom corner or bottom bar
- respects viewport size
- does not overlap footer or important UI

Backend/editor requirements:

- trigger settings
- visibility settings
- dismissibility setting
- mobile/desktop mode settings

Fallback rule:

- if no valid CTA label/href pair exists, do not render

Implementation note:

This is likely a page-level enhancement rather than a normal content section.

---

## Phase 3: Section Appearance Extensions

These are useful, but should be built on the design system rather than as one-off visual hacks.

### 6. Color Accent Variants

This should not be treated as “pick any arbitrary color per section.”

It should be a tokenized section-level accent system.

Recommended token:

- `accentVariant`

Recommended values:

- `obsidian_blue`
- `signal_cyan`
- `operator_green`
- `ember_orange`
- `neutral`

Business purpose:

- differentiate proof sections, CTA sections, pricing, and use-case sections
- create visual pacing without losing brand cohesion

Recommended implementation:

- add section-level accent variant token
- map each variant to a controlled accent variable set
- use it in:
  - borders
  - rings
  - micro-labels
  - emphasis panels
  - CTA treatments

Backend/editor requirements:

- section-level accent-variant select
- capability gating so only supported sections expose it initially

Fallback rule:

- default to `neutral` or site accent when unset

Important:

Do not expose freeform color pickers on a per-section basis yet.
That will degrade consistency quickly.

---

## Recommended Delivery Order

Use this order:

1. `pricing_matrix`
2. `comparison_table`
3. `bento_grid`
4. `accentVariant` token support
5. `scroll_story`
6. `floating_cta`

Why this order:

- the first three are high-value and mostly structured
- accent variants then improve visual system control
- scroll/floating behavior should come after the content model is stable

---

## Where Seed Content Should Live

Use these sources only:

- section library starter schema
- SQL migration seed data
- optional page blueprint seed content

Do not place seed content inside public renderers.

If a section is registry-backed:

- put starter content in `composer_schema`

If a section is a built-in structured section:

- put starter content in section defaults or migration seed rows

---

## Section-by-Section Recommendation: Built-In vs Custom

### `pricing_matrix`

Recommendation:

- dedicated built-in section type

Reason:

- too structured for a generic composed layout if you want a good editor experience

### `comparison_table`

Recommendation:

- dedicated built-in section type

Reason:

- column/row editing deserves explicit controls

### `bento_grid`

Recommendation:

- dedicated built-in section type, or a richer custom/composed renderer with span support

Reason:

- layout spans and emphasis states need structured controls

### `scroll_story`

Recommendation:

- dedicated built-in section type

Reason:

- scroll behavior and sticky progress are interaction-heavy

### `floating_cta`

Recommendation:

- dedicated page-level/global component, not a normal inline section

Reason:

- it is behavior- and visibility-driven, not just content-driven

### `accentVariant`

Recommendation:

- design-system token extension, not a standalone section type

Reason:

- this is a cross-section presentation control

---

## Acceptance Criteria for New Section Work

No new section type is complete unless:

1. it can be created from the backend
2. it can be edited from the backend
3. it publishes through the normal CMS pipeline
4. the frontend renders only backend-supplied data or neutral null-state behavior
5. there is no public hardcoded demo copy inside the renderer
6. mobile layout is explicitly tested
7. the section visually matches the elite design system

---

## Recommended Immediate Next Move

After the current renderer placeholder issues are cleaned up:

start with:

- `pricing_matrix`
- `comparison_table`
- `bento_grid`

These will add the most visible strategic value for an AI / automation / SaaS business while keeping implementation controlled and CMS-friendly.
