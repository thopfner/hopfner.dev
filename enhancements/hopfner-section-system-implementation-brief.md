# Hopfner.dev Section System Implementation Brief

Date: March 7, 2026

Purpose:
- Give the implementing coding agent a complete implementation brief
- Cover frontend section rendering, admin editor support, and SQL / CMS registry implications
- Focus on professional homepage skeleton improvements
- Keep the system CMS-first and reusable

Related files:
- `hopfner-section-system-instructions.md`
- `hopfner-existing-section-map.md`
- `hopfner-homepage-improvement-plan.md`
- `website-design-brief.md`

## Executive Summary

The existing system already supports:
- CMS-driven page assembly
- built-in legacy section types
- custom section types via `section_type_registry`
- a generic composed-section renderer
- a hardcoded editor drawer for built-in types
- a schema-based editor flow for custom/composed types

This means the right strategy is not a rebuild.

The right strategy is:
- extend a small number of built-in section types where they are already core to the homepage
- expand the composed section system to support richer structural primitives
- update admin/editor support in parallel with frontend changes
- add SQL migrations only where registry/defaults/schema support are needed

## Important Clarification

Yes, the CMS/editor-drawer/backend requirement is now explicitly understood.

The earlier section map described the CMS-driven architecture, but this implementation brief now fully reflects:
- frontend renderer changes
- editor drawer implications
- custom section registry implications
- SQL migration implications

## What The Current System Can Already Do

Current architecture already provides:

### Built-in section editing via hardcoded admin UI

Built-in section types have custom editor drawer logic in:
- `/var/www/html/hopfner.dev-main/components/section-editor-drawer.tsx`

This currently supports structured editing for:
- `hero_cta`
- `card_grid`
- `steps_list`
- `title_body_list`
- `rich_text_block`
- `label_value_list`
- `faq_list`
- `cta_block`
- `footer_grid`
- `nav_links`

### Custom section editing via registry + composer schema

Custom section types are supported through:
- `section_type_registry`
- `renderer = "composed"`
- `composer_schema`
- admin section library UI
- generic composed renderer in frontend

This means new section types do not always require a new hardcoded built-in type.

## Recommended Implementation Strategy

Use a hybrid approach.

### Extend built-in sections when:

- the section is homepage-critical
- the layout needs more power than the current composed system can easily provide
- the editor experience should stay highly structured

### Use custom/composed sections when:

- the section is modular and repeatable
- the layout can be expressed by block schemas
- the admin experience can be generic rather than bespoke

## Recommended Workstreams

Work in four coordinated streams.

### Stream 1. Frontend section upgrades

Update the landing components and renderer.

### Stream 2. Admin/editor support

Update editor drawer behavior for built-ins and/or extend composed block editing.

### Stream 3. CMS registry/defaults/schema support

Update section defaults and registry metadata so new variants/types are valid and editable.

### Stream 4. SQL migrations

Add or update migrations for:
- registry entries
- default content/formatting seeds
- schema metadata if needed

## Recommended Changes By Section Type

## A. Built-In Types To Extend

These are the best candidates for enhancement because they are already structurally important.

### 1. `hero_cta`

Current issue:
- too limited
- centered text-only hero
- no proof panel

Recommendation:
- extend this built-in rather than replacing it

Add support for:
- `layoutVariant`
  - `centered`
  - `split`
  - `split_reversed`
- `proofPanel`
  - `type`
  - `headline`
  - `items`
  - `imageUrl`
  - `mockupVariant`
- `trustItems`
  - compact badges or short proof items
- optional `eyebrow`
- optional `heroStats`

Frontend work:
- update `components/landing/hero-section.tsx`
- add true split-layout support
- add a right-hand visual / proof area

Editor work:
- update `components/section-editor-drawer.tsx`
- add form controls for hero variant and proof panel fields

SQL/defaults work:
- update `section_type_defaults` seed for `hero_cta`
- update any relevant schema metadata in `cms_schema_registry`

Priority:
- highest

### 2. `card_grid`

Current issue:
- useful but visually too uniform
- one section type is doing too many jobs without explicit variants

Recommendation:
- keep as a core primitive
- add section-level and card-level variants

Add support for:
- `sectionVariant`
  - `value_pillars`
  - `services`
  - `problem_cards`
  - `proof_cards`
  - `logo_tiles`
- `columns`
  - 2
  - 3
  - 4
- optional `cardTone`
  - `default`
  - `elevated`
  - `muted`
  - `contrast`
