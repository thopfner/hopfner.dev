# Hopfner.dev Existing Section And Card System Map

Date: March 7, 2026

Source inspected:
- Remote server: `root@hopfner.dev`
- Project path: `/var/www/html/hopfner.dev-main`

Primary code locations:
- `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/`
- `/var/www/html/hopfner.dev-main/lib/cms/types.ts`
- `/var/www/html/hopfner.dev-main/lib/cms/blueprint-content.ts`

Purpose:
- map the current frontend/CMS section system
- identify which existing section and card types can support the homepage enhancement plan
- identify which existing types need upgrades or new variants

## Architecture Summary

The site uses a CMS-driven section renderer in:

- `app/(marketing)/[slug]/page.tsx`

There are two rendering modes:

1. Legacy specialized section components
- strongly typed section renderers wired directly in the page switch

2. Composed section renderer
- schema-driven layout renderer for custom section types
- handled by `components/landing/composed-section.tsx`
- controlled by `section_type_registry` entries where `renderer = "composed"`

This is important because it means the system already supports:
- stable built-in section types
- custom schema-driven section types without rebuilding the whole page architecture

## Built-In CMS Section Types

Defined in:
- `/var/www/html/hopfner.dev-main/lib/cms/types.ts`

Current normalized built-in section types:
- `nav_links`
- `hero_cta`
- `card_grid`
- `steps_list`
- `title_body_list`
- `rich_text_block`
- `label_value_list`
- `faq_list`
- `cta_block`
- `footer_grid`

## Current Homepage Section Stack

Based on the current home blueprint and live render, the homepage is currently built from:

1. `nav_links`
2. `hero_cta`
3. `title_body_list` for `Who It’s For`
4. `card_grid` for `Core Outcomes`
5. `card_grid` for `Service Snapshot`
6. `steps_list` for `How Engagements Work`
7. `label_value_list` for `Proof Metrics`
8. `rich_text_block` for `Why this approach`
9. `cta_block`
10. `footer_grid`

This explains why the current homepage feels structurally coherent but visually repetitive.

## Existing Landing Components

Current specialized frontend components:

- `components/landing/site-header.tsx`
- `components/landing/hero-section.tsx`
- `components/landing/what-i-deliver-section.tsx`
- `components/landing/how-it-works-section.tsx`
- `components/landing/workflows-section.tsx`
- `components/landing/why-this-approach-section.tsx`
- `components/landing/tech-stack-section.tsx`
- `components/landing/faq-section.tsx`
- `components/landing/final-cta-section.tsx`
- `components/landing/footer-grid-section.tsx`
- `components/landing/composed-section.tsx`

Shared layout primitive:
- `components/landing/section-primitives.tsx`

## Section-By-Section Reuse Assessment

### 1. `nav_links`

Renderer:
- `components/landing/site-header.tsx`

Current capability:
- sticky header
- desktop + mobile nav
- CTA button
- hash-aware active states
- optional top backdrop behavior

Assessment:
- reusable
- structurally sound
- not the main blocker

Recommended action:
- keep
- refine visual polish only
- possibly simplify top-nav link set

Use in enhancement plan:
- yes, keep as the base header system

## 2. `hero_cta`

Renderer:
- `components/landing/hero-section.tsx`

Current capability:
- centered hero only
- headline
- subheadline
- bullet list
- primary and secondary CTA
- trust line
- optional background image
- optional full bleed

Current limitation:
- no split layout
- no right-hand proof panel
- no workflow mockup slot
- no system diagram slot
- no logo strip support
- no statistic chips
- no hero card cluster

Assessment:
- too limited for the target future-state homepage

Recommended action:
- do not discard
- extend heavily or create a new hero variant

Best path:
- either add a new built-in hero type such as `hero_split` / `hero_proof`
- or expand `hero_cta` to support:
  - left/right layout
  - hero media panel
  - proof chips
  - trust badges or logos

Use in enhancement plan:
- partially reusable
- must be upgraded before the homepage can feel premium

## 3. `card_grid`

Renderer:
- `components/landing/what-i-deliver-section.tsx`

Current capability:
- card grid
- title
- text
- optional image
- optional `You get`
- optional `Best for`
- display flags per card

Strength:
- flexible base structure
- can support more than one card family at the content level

