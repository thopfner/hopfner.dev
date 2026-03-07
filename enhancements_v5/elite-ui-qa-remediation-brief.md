# Elite UI QA Remediation Brief

## QA Verdict

The v4 implementation is **not yet at elite level**.

It improved infrastructure more than it improved the live visual outcome.

## Score vs brief

- design-system plumbing: `7.5 / 10`
- CMS/admin control expansion: `7 / 10`
- renderer realization of the new system: `4 / 10`
- flagship preset/template delivery: `2 / 10`
- live visual result on `https://hopfner.dev`: `5.5 / 10`
- overall score vs the v4 brief: `5.5 / 10`

## Visual assessment

The site is cleaner than before, but it still does **not** visually compete with elite AI / automation / tech websites.

It still reads as:

- polished dark consultancy site

It does **not yet** read as:

- premium technical operator brand
- high-end AI systems consultancy
- flagship `Obsidian Operator` implementation

## Primary reasons

1. The semantic UI system is not fully wired into the renderers.
2. The live homepage is still running on generic/default section treatments.
3. The flagship template set was not properly seeded into the system.
4. The hero and repeated card sections remain too visually conservative and too similar.

---

## Critical Findings To Fix

### 1. Semantic section controls are still largely dormant in the frontend

This is the most important implementation failure.

The page renderer collects:

- `sectionRhythm`
- `contentDensity`
- `gridGap`
- `sectionSurface`
- `cardFamily`
- `cardChrome`
- `accentRule`
- `headingTreatment`
- `labelStyle`

from section formatting in:

- `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`

But those values are not meaningfully consumed by the actual section renderers.

Evidence:

- `sectionContainerProps()` returns these semantic fields in `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx:323`
- `SectionShell` expects `rhythm` and `surface`, not `sectionRhythm` and `sectionSurface`, in `/var/www/html/hopfner.dev-main/components/landing/section-primitives.tsx:13`
- `WhatIDeliverSection` still uses a hardcoded `<section>` wrapper and a fixed `grid gap-4` in `/var/www/html/hopfner.dev-main/components/landing/what-i-deliver-section.tsx:102`
- `FinalCtaSection` also uses hardcoded wrappers rather than the shared section primitive in `/var/www/html/hopfner.dev-main/components/landing/final-cta-section.tsx:46`

Also important:

- repo-wide search shows `cardFamily`, `cardChrome`, `accentRule`, `labelStyle`, `contentDensity`, and `gridGap` are mostly stored and passed around, but not actually used to produce differentiated frontend output

### Required fix

Implement the semantic UI system as real rendering behavior.

This is mandatory.

#### Required actions

1. Introduce a shared semantic section props type and use it consistently across landing sections.
2. Map `sectionRhythm -> rhythm` and `sectionSurface -> surface` explicitly before rendering.
3. Refactor homepage section components so they either:
   - use `SectionShell`, or
   - consume the same semantic tokens with equivalent behavior
4. Make these tokens visibly affect output:
   - `sectionRhythm`
   - `sectionSurface`
   - `contentDensity`
   - `gridGap`
   - `cardFamily`
   - `cardChrome`
   - `accentRule`
   - `headingTreatment`
   - `labelStyle`
   - `dividerMode`

#### Minimum renderer targets

- `/var/www/html/hopfner.dev-main/components/landing/hero-section.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/what-i-deliver-section.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/how-it-works-section.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/tech-stack-section.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/workflows-section.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/final-cta-section.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/faq-section.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/why-this-approach-section.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/composed-section.tsx`

#### Required visual mapping

- `hero` rhythm: visibly more stage space than standard sections
- `compact` rhythm: visibly tighter than content sections
- `proof` rhythm: denser, more analytical spacing
- `cta` rhythm: stronger separation and closure
- `spotlight_stage`: staged premium backdrop, not a plain card
- `contrast_band`: strong contrast strip for CTA/proof use cases
- `service` card family: restrained, clean, structural
- `proof` / `metric` card family: tighter, more data-led
- `process` card family: directional and sequential
- `logo_tile` card family: flatter, calmer, less panel-heavy

No semantic control should remain decorative-only.

---

### 2. The flagship formatting templates were not delivered as instructed

The v4 brief required these seeded system templates:

- `Obsidian Operator`
- `Executive Slate`
- `Signal Grid`

Current migration seeding still contains the older generic templates in:

- `/var/www/html/hopfner.dev-main/supabase/migrations/20260221_formatting_templates.sql:54`

The required v4 flagship templates are not present there.

### Required fix

Add a new migration that inserts or upserts the three required flagship templates.

Do not reuse the old generic names as a substitute.

#### Required template definitions

1. `Obsidian Operator`
   - primary recommended preset
   - default brand signature: `obsidian_signal`
   - display font: `Space Grotesk`
   - body font: `IBM Plex Sans`
   - mono font: `IBM Plex Mono`
   - restrained accent
   - stronger shadow and panel hierarchy than the current live site

2. `Executive Slate`
   - quieter, more corporate variant
   - still premium and dark
   - lower signature intensity

3. `Signal Grid`
   - more technical and structured
   - use `grid_rays`
   - still restrained and readable

#### Required backend behavior

- ensure these templates appear in the global formatting admin UI
- ensure their token payloads include the new typography and signature tokens
- ensure `Obsidian Operator` is the recommended documented default

---

### 3. The homepage/default section seeds were not upgraded to express the new system

The live homepage still looks too generic because the content/default blueprint is still using legacy formatting assumptions.

Evidence:

- `/var/www/html/hopfner.dev-main/lib/cms/blueprint-content.ts` still shows old baseline formatting with generic `F_LEFT` / `F_CENTER` patterns and no meaningful `sectionRhythm`, `sectionSurface`, `cardFamily`, or `cardChrome` defaults
- the live site visually confirms those defaults are still weak and too uniform

### Required fix

Update the blueprint/default section data and section-type defaults so the homepage visibly expresses the elite system without requiring manual styling on every section.

#### Required homepage default mapping

Use this exact baseline:

1. Hero
   - `sectionRhythm: hero`
   - `sectionSurface: spotlight_stage`
   - `headingTreatment: display`
   - split layout
   - real proof panel styling
   - stronger CTA spacing and prominence

2. Trust / proof strip
   - `sectionRhythm: compact`
   - `sectionSurface: none` or `soft_band`
   - use `label_value_list` or composed trust strip in a non-card-heavy form

3. Core outcomes
   - `sectionRhythm: proof`
   - `cardFamily: proof`
   - `cardChrome: outlined` or `inset`
   - tighter density than services

4. Service snapshot
   - `sectionRhythm: standard`
   - `cardFamily: service`
   - `cardChrome: quiet outlined`
   - stronger internal hierarchy than outcomes

5. Process / engagement flow
   - `sectionRhythm: standard`
   - `cardFamily: process`
   - `accentRule: left` or `inline`
   - connected directional layout, not generic cards

6. Final CTA
   - `sectionRhythm: cta`
   - `sectionSurface: contrast_band` or `spotlight_stage`
   - must feel like a closing action stage, not another repeated card block

#### Important rule

Do not leave the homepage dependent on editors manually discovering the right combinations.

The system must ship with strong defaults.

---

### 4. Several required site-wide controls remain incomplete in admin persistence

The v4 brief required broader typography and signature token support than what is currently exposed and saved.

Evidence:

- `buildCurrentSettingsPayload()` in `/var/www/html/hopfner.dev-main/app/admin/(protected)/global-sections/page-client.tsx:1129` does not persist:
  - `displayWeight`
  - `headingWeight`
  - `bodyWeight`
  - `metricTracking`
  - `bodyScale`
  - `signatureNoiseOpacity`
- `applySettingsToForm()` also does not restore those values in `/var/www/html/hopfner.dev-main/app/admin/(protected)/global-sections/page-client.tsx:1179`
- the customization UI exposes some of the new type controls, but not the full required set in `/var/www/html/hopfner.dev-main/app/admin/(protected)/global-sections/page-client.tsx:1382`

### Required fix

Complete the site-wide formatting control set and persistence path.

#### Required controls to add and persist

- `displayWeight`
- `headingWeight`
- `bodyWeight`
- `metricTracking`
- `bodyScale`
- `signatureNoiseOpacity`

#### Required files

- `/var/www/html/hopfner.dev-main/app/admin/(protected)/global-sections/page-client.tsx`
- `/var/www/html/hopfner.dev-main/lib/cms/types.ts`
- `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`
- `/var/www/html/hopfner.dev-main/app/globals.css`