- optional `icon`
- optional `stat`
- optional `tag`

Frontend work:
- update `components/landing/what-i-deliver-section.tsx`
- style cards differently by variant
- vary density and hierarchy

Editor work:
- add section-level variant selector
- add optional card fields without breaking existing content

SQL/defaults work:
- update `section_type_defaults`
- update schema metadata if your validation layer uses it

Priority:
- highest

### 3. `steps_list`

Current issue:
- structurally solid but visually limited

Recommendation:
- keep and extend

Add support for:
- `layoutVariant`
  - `grid`
  - `timeline`
  - `connected_flow`
- optional `eyebrow`
- optional `supportingText`

Frontend work:
- update `components/landing/how-it-works-section.tsx`

Editor work:
- add layout variant selector

SQL/defaults work:
- update defaults and schema if needed

Priority:
- medium-high

### 4. `label_value_list`

Current issue:
- good base but currently too narrow

Recommendation:
- keep and expand into a broader trust/proof primitive

Add support for:
- `layoutVariant`
  - `metrics_grid`
  - `trust_strip`
  - `tool_badges`
  - `logo_row`
- optional icon or image per item
- compact vs detailed mode

Frontend work:
- update `components/landing/tech-stack-section.tsx`

Editor work:
- add variant selector
- support optional image/icon fields where useful

SQL/defaults work:
- update defaults and schema metadata

Priority:
- high

### 5. `cta_block`

Current issue:
- only one centered CTA style

Recommendation:
- keep and add CTA presentation variants

Add support for:
- `layoutVariant`
  - `centered`
  - `split`
  - `compact`
  - `high_contrast`

Frontend work:
- update `components/landing/final-cta-section.tsx`

Editor work:
- add layout variant selector

Priority:
- medium

## B. Built-In Types To Deprioritize Or Use More Carefully

### 6. `title_body_list`

Current issue:
- current accordion implementation is weak for homepage scanability

Recommendation:
- do not remove
- do not rely on current form for premium homepage problem framing

Options:
- add layout variants to support non-accordion cards or stacks
- or reduce homepage dependence on this type and replace with card/composed sections

Priority:
- medium

### 7. `rich_text_block`

Current issue:
- too generic for high-impact differentiation sections

Recommendation:
- keep for simple narrative blocks
- do not rely on it for major premium homepage sections unless paired with richer composed layouts

Priority:
- low-medium

## C. Custom / Composed Section Types To Add

These should use the existing `section_type_registry` + `renderer = "composed"` path where possible.

This is the least invasive way to add new structural section patterns.

## Recommended new custom section types

### 1. `trust_strip`

Purpose:
- early trust section directly under hero

Best use cases:
- logos
- badges
- compact metrics
- platform names

Why custom/composed:
- this should be lightweight and structural
- better as a reusable custom type than another hardcoded legacy section

Needed composed block support:
- `logo_strip`
- `metrics_row`
- `badge_group`

### 2. `workflow_visual`

Purpose:
- dedicated section for showing process/workflow/system logic

Best use cases:
- before/after workflow
- orchestration flow
- process mapping

Why custom/composed:
- likely to evolve
- better to model as a flexible layout than force into a current built-in

Needed composed block support:
- `workflow_diagram`
- `media_panel`
- `comparison`

### 3. `proof_cluster`

Purpose:
- case snippets, outcome highlights, proof moments

Best use cases:
- quote cards
- anonymized case cards
- metric clusters

Needed composed block support:
- `proof_card`
- `testimonial`
- `stat_chip_row`

### 4. `split_story`

Purpose:
- differentiation section
- text + visual / text + comparison layout

Best use cases:
- why this approach
- why Hopfner
- principles or operating model

Needed composed block support:
- `comparison`
- `media_panel`
- richer text block combinations

## Composed Block Types To Add

The current composed system is too basic.

Current block types:
- `heading`
- `subtitle`
- `rich_text`
- `cards`
- `faq`
- `image`
- `list`
- `cta`

Recommended new block types:
- `logo_strip`
- `metrics_row`
- `badge_group`
- `proof_card`
- `testimonial`
- `media_panel`
- `workflow_diagram`
- `comparison`
- `stat_chip_row`

Why this matters:
- without expanding the block vocabulary, custom/composed sections will still feel too primitive

Frontend work:
- update `components/landing/composed-section.tsx`