Weakness:
- all cards render in essentially one visual family
- not enough variants for:
  - value cards
  - service cards
  - proof cards
  - audience/problem cards
- current styling is too uniform

Assessment:
- one of the most reusable existing section types
- but it needs variants

Recommended action:
- keep and extend
- add explicit card variants or `layoutStyle` / `cardFamily`

Recommended future variants:
- `value`
- `service`
- `problem`
- `proof`
- `logo`
- `stat`

Use in enhancement plan:
- yes, major reuse candidate
- likely the best foundation for multiple homepage section families

## 4. `steps_list`

Renderer:
- `components/landing/how-it-works-section.tsx`

Current capability:
- numbered step cards
- responsive grid
- title + body

Strength:
- already good for process sections
- operational tone fits the consultancy model

Weakness:
- only one visual treatment
- no timeline mode
- no connected-flow visual mode
- no horizontal progress mode

Assessment:
- strong reusable base

Recommended action:
- keep
- add layout variants:
  - card grid
  - horizontal timeline
  - connected process flow

Use in enhancement plan:
- yes
- directly useful for the engagement model section

## 5. `title_body_list`

Renderer:
- `components/landing/workflows-section.tsx`

Current capability:
- accordion-based list of items

Strength:
- decent for FAQ-like or expandable workflow examples

Weakness:
- weak as a homepage audience/problem section
- accordion is not ideal for first-pass scanning
- not premium enough for problem framing or service overview

Assessment:
- limited reuse in its current form

Recommended action:
- keep for expandable lists if needed
- add non-accordion variants

Recommended future variants:
- simple stacked list
- 2-column list
- audience/problem card list
- comparison or before/after list

Use in enhancement plan:
- only partially
- current implementation is not strong enough for homepage problem framing

## 6. `rich_text_block`

Renderer:
- `components/landing/why-this-approach-section.tsx`

Current capability:
- title
- subheading
- body in one card

Strength:
- simple and reliable

Weakness:
- too generic
- not enough structure for differentiation
- not enough visual interest for strategic positioning sections

Assessment:
- weak as a premium homepage section

Recommended action:
- keep only as a low-complexity narrative block
- add richer variants or replace with composed section layouts

Recommended future variants:
- split text + visual
- comparison table
- principle cards
- side-by-side positioning block

Use in enhancement plan:
- limited
- not sufficient alone for a strong “Why us” section

## 7. `label_value_list`

Renderer:
- `components/landing/tech-stack-section.tsx`

Current capability:
- 2-column metric/value tiles using `Metric`

Strength:
- useful for compact proof or stack information
- can support metrics and platform lists

Weakness:
- currently framed like a generic metric tile grid
- no compact horizontal trust-strip mode
- no logo strip mode
- no badge mode

Assessment:
- good reusable base for trust and proof

Recommended action:
- keep and extend

Recommended future variants:
- trust strip
- metrics grid
- compact proof row
- tool badge strip
- logo rail

Use in enhancement plan:
- yes
- one of the best candidates for early trust sections if upgraded

## 8. `faq_list`

Renderer:
- `components/landing/faq-section.tsx`

Current capability:
- accordion FAQ

Assessment:
- good
- not relevant to the top-priority homepage skeleton work

Recommended action:
- keep
- low priority for homepage enhancement

Use in enhancement plan:
- optional, not core

## 9. `cta_block`

Renderer:
- `components/landing/final-cta-section.tsx`

Current capability:
- centered card CTA
- heading
- body
- primary and secondary CTA

Strength:
- structurally useful

Weakness:
- only one CTA presentation style
- visually too similar to other panel sections

Assessment:
- reusable
- needs more visual modes

Recommended action:
- keep and extend

Recommended future variants:
- centered CTA
- split CTA
- slim inline CTA
- dark/high-contrast CTA

Use in enhancement plan:
- yes

## 10. `footer_grid`

Renderer:
- `components/landing/footer-grid-section.tsx`

Current capability:
- 1-2 footer cards
- grouped or flat links
- newsletter input
- CTA buttons
- legal row
- brand text watermark

Strength:
- structurally flexible

Weakness:
- can easily look template-like
- currently mixes too many optional concepts into one block

Assessment:
- reusable

