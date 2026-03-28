# Enhancements v10: Sequential Formatting-Control Remediation Brief

This is a strict implementation brief.

The v10 objective is not general polish.
The v10 objective is to make each formatting control produce a clear, intentional, elite-level frontend result, one feature at a time, with proof after each step.

Do not batch the whole system and hope it works.
Do not tweak token maps in aggregate and then eyeball the homepage.
Implement, verify, and sign off one formatting feature at a time.

This brief is deliberately explicit because prior rounds have failed in two ways:

1. controls were technically wired but too weak visually
2. some sections still bypassed the token system with hardcoded card/panel styles

v10 fixes both by forcing sequential delivery and measurable visual outcomes.

## Mission

Make the formatting system truthful.

That means:

- every exposed control must produce a real frontend difference
- every supported section must consume the shared token contract
- every token delta must be strong enough to be legible in screenshots
- no section should silently fall back to a generic dark card system

The site should read like a premium AI / automation consultancy with a coherent design language, not a template with many barely-visible controls.

## Primary failure pattern to correct

The current system still fails because:

- some sections consume semantic tokens
- some sections still hardcode `surface-panel`, static `gap-*`, and generic card treatments
- some tokens render but are too subtle to matter
- low-level overrides are exposed alongside semantic controls and can dilute the semantic layer

This brief addresses all of that directly.

## Non-negotiable execution rules

### Rule 1: One feature at a time

Do not work on multiple formatting controls in the same validation step.

For each feature:

1. audit supported sections
2. fix the renderer path
3. save/publish from admin
4. verify on the public frontend
5. capture proof
6. only then move to the next feature

### Rule 2: Use real proof sections

Use the live homepage as the proof environment.

Use these sections as your fixed QA fixtures:

- `Core Outcomes` = baseline `card_grid`
- `Service Snapshot` = premium `card_grid` proof case
- `How Engagements Work` = process cards / steps
- `Proof Metrics` = evidence / metrics
- final CTA section
- one composed/custom section that renders card-like blocks

### Rule 3: No weak deltas

A control does not count as implemented if the result is technically different but visually negligible.

If a side-by-side screenshot forces someone to squint, it fails.

### Rule 4: No fake support

If a section type cannot produce a meaningful visual delta for a control, remove that control from the backend capability matrix for that section type.

No dead controls.
No decorative-only controls.
No “works in theory” controls.

### Rule 5: Semantic system first, low-level overrides second

High-level semantic controls are the primary system.
Low-level overrides are secondary and must not silently cancel out semantic behavior.

If low-level overrides are currently diluting semantic controls:

- define explicit precedence
- document it
- simplify or temporarily hide conflicting low-level overrides where necessary

## Required implementation order

Complete the features in this exact order.

1. `contentDensity`
2. `sectionSurface`
3. `gridGap`
4. `cardFamily`
5. `cardChrome`
6. `accentRule`
7. `dividerMode`
8. `headingTreatment`
9. `labelStyle`
10. `sectionRhythm`
11. `widthMode`
12. low-level override rationalization and capability cleanup
13. full section-library retrofit for any remaining hardcoded bypasses

Do not skip ahead.

## Preflight requirements

Before feature work begins:

1. create a control-to-section audit matrix
2. record the current support state for every formatting control
3. identify every renderer still bypassing the token system
4. define the precedence model between:
   - semantic tokens
   - low-level overrides
   - page/site formatting defaults

The audit matrix must cover:

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
- `widthMode`

For each control and each section type, classify:

- `supported and visible`
- `supported but weak`
- `persisted but not rendered`
- `not supported and should be removed`

## Phase 1: `contentDensity`

### Goal

`contentDensity` must create obvious spacing differences inside supported sections and cards.

This is currently underpowered and is one of the most visibly failed controls.

### Supported sections

At minimum:

- `card_grid`
- any card-based `composed` blocks
- `label_value_list` if cards are used
- `faq_list` only if density can affect spacing meaningfully
- `steps_list` if its card/step layout supports density meaningfully

If a section cannot express density without becoming fake support, remove the capability.

### Required visual specification

The density system must affect more than one padding class.
It must change:

- card header padding
- card body padding
- gap between title and body
- gap between body and meta/details
- list spacing inside cards
- heading-to-grid spacing at the section level where appropriate

### Required density profiles

