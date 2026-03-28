# Enhancements v11: Phased Design-System Remediation Plan

This brief is focused, sequential, and implementation-oriented.

It is based on the latest QA findings, not on generic future-state ideas.

The current remaining failures are:

1. the global `panelStyle` runtime still flattens card family and chrome differences
2. the shared card resolver is not yet the universal card contract across the site
3. family definitions are still too close together to create premium role separation
4. section-level density is still too weak because `SectionShell` and section stack spacing are not density-aware

This plan fixes those failures in order.

Do not work out of order.
Do not make “polish” changes before the runtime contract is fixed.

## Primary objective

Make the formatting system visually truthful.

That means:

- card family, chrome, accent, and density must survive runtime styling
- supported sections must use the same card presentation contract
- section rhythm and density must be visibly legible
- the homepage must show clear role separation between:
  - `Core Outcomes`
  - `Service Snapshot`
  - `How Engagements Work`
  - `Proof Metrics`
  - CTA sections

## Non-negotiable execution rule

Each phase must be completed and verified before the next begins.

For each phase:

1. implement code changes
2. run `npm run build`
3. verify in admin/backend where relevant
4. verify on the live frontend
5. capture proof
6. only then continue

## Phase 1: Stop `panelStyle` from flattening semantic card presentation

### Why this phase comes first

Right now, the page runtime still injects a shared inline `backgroundColor` and `boxShadow` into `panelStyle`.
Because inline `boxShadow` wins over class-based shadows, this weakens or overrides:

- `cardChrome`
- family-specific depth
- some premium visual distinctions

If this is not fixed first, the later family/chrome work will keep getting hidden.

### Files to audit and modify

- [page.tsx](/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx)
- any card-bearing sections receiving `panelStyle`
- shared panel/card primitives if needed

### Required implementation

Refactor the runtime styling contract so semantic card presentation is not overridden by inline style.

#### Required rule

`panelStyle` must no longer directly impose final `boxShadow` on cards that are supposed to express `cardChrome`.

#### Required direction

Split page-level panel styling into two layers:

1. `panel variables`
   - CSS variables only
   - allowed to define ambient values such as:
     - `--page-panel-opacity`
     - `--section-shadow-color`
     - optional ambient/inset shadow tokens
   - must not directly force the final visual chrome

2. `component classes`
   - card family and chrome classes must decide the visible border/shadow/elevation result
   - this is where `cardChrome` becomes visible

#### Required implementation behavior

Replace the current pattern:

- inline `panelStyle.backgroundColor`
- inline `panelStyle.boxShadow`

with one of these approaches:

- preferred:
  - pass CSS variables only
  - card classes consume those vars

- acceptable fallback:
  - split `panelStyle` into:
    - a neutral `panelToneStyle`
    - a separate `cardPresentationStyle`
  - do not pass the flattening style into card components that need semantic chrome

### Acceptance criteria

After this phase:

- changing `cardChrome` must produce visible shadow/elevation differences
- changing card family depth must remain visible
- page-level panel opacity may still tint cards, but must not erase family/chrome identity

### Required proof

Use `Service Snapshot` in admin and public frontend.
Verify that:

- `outlined`
- `elevated`
- `inset`

are visibly distinct after save/publish/reload.

## Phase 2: Make the shared card resolver the sitewide card contract

### Why this phase comes second

At the moment, `resolveCardClasses()` is effectively strongest in `card_grid`, but other sections still hardcode:

- `surface-panel`
- `interactive-lift`
- fixed borders
- fixed card silhouettes

That breaks the entire design-system promise because different sections are not speaking the same visual language.

### Files to audit and modify

At minimum:

- [what-i-deliver-section.tsx](/var/www/html/hopfner.dev-main/components/landing/what-i-deliver-section.tsx)
- [how-it-works-section.tsx](/var/www/html/hopfner.dev-main/components/landing/how-it-works-section.tsx)
- [workflows-section.tsx](/var/www/html/hopfner.dev-main/components/landing/workflows-section.tsx)
- [tech-stack-section.tsx](/var/www/html/hopfner.dev-main/components/landing/tech-stack-section.tsx)
- [faq-section.tsx](/var/www/html/hopfner.dev-main/components/landing/faq-section.tsx)
- [final-cta-section.tsx](/var/www/html/hopfner.dev-main/components/landing/final-cta-section.tsx)
- [why-this-approach-section.tsx](/var/www/html/hopfner.dev-main/components/landing/why-this-approach-section.tsx)
- [composed-section.tsx](/var/www/html/hopfner.dev-main/components/landing/composed-section.tsx)

### Required implementation

Introduce one shared card presentation path for all sections that render card-like units.

#### Required contract

For every section that supports card-like presentation:

- resolve `ui`
- derive:
  - family
  - chrome
  - accent
  - density
  - label style
- apply them through shared helpers, not ad hoc classes

#### Required cleanup

Reduce or eliminate hardcoded patterns like:

- `surface-panel interactive-lift`
- fixed `rounded-xl border border-border/50 bg-card/30`
- section-specific card shadows that ignore chrome

If a section is intentionally not part of the card family system, remove card-family/card-chrome controls from its capabilities.

### Acceptance criteria

After this phase:

- searching the landing section library should no longer show semantic-supported sections hardcoding the old generic card shell as their primary presentation
- the renderer contract should be visibly consistent across sections

### Required proof

Compare live screenshots of:

- `Service Snapshot`
- `How Engagements Work`
- `Proof Metrics`

and verify that all card-like sections are now driven by the same design-system logic rather than section-local styling islands.

## Phase 3: Strengthen family definitions into unmistakable visual roles

### Why this phase comes third

Once the shared resolver is truly in charge, the family definitions themselves must become stronger.
Right now `quiet`, `service`, and `proof` are still too close together.

### Files to audit and modify

- [component-families.ts](/var/www/html/hopfner.dev-main/lib/design-system/component-families.ts)
- any section internals that add family-specific structure

### Required family design parameters

These are implementation targets, not vague style notes.

#### `quiet`

Purpose:
- baseline utility card

Visual parameters:
- low-contrast border
- matte background
- low/no feature glow
- minimal segmentation
- restrained shadow or none

Required feel:
- calm, neutral, utility

#### `service`

Purpose:
- premium offer / productized service card

Visual parameters:
- stronger stage feel than `quiet`
- clearly segmented header/body
- premium top or side emphasis
- visible depth
- stronger accent trace
- more polished silhouette

Required feel:
- commercial, premium, flagship offer

#### `proof`

Purpose:
- evidence / trust / editorial proof card

Visual parameters:
- calmer than `service`
- lighter emphasis on accent
- less sales-oriented depth
- more report-like and editorial
- should privilege quote/metric/trust payloads

Required feel:
- evidence-led, credible, composed

#### `process`

Purpose:
- procedural / operational card

Visual parameters:
- stronger structural rail or directional cue
- more rigid geometry
- sequential tone
- step identity should feel systematic, not decorative

Required feel:
- methodical, operator-grade, sequential

#### `metric`

Purpose:
- data-led compact result card

Visual parameters:
- compact vertical rhythm
- stronger numeric hierarchy
- reduced narrative padding
- more analytic than editorial

Required feel:
- measurable, dashboard-like, crisp

#### `cta`

Purpose:
- action-oriented conversion block

Visual parameters:
- more contrast than informational cards
- stronger action emphasis
- firmer edge/shadow hierarchy

Required feel:
- decisive, intentional, conversion-ready

### Required implementation guidance

Do not only adjust gradient opacity.
Use a combination of:

- border thickness/intensity
- ring treatment
- shadow strategy
- internal segmentation
- radius strategy
- accent location
- title/body hierarchy

### Acceptance criteria

After this phase:

- `Core Outcomes` and `Service Snapshot` must no longer look like sibling variants of the same card style
- `Proof Metrics` must feel different from `Service Snapshot`
- `How Engagements Work` must read as a process system, not a generic card grid

### Required proof

Use live screenshots of:

- `Core Outcomes`
- `Service Snapshot`
- `How Engagements Work`
- `Proof Metrics`

and verify visible role separation.

## Phase 4: Make density affect section rhythm, not just card padding

### Why this phase comes fourth

The current density system is better than before, but it still mostly lives inside cards.
Section-level rhythm is still held back by fixed container stack spacing and uneven adoption.

### Files to audit and modify

- [section-primitives.tsx](/var/www/html/hopfner.dev-main/components/landing/section-primitives.tsx)
- all sections that should use density-aware heading-to-content spacing
- [presentation.ts](/var/www/html/hopfner.dev-main/lib/design-system/presentation.ts)

### Required implementation

Thread density into section-level composition.

#### Required changes

1. `SectionShell` must no longer hardcode one fixed child stack spacing
2. supported sections must use density-aware section spacing tokens
3. heading block to content block spacing must visibly change with density

### Required density parameters

These should be visibly reflected in layout.

#### `tight`

- heading-to-grid spacing: `16-20px`
- internal section stack spacing: compact
- card padding: compact

Required feel:
- efficient, operational

#### `standard`

- heading-to-grid spacing: `24-28px`
- balanced default stack rhythm

Required feel:
- normal, production-ready

#### `airy`

- heading-to-grid spacing: `36-44px`
- visibly more generous internal section rhythm
- should feel premium, calmer, more editorial

Required feel:
- spacious, elevated

### Required implementation note

The density system must influence:

- heading block to content spacing
- stacked item spacing
- card internal padding
- optional body/detail spacing

Not just one or two internal card classes.

### Acceptance criteria

After this phase:

- switching `tight` to `airy` on a supported section must visibly change the entire section rhythm
- the difference must be obvious in screenshots without zooming

### Required proof

Use:

- `Core Outcomes`
- `Service Snapshot`
- `Proof Metrics`

Capture:

- `tight`
- `standard`
- `airy`

## Phase 5: Capability cleanup and truth enforcement

### Why this phase is last

Once the runtime and visuals are corrected, the backend must stop advertising controls that are still fake or diluted.

### Files to audit and modify

- [capabilities.ts](/var/www/html/hopfner.dev-main/lib/design-system/capabilities.ts)
- DB-backed capability registry
- editor drawer support logic

### Required implementation

For every section type:

- keep only controls that now produce meaningful frontend output
- remove controls that still cannot be honored

### Required examples

If `faq_list` only supports:

- `sectionSurface`
- `sectionRhythm`
- `contentDensity`
- `dividerMode`
- `headingTreatment`

then it should not expose:

- `cardFamily`
- `cardChrome`
- `accentRule`

unless those are truly implemented.

### Acceptance criteria

After this phase:

- the editor drawer only shows truthful controls
- there are no fake semantic options

## Cross-phase QA protocol

This protocol is mandatory.

For every phase:

1. build the app
2. change one control in admin
3. save draft
4. publish
5. reload the public page
6. capture section screenshot
7. compare against baseline
8. if difference is weak, do not move on

## Required live proof sections

Use these exact homepage sections repeatedly:

- `Core Outcomes`
- `Service Snapshot`
- `How Engagements Work`
- `Proof Metrics`
- final CTA

## Required final deliverables

Before closing v11, provide:

1. phase-by-phase change summary
2. control support matrix after cleanup
3. before/after screenshots for each phase
4. confirmation that the following are now all true:
   - page-level panel styling no longer flattens family/chrome
   - shared card resolver is used wherever card families are supported
   - families are visibly distinct
   - density affects section rhythm, not only internal padding
   - capabilities only expose truthful controls

## Final completion standard

v11 is complete only if:

1. `Core Outcomes` and `Service Snapshot` are clearly visually distinct
2. `How Engagements Work` no longer reads like a generic dark card variant
3. `Proof Metrics` reads as a different UI role from service/offer cards
4. `cardChrome` visibly changes physicality
5. `contentDensity` visibly changes section rhythm
6. the backend no longer exposes controls that still don’t matter

Do not declare success because the code is more elegant.
Declare success only when the frontend differences are obvious and professional.