Recommended action:
- keep
- simplify presentation
- make footer feel more intentional and less like a generic card stack

Use in enhancement plan:
- yes

## Composed Section System

Renderer:
- `components/landing/composed-section.tsx`

Backed by:
- `section_type_registry` entries with `renderer = "composed"`

Current block types supported:
- `heading`
- `subtitle`
- `rich_text`
- `cards`
- `faq`
- `image`
- `list`
- `cta`

Current strengths:
- allows new section types without new page-level switch logic
- row/column schema model already exists
- useful for fast prototyping in the CMS section library

Current weaknesses:
- block vocabulary is too basic for best-in-class AI/tech homepage structures
- no dedicated support for:
  - logo rails
  - metrics strips
  - badge clusters
  - split media layouts
  - mockup panels
  - workflow diagrams
  - proof/testimonial cards
  - comparison blocks

Assessment:
- strategically important
- best existing path for adding skeleton flexibility without rewriting the app

Recommended action:
- extend this system before adding too many one-off legacy section types

Recommended new composed block types:
- `metrics_row`
- `logo_strip`
- `badge_group`
- `proof_card`
- `testimonial`
- `media_panel`
- `workflow_diagram`
- `comparison`
- `stat_chip_row`

Use in enhancement plan:
- high value
- likely the fastest scalable path for new section skeletons

## What Exists That Directly Helps The Enhancement Plan

Most useful existing pieces:

### Strong reuse candidates

- `card_grid`
- `steps_list`
- `label_value_list`
- `cta_block`
- `nav_links`
- `footer_grid`
- `composed-section`

These should be treated as the base system to evolve.

### Needs significant upgrade

- `hero_cta`
- `title_body_list`
- `rich_text_block`

These currently block the homepage from feeling premium.

## Best Upgrade Strategy

Do not replace everything with brand-new section types.

Instead:

### 1. Extend existing built-ins where they are already close

Extend:
- `hero_cta`
- `card_grid`
- `steps_list`
- `label_value_list`
- `cta_block`

### 2. Use composed sections for new structural patterns

Use `composed-section` for:
- trust strip variants
- audience/problem grids
- differentiation blocks
- proof clusters
- workflow visual sections

### 3. Avoid overusing accordion-based patterns on the homepage

The current homepage uses accordion logic in places where benchmark sites use:
- cards
- columns
- visual systems
- scan-first modules

## Recommended Mapping To The Future-State Homepage

### Header

Use:
- `nav_links`

### Hero

Use:
- upgraded `hero_cta`

Need:
- split layout
- proof panel or workflow mockup slot

### Trust strip

Use:
- extended `label_value_list`
- or new composed trust-strip section

### Audience / problem framing

Use:
- extended `card_grid`
- or new composed card section

Do not use current accordion `title_body_list` for this

### Outcomes / value pillars

Use:
- `card_grid` with dedicated value-card variant

### Workflow / system section

Use:
- new composed section
- or new built-in section if the workflow diagram becomes a core repeated pattern

### Services / capabilities

Use:
- `card_grid` with service-card variant

### Engagement process

Use:
- `steps_list` with optional timeline variant

### Proof / metrics / case snippets

Use:
- extended `label_value_list`
- extended `card_grid`
- or composed proof cluster

### Differentiation section

Use:
- new composed split-content section

### Final CTA

Use:
- `cta_block` with better layout variants

### Footer

Use:
- `footer_grid`

## Recommended Priorities For The Next Agent

### P0

- upgrade `hero_cta`
- add card variants to `card_grid`
- add trust-strip capability to `label_value_list` or composed sections
- reduce dependence on `title_body_list` accordion for homepage scanning

### P1

- expand composed block vocabulary
- add workflow/system section pattern
- add richer differentiation section pattern
- add CTA variants

### P2

- simplify and refine footer
- refine section spacing and alternating layout rhythm

## Bottom Line

The current system is not starting from zero.

It already has:
- a CMS-driven page renderer
- multiple reusable section types
- a custom composed section system

The main issue is not missing infrastructure.

The main issue is that the current section types are:
- too visually uniform
- too centered around generic cards
- too limited for premium hero and trust layouts

The best path is:
- extend existing built-ins where practical
- use the composed system to add richer structural section patterns
- avoid rebuilding the whole page architecture unnecessarily