`tight`
- header padding: `12-14px`
- body padding: `12-14px`
- internal vertical gaps: `6-8px`
- list spacing: `2-4px`
- section heading-to-grid spacing: `16-20px`
- visual feel: operational, compact, efficient

`standard`
- header padding: `16-18px`
- body padding: `16-18px`
- internal vertical gaps: `10-12px`
- list spacing: `4-6px`
- section heading-to-grid spacing: `24-28px`
- visual feel: balanced, neutral, default production mode

`airy`
- header padding: `22-24px`
- body padding: `22-24px`
- internal vertical gaps: `16-20px`
- list spacing: `8-10px`
- section heading-to-grid spacing: `32-40px`
- visual feel: premium, calmer, more editorial

### Acceptance rule

Switching `tight -> airy` on the same section must be obvious in screenshots without zooming.

If the difference is still subtle, strengthen the spacing system again.

### Proof test

Run on:

- `Service Snapshot`
- `Core Outcomes`

Capture:

- `tight`
- `standard`
- `airy`

## Phase 2: `sectionSurface`

### Goal

`sectionSurface` must create real section hierarchy and visible page rhythm.

It is currently too easy for surface changes to disappear into the global dark background.

### Required visual specification

`none`
- no added band
- no surface-specific border
- no additional stage treatment
- section reads neutral

`panel`
- contained surface treatment
- visible contrast from page background
- minimum visible shift: `bg` opacity or tone delta that reads as a panel, not just a tiny tint

`soft_band`
- full-width band
- subtle border-y treatment
- soft tonal lift from page background
- visual purpose: supportive separation, not spotlight

`contrast_band`
- stronger full-width band
- stronger border-y
- clearly higher contrast than `soft_band`
- visual purpose: decisive section break

`spotlight_stage`
- premium featured stage
- visible top-to-bottom tonal shift or accent glow
- clear featured-section feeling
- may include signature pattern only if restrained and legible

`grid_stage`
- technical/systemic stage
- visible structured pattern or ray/grid treatment
- should feel more technical than `spotlight_stage`

### Required implementation note

Do not let surrounding wrapper styles neutralize the band.
If section wrappers, page background, or panel opacity flatten the effect, rework that stack.

### Acceptance rule

`none`, `soft_band`, `contrast_band`, and `spotlight_stage` must be distinguishable instantly in screenshots.

### Proof test

Run on:

- `Service Snapshot`
- `Proof Metrics`
- final CTA

## Phase 3: `gridGap`

### Goal

`gridGap` must visibly change the relationship between cards, not just nudge them.

### Required values

`tight`
- `12px`
- dense, utility layout

`standard`
- `20px`
- balanced default

`wide`
- `32px`
- premium, breathable, editorial

Do not leave this at tiny `gap-4` vs `gap-6` deltas if they are not visually clear in practice.

### Acceptance rule

`tight` vs `wide` must visibly alter the section’s composition at a glance.

### Proof test

Run on:

- `Core Outcomes`
- `Service Snapshot`

## Phase 4: `cardFamily`

### Goal

Each card family must have an unmistakable visual identity.

This is one of the biggest remaining failures. `Core Outcomes` and `Service Snapshot` still look too similar.

### Required families

`quiet`
- baseline utility card
- restrained background
- soft border
- minimal ornament
- no premium offer cues

`service`
- premium productized-offer card
- stronger header/body segmentation
- visible premium depth
- stronger accent presence
- more deliberate internal structure
- should feel like a commercial offer, not a generic info tile

`proof`
- calmer, more editorial evidence card
- less glow, less sales emphasis
- more trust/report feel
- stronger emphasis on evidence payload, quote, or proof text

`process`
- procedural / directional
- structural left rail or clear step cue
- more operational than premium
- rigid spacing, sequential feel

`metric`
- compact and data-forward
- strong metric hierarchy
- minimal narrative padding
- centered or clearly numeric composition

`logo_tile`
- minimal partner/trust tile
- utility-like
- no unnecessary premium chrome

`cta`
- more assertive than informational cards
- clearer foreground/background contrast
- action-led presence

### Required visual parameters

You must differentiate families through a combination of:

- border logic
- radius logic
- background logic
- internal segmentation
- typography hierarchy
- accent behavior
- shadow behavior
- content alignment

Do not rely on one ring or one shadow modifier.

### Minimum family distinction rules

`quiet` vs `service`
- must not share the same card silhouette + same internal layout + same contrast profile

