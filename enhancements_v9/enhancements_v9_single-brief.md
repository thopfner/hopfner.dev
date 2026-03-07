# Enhancements v9: Strict Design-System Audit and Elite UI Enforcement

This brief replaces any softer or partial interpretation from prior rounds.

The objective is no longer "wire more settings" or "make one section look better."
The objective is to make the design-system formatting controls real, consistent, visually legible, CMS-driven, and elite across the entire marketing site.

This is a strict implementation brief. Do not treat any item below as optional.

## Core mandate

The current state is not acceptable yet for three reasons:

1. Some backend formatting controls still do not create meaningful frontend differences.
2. Some controls technically render but the visual delta is too weak to justify their existence.
3. The card system as a whole is still too homogeneous. Different card families and density modes do not create a clear premium hierarchy across the page.

The v9 goal is therefore:

- every exposed formatting control must either:
  - produce a deliberate, visible, design-system-approved visual difference on the frontend, or
  - be removed from backend editing entirely
- every card-capable section must consume the same shared design token contract
- every card family must have a distinct visual identity
- density, spacing, surface, and chrome tokens must create meaningful layout and aesthetic differentiation
- the final result must read as one premium system, not a collection of subtle tweaks

No fake controls. No dead controls. No "saved but barely visible" controls.

## Non-negotiable product standard

Treat the site as a premium AI / automation consultancy brand.

Visual direction:

- dark, precise, operator-grade
- typographically disciplined
- composure over gimmicks
- visible section hierarchy
- visible card hierarchy
- strong but restrained accent usage
- obvious progression between section types

This should feel closer to a premium systems brand than a generic SaaS template.

## Scope

You are auditing and fixing the full formatting-token pipeline across:

- admin/backend controls
- DB-backed token registries and presets
- runtime token resolution
- section renderers
- card renderers
- page-level visual output

This is not limited to `Service Snapshot`.
It applies to all sections that expose formatting controls and especially all card-bearing sections.

## Required audit

Before changing visual styles, perform a code-backed audit of every formatting control that currently exists in the admin UI.

Audit these controls explicitly:

- `sectionPresetKey`
- `sectionRhythm`
- `sectionSurface`
- `contentDensity`
- `gridGap`
- `cardFamily`
- `cardChrome`
- `accentRule`
- `dividerMode`
- `headingTreatment`
- `labelStyle`
- `widthMode` where applicable

For each control, determine:

1. Is it exposed in admin?
2. Is it persisted to the database?
3. Is it loaded back into the editor correctly?
4. Is it resolved through the shared runtime token path?
5. Which frontend components consume it?
6. Does it create a visible frontend difference?
7. Is that difference strong enough to justify the control?

If the answer to `6` is "no" or to `7` is "not enough", fix the rendering system.
Do not leave weak placeholder token support in place.

## Required implementation rule

Every formatting control must end in one of two states:

- `Supported and visually meaningful`
- `Not supported and removed from editor exposure`

There must be no third state.

## Sections and components that must be audited

At minimum, audit and align:

- `hero_cta`
- `card_grid`
- `steps_list`
- `title_body_list`
- `rich_text_block`
- `label_value_list`
- `faq_list`
- `cta_block`
- `footer_grid`
- `composed` / custom-composed sections

Pay special attention to:

- [what-i-deliver-section.tsx](/var/www/html/hopfner.dev-main/components/landing/what-i-deliver-section.tsx)
- [faq-section.tsx](/var/www/html/hopfner.dev-main/components/landing/faq-section.tsx)
- [composed-section.tsx](/var/www/html/hopfner.dev-main/components/landing/composed-section.tsx)
- [section-primitives.tsx](/var/www/html/hopfner.dev-main/components/landing/section-primitives.tsx)
- [resolve.ts](/var/www/html/hopfner.dev-main/lib/design-system/resolve.ts)
- [presentation.ts](/var/www/html/hopfner.dev-main/lib/design-system/presentation.ts)
- [component-families.ts](/var/www/html/hopfner.dev-main/lib/design-system/component-families.ts)
- [loaders.ts](/var/www/html/hopfner.dev-main/lib/design-system/loaders.ts)
- [section-editor-drawer.tsx](/var/www/html/hopfner.dev-main/components/section-editor-drawer.tsx)
- [page.tsx](/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx)