#### Required behavior

- values must load from saved settings
- values must be editable in admin
- values must save back to the DB
- values must visibly affect the live frontend

---

### 5. Hero execution is still too subdued for a flagship AI / automation homepage

The live hero still feels too conservative.

Evidence in renderer:

- the headline size ceiling is still modest in `/var/www/html/hopfner.dev-main/components/landing/hero-section.tsx:123`
- hero body copy is rendered at small utility sizes in `/var/www/html/hopfner.dev-main/components/landing/hero-section.tsx:131`
- CTA buttons still use `size="sm"` in `/var/www/html/hopfner.dev-main/components/landing/hero-section.tsx:149`
- proof panel styling still reads as a generic card grid in `/var/www/html/hopfner.dev-main/components/landing/hero-section.tsx:178`

### Required fix

Upgrade the hero into a clear flagship stage.

#### Required design behavior

- the display headline must feel materially larger and more authoritative than section headings
- the split hero layout should be the homepage default
- the proof panel must look like a controlled technical artifact, not placeholder dashboard boxes
- CTA cluster must feel intentional and high-confidence, not small utility buttons
- the hero must visibly benefit from the `Obsidian Signal` layer

#### Implementation rule

Do not solve this with only bigger font sizes.

Solve it with:

- stronger hierarchy
- better stage spacing
- more deliberate proof artifact styling
- stronger CTA composition

---

### 6. Card sameness is still too high on the live homepage

This remains one of the biggest visual problems.

The live homepage still presents too many sections as:

- dark card
- subtle border
- same spacing
- same corner logic
- same rhythm

This is the exact problem the v4 brief was meant to solve.

### Required fix

Make section families visibly different.

#### Required renderer behavior

1. `WhatIDeliverSection`
   - stop relying on one `surface-panel interactive-lift` baseline for most cases
   - implement visibly distinct families for `service`, `proof`, `metric`, and `logo_tile`
   - make `gridGap` and `contentDensity` alter actual gap/padding classes

2. `HowItWorksSection`
   - strengthen process-specific styling
   - use mono markers and directional flow as a stronger motif
   - reduce resemblance to service cards

3. `TechStackSection`
   - logo/trust/tool layouts must be visibly lighter and calmer than service/proof cards

4. `FinalCtaSection`
   - make CTA layouts feel like terminal sections, not another repeated panel

5. `ComposedSection`
   - bring the new block types into the same semantic family system instead of leaving them visually generic

---

## Required Work Order

Implement in this order.

1. Fix semantic renderer wiring.
2. Complete missing global admin token persistence.
3. Add new flagship template migration.
4. Update homepage/default section seeds and mappings.
5. Refactor hero and repeated section families for stronger differentiation.
6. Run full admin and frontend QA.

Do not reverse this order.

---

## Acceptance Criteria

This work is only complete when all of the following are true.

### CMS / admin

- site-wide typography and signature controls are complete and persist correctly
- flagship templates are available in admin
- section-level semantic controls visibly affect the frontend

### Frontend

- the homepage hero clearly feels flagship-level
- services, outcomes, proof, process, and CTA sections no longer look like near-duplicates
- section rhythm is visibly hierarchical
- the brand signature is present but restrained
- mobile and desktop both preserve the new hierarchy

### Visual standard

The homepage should now read closer to:

- premium AI systems consultancy
- high-end automation operator
- executive-grade technical partner

and no longer read as:

- generic dark consultancy template

---

## QA Steps To Run Before Closing

1. Apply `Obsidian Operator` in admin and confirm the homepage visibly changes.
2. Change `sectionRhythm` on one content section and verify real spacing changes on the frontend.
3. Change `sectionSurface` on one section and verify the stage treatment changes.
4. Change `cardFamily` and `cardChrome` on a card section and verify the cards materially change.
5. Change `displayWeight`, `bodyScale`, and `metricTracking` in admin and verify visible frontend effect.
6. Confirm the hero is materially stronger than the live March 7, 2026 baseline.
7. Capture fresh desktop and mobile screenshots and compare for rhythm, hierarchy, and section differentiation.

If those steps do not produce clear visual movement, the implementation is still incomplete.