`service` vs `proof`
- `service` should feel more premium/offer-driven
- `proof` should feel calmer and more evidence-led

`process` vs `service`
- `process` should feel more structural and sequential, less sales-oriented

`metric` vs `quiet`
- `metric` should feel numerically anchored and more compact

### Acceptance rule

In screenshots, a reviewer should be able to identify the family role without reading the backend setting.

### Proof test

Run the same `card_grid` content through:

- `quiet`
- `service`
- `proof`

and demonstrate obvious visual differences.

## Phase 5: `cardChrome`

### Goal

`cardChrome` must modify physicality, not disappear into the family base.

### Required variants

`flat`
- minimal/no shadow
- low physical lift
- cleaner edge definition

`outlined`
- crisp border/ring
- low shadow
- more technical/structured feel

`elevated`
- visible lift
- stronger shadow
- premium raised plane

`inset`
- inner shadow / recessed feel
- should look intentionally recessed, not just darker

### Acceptance rule

The same family with different chrome values must clearly look different in screenshots.

### Proof test

Run on:

- `service`
- `proof`

## Phase 6: `accentRule`

### Goal

`accentRule` must create purposeful emphasis, not noise.

### Required variants

`none`
- no accent treatment

`left`
- visible left rule, `2-3px`
- should feel structural, not decorative

`top`
- visible top rule, `2-3px`
- should feel premium or assertive depending on family

`inline`
- accent rendered inside the card, such as a short line or micro-bar in the header
- must be intentional and clearly different from border accents

### Acceptance rule

`left`, `top`, and `inline` must be visibly different strategies, not three barely different lines.

### Proof test

Run on:

- `service`
- `process`

## Phase 7: `dividerMode`

### Goal

`dividerMode` must visibly change internal separation where supported.

### Required variants

`none`
- no dividers

`subtle`
- low-contrast separators
- suitable for editorial/proof content

`strong`
- visible separators
- suitable for service details, FAQs, structured rows

### Acceptance rule

If a supported section uses dividers, `none`, `subtle`, and `strong` must each be obvious.

If a section cannot express divider mode clearly, remove support.

### Proof test

Run on:

- `Service Snapshot`
- `faq_list`
- any composed rows that expose dividers

## Phase 8: `headingTreatment`

### Goal

Headings must visibly change hierarchy and tone.

### Required treatments

`default`
- normal section heading style

`display`
- larger size
- tighter tracking
- higher authority
- used for hero/CTA/stage sections

`mono`
- more technical/systemic tone
- suitable for process or infrastructure-like sections

### Acceptance rule

The change must be obvious in section headings and any card headings where the treatment is supported.

## Phase 9: `labelStyle`

### Goal

Labels, chips, eyebrows, and badges must have distinct micro-UI language.

### Required styles

`default`
- restrained neutral chip

`pill`
- accent-tinted premium chip
- visible rounded badge identity

`mono`
- technical label treatment
- more systematic / operator-grade

`micro`
- tiny editorial/metadata label
- useful for secondary meta, not for dominant badges

### Acceptance rule

These should not collapse into “small text with minor casing differences.”

## Phase 10: `sectionRhythm`

### Goal

Section vertical pacing must create visible page hierarchy.

### Required rhythm profiles

`compact`
- `24-32px` vertical padding
- utility/supportive sections

`standard`
- `56-72px`
- main body sections

`proof`
- `48-64px`
- supportive but less compressed than compact

`hero`
- `88-120px`
- only for flagship top-stage sections

`cta`
- `80-104px`
- strong closing stage

`footer`
- compressed but not cramped

### Acceptance rule

The homepage should visibly change pace from section to section.

If all sections still feel evenly spaced, this phase has failed.

## Phase 11: `widthMode`

### Goal

`widthMode` must have an actual visible impact where supported.

### Required behavior

`content`
- constrained reading width / grid container

`full`
- materially wider layout
- stage-like sections should visibly open up

Do not implement `full` as a trivial width increase that nobody notices.

## Phase 12: low-level override rationalization

This is mandatory.

Current failure pattern:

- semantic controls exist
- low-level overrides exist
- both can influence layout/panels/spacing
- the result is unclear precedence and diluted visual outcomes

### Required action

Document and enforce precedence.

Required precedence:

1. explicit low-level override, if intentionally set and supported
2. semantic token result
3. preset default
4. section default
5. site default

### Additional rule

If a low-level override makes a semantic control visually meaningless for a section, either:

- expose a clear warning in admin, or
- prevent the conflicting combination, or
- reduce the override surface for that section type

## Phase 13: full renderer retrofit

This phase is where you remove remaining hardcoded bypasses.

### Required action

Audit and retrofit all landing-section renderers so that supported controls come from the shared token system rather than ad hoc classes.

This includes, at minimum:

- [what-i-deliver-section.tsx](/var/www/html/hopfner.dev-main/components/landing/what-i-deliver-section.tsx)
- [how-it-works-section.tsx](/var/www/html/hopfner.dev-main/components/landing/how-it-works-section.tsx)
- [workflows-section.tsx](/var/www/html/hopfner.dev-main/components/landing/workflows-section.tsx)
- [why-this-approach-section.tsx](/var/www/html/hopfner.dev-main/components/landing/why-this-approach-section.tsx)
- [faq-section.tsx](/var/www/html/hopfner.dev-main/components/landing/faq-section.tsx)
- [final-cta-section.tsx](/var/www/html/hopfner.dev-main/components/landing/final-cta-section.tsx)
- [tech-stack-section.tsx](/var/www/html/hopfner.dev-main/components/landing/tech-stack-section.tsx)
- [composed-section.tsx](/var/www/html/hopfner.dev-main/components/landing/composed-section.tsx)
- [section-primitives.tsx](/var/www/html/hopfner.dev-main/components/landing/section-primitives.tsx)

### Required cleanup

Remove or replace hardcoded patterns like:

- `surface-panel` as a universal fallback when semantic surface/family should apply
- fixed `gap-*` values that bypass density
- generic repeated card silhouettes for all card-bearing sections
- static band/panel treatments that override `sectionSurface`

## Files that must be treated as system-critical

- [page.tsx](/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx)
- [section-editor-drawer.tsx](/var/www/html/hopfner.dev-main/components/section-editor-drawer.tsx)
- [resolve.ts](/var/www/html/hopfner.dev-main/lib/design-system/resolve.ts)
- [presentation.ts](/var/www/html/hopfner.dev-main/lib/design-system/presentation.ts)
- [component-families.ts](/var/www/html/hopfner.dev-main/lib/design-system/component-families.ts)
- [capabilities.ts](/var/www/html/hopfner.dev-main/lib/design-system/capabilities.ts)
- [loaders.ts](/var/www/html/hopfner.dev-main/lib/design-system/loaders.ts)
- all registry / preset SQL migrations

## Required backend/admin behavior

After each feature phase:

- only expose the controls that section type can really support
- ensure values save correctly
- ensure values restore correctly when reopening the drawer
- ensure draft/publish flow remains correct

## Required QA process for every feature

For each feature, use this exact QA loop:

1. choose one proof section
2. capture baseline screenshot on the public site
3. change one control only in admin
4. save draft
5. publish
6. reload public page
7. capture new screenshot
8. compare
9. if difference is weak, continue implementation and repeat

Do not move to the next feature until the current one is visually convincing.

## Required proof deliverables

Before closing v10, provide:

1. a control-by-control implementation matrix
2. a section-by-section support matrix
3. before/after screenshots for each feature phase
4. explicit list of controls removed from unsupported sections
5. confirmation that the final homepage now shows clear differences between:
   - `Core Outcomes`
   - `Service Snapshot`
   - process section
   - proof/metrics section
   - CTA section

## Final acceptance criteria

v10 is complete only when all statements below are true.

1. Every formatting control exposed in admin is visually meaningful on the frontend.
2. Unsupported controls have been removed from the relevant section types.
3. `tight`, `standard`, and `airy` are visually obvious.
4. `none`, `soft_band`, `contrast_band`, and `spotlight_stage` are visually obvious.
5. `quiet`, `service`, `proof`, `process`, and `metric` card families are distinguishable at a glance.
6. `flat`, `outlined`, `elevated`, and `inset` chrome variants are distinguishable at a glance.
7. Accent rules create distinct emphasis strategies.
8. Divider modes are visible where supported.
9. The homepage no longer feels like one repeated dark-card pattern.
10. The resulting UI reads as premium, intentional, and professional.

## Final instruction

Do not optimize for speed.
Do not optimize for “technically wired.”
Do not optimize for “good enough.”

Optimize for truth, clarity, and visible excellence.

The backend must not promise more than the frontend can deliver.
The frontend must not flatten the design system into one generic style.
Each feature must matter.