## Strict design-system requirements

### 1. Card families must be unmistakably different

Current problem:

- card families are still too visually similar
- service/proof/process/quiet tiles still read as minor variations of the same dark rounded card

Required outcome:

- `service` cards feel like premium offer architecture
- `proof` cards feel evidence-led and more editorial / trust-oriented
- `process` cards feel procedural and directional
- `metric` cards feel compact, numeric, and data-forward
- `logo_tile` cards feel minimal and utility-like
- `cta` cards feel decisive and more action-oriented than informational cards

This differentiation must come from a combination of:

- border treatment
- shadow treatment
- background treatment
- accent placement
- internal spacing
- heading scale
- micro-label treatment
- content alignment
- separator behavior

Do not rely on one extra shadow class and call that a family.

### 2. Density modes must create real spacing differences

Current problem:

- `tight`, `standard`, and `airy` are too close
- in some sections the effect is barely perceptible

Required outcome:

- density tokens must affect internal card padding, card sub-block spacing, and section content rhythm where appropriate
- `tight` should feel operational and compact
- `standard` should feel balanced
- `airy` should feel premium, calmer, and intentionally spacious

Do not implement density as only a 1-step `py` change.
It must affect the entire component's internal spacing rhythm.

Examples of what density may control:

- card header padding
- card body padding
- gap between heading and body
- gap between metadata rows
- list spacing
- section heading-to-grid spacing

### 3. Surface modes must produce actual section hierarchy

Current problem:

- some surface modes are too subtle to read as distinct section stages

Required outcome:

- `none` reads neutral
- `panel` reads contained
- `soft_band` reads supportive
- `contrast_band` reads more assertive and sectional
- `spotlight_stage` reads premium and intentionally featured
- `grid_stage` reads more technical / systems-oriented where used

This must be visible in the live page rhythm, not only in CSS tokens on paper.

### 4. Chrome and accent rules must stack coherently

Required outcome:

- `cardChrome` must visibly modify the family, not disappear into it
- `accentRule` must not be ornamental noise
- `left`, `top`, and `inline` accents should each have a real use-case and visible output

Stacking rule:

- family defines identity
- chrome defines physicality
- accent defines emphasis

These layers must not collapse into the same visual result.

### 5. Divider modes must be section-appropriate and visible

Required outcome:

- `none` means no divider treatment
- `subtle` means low-contrast separation
- `strong` means clear sectional or card-internal separation

If a section type cannot support meaningful dividers, remove the control from that section type.
If it does support them, render them intentionally.

### 6. Heading treatment and label style must not be decorative-only

Required outcome:

- `headingTreatment` should visibly affect hierarchy, casing, tracking, weight, or presentation as designed
- `labelStyle` should clearly change badge / eyebrow / micro-label language across supported sections

If these controls only change one tiny text class with negligible effect, strengthen them.

## Required architectural rules

### A. One token contract

All section renderers must consume the shared resolved UI object.

Do not continue with mixed patterns where some sections use tokenized classes and others quietly hardcode spacing or card chrome.

If a section supports a control, it must consume the resolved token via the shared contract.

### B. One capability truth

The capability system must match reality.

If the admin exposes a control, the frontend must honor it.
If the frontend cannot honor it meaningfully, remove the capability from that section type.

The DB-backed capability model is now the source of truth.
Code constants may remain only as safe fallback defaults, not as the primary implementation path.

### C. One preset truth

DB-backed preset registries are the intended runtime source.
Code presets may remain only as fallback for failure states.

Ensure the app behavior remains coherent if DB loads fail, but the normal path must be DB-driven.

### D. One rollout path

Any SQL used in production must exist as proper tracked migration files in the repo's canonical migration path.

If there is drift between ad hoc SQL on the server and tracked migrations, fix it.
The design system is not complete if it cannot be reproduced from repo + migrations.

## Required implementation steps