Admin work:
- update section library schema editor and preview support as needed
- update composed section editing if new block-specific settings are required

## Editor Drawer Implications

The admin/editor requirement is real and must be treated as a first-class workstream.

## Existing behavior

Built-in section types:
- edited by hardcoded UI in `components/section-editor-drawer.tsx`

Custom/composed section types:
- driven by `section_type_registry`
- schema edited in `app/admin/(protected)/section-library/page-client.tsx`
- rendered through generic composed section flow

## Practical implication

### If you extend an existing built-in type:

You must update:
- frontend renderer
- editor drawer form
- defaults metadata
- possibly schema/default migrations

### If you add a custom composed type:

You must update:
- `section_type_registry`
- composer schema
- composed renderer block support if new block types are introduced
- optional preview/editor behavior in section library

This is usually cheaper than adding a brand-new built-in type with full hardcoded editor support.

## SQL / Migration Implications

Yes, SQL migration work is likely needed.

Assume migrations are part of the implementation.

## Likely migration categories

### 1. Section registry updates

For new custom/composed section types:
- insert rows into `public.section_type_registry`

### 2. Section defaults updates

For built-in enhancements:
- update `public.section_type_defaults`

This should cover:
- new default content fields
- new formatting fields
- new capability flags

### 3. Schema registry updates

If your validation layer depends on `cms_schema_registry`, update:
- `section_content`
- `section_formatting`

for affected section types

### 4. Optional new migration seeds

If you want new reusable custom section types available by default:
- seed them in a migration rather than creating them only through the admin UI

## Recommended Implementation Order

This is the safest sequence.

### Phase 1. Improve core built-ins

1. Extend `hero_cta`
2. Extend `card_grid`
3. Extend `label_value_list`
4. Extend `steps_list`
5. Extend `cta_block`

Why first:
- these directly improve the homepage skeleton fast
- they already have editor support paths

### Phase 2. Expand composed section system

1. Add new composed block types
2. Add custom types:
   - `trust_strip`
   - `workflow_visual`
   - `proof_cluster`
   - `split_story`

Why second:
- this adds scalable section diversity without overloading built-ins

### Phase 3. Adjust homepage blueprint / usage

Update homepage composition to use the improved section system.

Likely target homepage structure:
- `nav_links`
- upgraded `hero_cta`
- `trust_strip`
- `card_grid` with `problem_cards`
- `card_grid` with `value_pillars`
- `workflow_visual`
- `card_grid` with `services`
- `steps_list`
- `proof_cluster` or upgraded `label_value_list`
- `split_story`
- `cta_block`
- `footer_grid`

## Recommended Technical Decisions

### Decision 1. Prefer variant fields over section-type explosion for core primitives

Good candidates for variants:
- `hero_cta`
- `card_grid`
- `steps_list`
- `label_value_list`
- `cta_block`

This keeps the CMS simpler.

### Decision 2. Prefer custom/composed types for structurally distinct but repeatable sections

Good candidates:
- `trust_strip`
- `workflow_visual`
- `proof_cluster`
- `split_story`

This reduces hardcoded admin/editor complexity.

### Decision 3. Do not add too many new built-in legacy section types

Each new built-in legacy type increases:
- frontend switch complexity
- editor drawer complexity
- default/schema maintenance burden

Use them only when truly justified.

## Concrete Deliverables Expected

Produce:

### Frontend
- updated landing section components
- improved section variants
- expanded composed renderer block support

### Admin
- updated section editor drawer for built-ins that gained new fields
- any necessary section library schema/editor improvements for new composed block types

### CMS / SQL
- migration files for registry/default/schema updates
- clear notes on any manual SQL you need to execute

### Documentation
- a short mapping of:
  - changed built-in types
  - new custom/composed types
  - new content fields
  - new formatting fields

## Acceptance Criteria

The improved system should allow the homepage skeleton to feel professional even before final copy is written.

That means:
- hero can show proof visually
- trust can appear early without hacks
- audience/problem, services, outcomes, proof, and process no longer all look like the same card stack
- the admin can actually populate and manage the new structures
- the CMS model remains maintainable

## Final Recommendation

Safest and strongest path:

- extend `hero_cta`, `card_grid`, `label_value_list`, `steps_list`, and `cta_block`
- expand the composed block system
- create a few new custom/composed section types for trust, workflow visuals, proof clusters, and split-story sections

This gets the site closer to benchmark AI/tech website structure without turning the CMS into a mess of one-off legacy section types.