### Step 1. Build a control-to-renderer audit matrix

Create and execute an internal matrix for every formatting control across every supported section type.

For each cell, classify:

- fully supported and visible
- wired but visually weak
- persisted but not rendered
- should not be supported

Use that matrix to drive implementation. Do not guess.

### Step 2. Normalize all section renderers to the token system

For each supported section renderer:

- consume `ResolvedSectionUi`
- remove silent hardcoded visual behavior that bypasses tokens
- use shared presentation maps where possible
- introduce section-specific mappings only where the shared system intentionally branches

### Step 3. Strengthen token deltas

Revise the presentation and component-family class maps so each token choice is visibly distinct.

Minimum required deltas:

- density choices must be clearly visible
- service/proof/process/metric families must be distinguishable at a glance
- surface choices must visibly separate sections
- chrome variants must be stronger than a negligible shadow change

### Step 4. Tighten backend exposure

Update the admin so unsupported controls are not shown for section types that cannot use them meaningfully.

Do not leave broad capabilities enabled simply because the control exists globally.

### Step 5. Verify live parity

For each supported section type, test:

1. change setting in editor
2. save/publish as required
3. confirm persisted value
4. confirm frontend visual delta

Do this especially for:

- homepage hero
- `Core Outcomes`
- `Service Snapshot`
- process section
- proof/metrics section
- final CTA
- at least one composed/custom section

### Step 6. Commit rollout hygiene

Before closing the task:

- clean the worktree
- ensure all relevant code is committed
- ensure migration files are tracked in the canonical repo path
- ensure no critical changes are living only as uncommitted server edits

## Elite UI rules for all card systems

These are required visual rules, not suggestions.

### Service cards

Must feel like productized offers.

Required characteristics:

- stronger top-edge or side emphasis
- more pronounced stage/surface separation
- more deliberate header/body segmentation
- clearer micro-label system
- more premium depth than generic utility cards

### Proof cards

Must feel trust-led and evidence-oriented.

Required characteristics:

- calmer surface than service cards
- stronger emphasis on quote, metric, or evidence payload
- less aggressive accent styling
- more editorial composition

### Process cards

Must feel sequential and operational.

Required characteristics:

- stronger directional cue
- step labels that read like process metadata, not generic badges
- disciplined repetition and consistent step rhythm

### Metric cards

Must feel data-led.

Required characteristics:

- centered or numerically anchored hierarchy
- sharper spacing
- less narrative padding

### CTA cards

Must feel more decisive than informational sections.

Required characteristics:

- stronger foreground/background contrast
- clearer action hierarchy
- visible intentionality in button and text grouping

## Acceptance criteria

This work is only complete if all of the following are true:

1. Every formatting control in the backend is either meaningfully rendered or removed.
2. `contentDensity` creates obvious frontend spacing differences in every section type that supports it.
3. `cardFamily` creates obvious card identity differences across supported card sections.
4. `cardChrome` and `accentRule` visibly modify the result without collapsing into the base family.
5. `sectionSurface` and `sectionRhythm` create visible section hierarchy on the live homepage.
6. `dividerMode` visibly changes separators where supported.
7. `headingTreatment` and `labelStyle` visibly change hierarchy and micro-UI where supported.
8. The homepage no longer feels like repeated versions of one dark rounded card pattern.
9. The live UI reads as a premium, coherent design system.
10. The implementation is reproducible from committed code plus tracked migrations.

## Required QA evidence before closure

Do not mark this complete without producing evidence.

Provide:

1. a control audit summary
2. a section-by-section support summary
3. before/after screenshots of at least:
   - hero
   - a default `card_grid`
   - `Service Snapshot`
   - process section
   - proof/metrics section
   - CTA section
4. confirmation of which controls were removed versus implemented
5. confirmation that migrations are tracked and applied

## Final instruction

Do not optimize for speed.
Optimize for correctness, visual clarity, and system integrity.

This v9 task is complete only when the design system is both:

- technically truthful
- visually convincing

If a control exists, it must matter.
If a section supports the system, the difference must be legible.
If the page is called premium, it must look premium.
