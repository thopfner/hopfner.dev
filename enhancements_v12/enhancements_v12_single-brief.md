# Enhancements v12: Sitewide Card Contract Rollout

## Read This First

This brief is intentionally narrow.

Do not treat v12 as another general styling pass.
Do not redesign card families yet.
Do not adjust density scales yet.
Do not add more tokens yet.

The single objective of v12 is:

**make the shared card resolver the only truthful card presentation contract across the marketing frontend**

Until that is true, the admin continues to expose more formatting controls than the frontend actually honors, and every later UI tuning round remains unreliable.

---

## Why v12 Exists

The latest implementation improved some token plumbing, but the live site still fails a simple truth test:

- `Core Outcomes`
- `Service Snapshot`
- `How Engagements Work`
- `Proof Metrics`
- final CTA variants

still read as small variations of the same dark card system.

This is not because the tokens are missing.
It is because several renderers still bypass the shared card contract and hardcode their own panel/card treatment.

As long as that remains true:

- backend `cardFamily` is only partly meaningful
- backend `cardChrome` is only partly meaningful
- backend `accentRule` is only partly meaningful
- visual QA remains inconsistent section to section
- later family/density tuning will keep producing mixed results

So v12 must solve the contract problem first.

---

## Current Audit Summary

The following renderer paths still bypass the shared card contract or only use it in part:

- `components/landing/workflows-section.tsx`
  - `cards` layout still renders `surface-panel interactive-lift`
  - default accordion shell still renders `surface-panel`

- `components/landing/faq-section.tsx`
  - accordion shell still renders `surface-panel`

- `components/landing/final-cta-section.tsx`
  - `split` and default layouts still render raw `surface-panel`
  - `high_contrast` uses a bespoke `div` instead of the shared card contract

- `components/landing/tech-stack-section.tsx`
  - `trust_strip` badges are bespoke
  - `metrics_grid` cards are bespoke
  - default metric panels still bypass the shared card contract

- `components/landing/why-this-approach-section.tsx`
  - still renders a raw `surface-panel`

- `components/landing/composed-section.tsx`
  - multiple block types still render raw cards or bespoke bordered panels:
    - ordered lists
    - cards
    - faq
    - metrics_row
    - badge_group
    - proof_card
    - testimonial
    - workflow_diagram
    - comparison
    - stat_chip_row

The page-level `panelStyle` flattening issue appears materially improved because it now pushes CSS variables rather than inline `boxShadow`, but that does not help enough while so many sections still hardcode their own card rendering.

---

## v12 Objective

By the end of v12, every marketing section that renders a card-like object must resolve its visual presentation through one shared sitewide contract.

That means:

1. one authoritative root resolver for card presentation
2. one authoritative approach for density-dependent padding/gaps inside cards
3. one authoritative way to apply family/chrome/accent
4. no raw `surface-panel` / `interactive-lift` card styling left in section renderers
5. backend card controls exposed only where the frontend actually honors them

This round is complete only when the frontend truthfully reflects the card controls section by section.

---

## Scope

### In scope

- all marketing section renderers that output cards, panel cards, CTA cards, metric cards, chip panels, or accordion shells that are visually card-like
- composed section block renderers that output card-like panels
- capability gating where card controls are shown for section/layout variants that do not actually use the card contract

### Out of scope for v12

- redesigning the family styles themselves
- increasing family contrast deltas
- revising density scales
- changing section rhythm semantics
- introducing new admin tokens

Those come later.
v12 is contract enforcement only.

---

## Non-Negotiable Implementation Rules

### Rule 1

No section renderer may decide its own card look by hardcoding `surface-panel`, `interactive-lift`, bespoke border/bg combinations, or one-off shadow systems.

### Rule 2

Every card-like surface must resolve through shared helpers in the design-system layer.

### Rule 3

If a section layout does not truly support card semantics, then admin must not expose `cardFamily`, `cardChrome`, or `accentRule` for that layout.

### Rule 4

If a visual unit looks like a card to the editor, then the card controls must affect it.

### Rule 5

Do not solve this by copy-pasting `resolveCardClasses()` everywhere and then mixing it with more bespoke panel classes.
Create a clean contract and adopt it consistently.

---

## Required Architecture

Implement or strengthen a single shared card presentation layer in `lib/design-system` and use it everywhere.

Minimum required shape:

- a shared resolver for the root card surface
- shared helpers for header/body/content spacing by density
- shared helpers for compact cards vs split header/body cards vs accordion shells
- shared helpers for inline accent placement where applicable

An acceptable implementation would look conceptually like:

- `resolveCardClasses(family, chrome, accentRule)`
- `resolveCardSpacing(density, mode)`
- `resolveCardPresentation(ui, options)`

You do not have to use those exact names, but the contract must be centralized and reusable.

The output must be strong enough that section renderers can mostly compose from:

- root class
- header class
- body class
- stack gap class
- accent fragment if needed

Section renderers should not be inventing new card visual systems after the helper returns.

---

## Required File Targets

At minimum, audit and update these files:

- `lib/design-system/component-families.ts`
- `lib/design-system/presentation.ts`
- `lib/design-system/capabilities.ts`
- `components/landing/what-i-deliver-section.tsx`
- `components/landing/workflows-section.tsx`
- `components/landing/faq-section.tsx`
- `components/landing/final-cta-section.tsx`
- `components/landing/tech-stack-section.tsx`
- `components/landing/why-this-approach-section.tsx`
- `components/landing/how-it-works-section.tsx`
- `components/landing/composed-section.tsx`
- `components/section-editor-drawer.tsx`

If supporting helpers or tokens need to move to a new file, that is acceptable.

---

## Execution Order

Follow this order exactly.

### Step 1: Define the shared card contract

Before touching the section renderers, formalize the shared contract in the design-system layer.

Required outcome:

- one helper determines root surface identity from `family`, `chrome`, and `accentRule`
- one helper determines spacing for `tight`, `standard`, `airy`
- one helper supports these structural modes:
  - standard card
  - compact metric/proof card
  - accordion shell
  - CTA card

Do not let each section pick its own spacing recipe anymore.

### Step 2: Convert section renderers that obviously use cards

Convert these first:

1. `workflows-section.tsx`
2. `faq-section.tsx`
3. `why-this-approach-section.tsx`
4. `final-cta-section.tsx`
5. `tech-stack-section.tsx`

Required outcome:

- no hardcoded `surface-panel` card roots remain in these files
- each card-like unit resolves through the shared card contract
- density spacing for the card internals comes from the shared contract

### Step 3: Convert composed-section block renderers

This is mandatory, not optional.

`composed-section.tsx` currently undermines the whole system because it can generate many visual panels without honoring the shared contract.

At minimum, convert these block types:

- ordered list cards
- `cards`
- `faq`
- `metrics_row`
- `badge_group`
- `proof_card`
- `testimonial`
- `workflow_diagram`
- `comparison`
- `stat_chip_row`

Where a block is not truly a card, decide one of two things:

- make it use the shared contract, or
- stop exposing card controls for that block/section path

Do not leave ambiguous half-support in place.

### Step 4: Clean up capability truthfulness

After renderer adoption, align admin exposure with real support.

Examples:

- if `trust_strip` chips in `tech-stack-section` still do not behave like cards, do not expose card controls there
- if a CTA variant intentionally ignores `accentRule`, do not expose `accentRule` for that variant

The capability system must describe reality, not aspiration.

### Step 5: Remove leftover contract bypasses

Before closing v12, run a repo-wide grep and remove remaining renderer-level bypasses.

Search for:

- `surface-panel`
- `interactive-lift`
- `bg-card/`
- `border-border/`
- `shadow-lg`

in marketing renderers and verify each remaining instance is justified.

Expected result:

- if the class is still present in a section renderer, it must be structural or intentionally layered on top of the shared contract
- it must not be the primary card identity anymore

---

## Section-by-Section Expectations

### `what-i-deliver-section.tsx`

This is the current reference proof case.
Do not regress it.

Use it as the model for how the other card-bearing sections should consume the shared contract.

### `workflows-section.tsx`

The `cards` layout and accordion shell must both adopt the same shared contract.

Expected result:

- if the editor changes `cardFamily`, the workflow cards visibly adopt that family
- if the editor changes `cardChrome`, the cards visibly change edge/shadow treatment
- if the editor changes `accentRule`, the workflow cards visibly change accent placement when supported

### `faq-section.tsx`

The accordion shell must not be a raw `surface-panel`.

Expected result:

- the FAQ block surface reflects the shared family/chrome contract
- density controls affect shell padding and answer spacing through shared helpers

### `final-cta-section.tsx`

All CTA variants must be truthful.

Expected result:

- default CTA card uses shared contract
- split CTA card uses shared contract
- high contrast CTA either:
  - derives from the shared contract with a CTA-specific variant layer, or
  - explicitly disables unsupported card controls in admin

Do not leave one CTA layout on the new system and another on raw bespoke classes.

### `tech-stack-section.tsx`

Be precise here.
This section has multiple layout variants and not all of them are equally card-like.

Required behavior:

- `metrics_grid`: must use the shared card contract
- default metric tiles: must use the shared card contract
- `trust_strip` / chip-like variants:
  - either convert them to a truthful compact card contract
  - or remove card controls for that layout

### `why-this-approach-section.tsx`

Simple but important.
It must stop hardcoding a generic panel and adopt the shared card contract.

### `composed-section.tsx`

This file must stop being a bypass tunnel for the design system.

Any block that looks like a card or panel must either:

- use the shared contract, or
- be downgraded so admin does not pretend card controls apply

No middle ground.

---

## QA Requirements

You must verify this round in both code and UI.

### Code QA

Confirm these statements are true:

- section renderers no longer hardcode primary card identity
- shared helpers now own the card identity
- capability exposure matches real renderer support
- no section can silently ignore `cardFamily`, `cardChrome`, or `accentRule` while still exposing them in admin

### Visual QA

Use these homepage proof cases:

- `Core Outcomes`
- `Service Snapshot`
- `How Engagements Work`
- `Proof Metrics`
- final CTA

For each proof case, verify that changing:

- `cardFamily`
- `cardChrome`
- `accentRule`

creates a visible frontend difference after save/publish.

Do not accept microscopic deltas.
The change must be obvious without zooming or squinting.

### Admin QA

For each layout variant you leave exposed:

- confirm the card controls shown in the editor actually affect the frontend
- if not, remove them from that variant

---

## Acceptance Criteria

v12 is complete only if all of the following are true:

1. `card_grid`, workflow cards, FAQ shells, CTA cards, metric cards, and composed card-like blocks all resolve their surface identity through one shared contract.

2. `cardFamily`, `cardChrome`, and `accentRule` are truthful controls wherever they are shown.

3. No remaining marketing renderer relies on raw `surface-panel` or equivalent bespoke border/bg/shadow styling as its primary card identity.

4. The live homepage shows clearly different card behavior when these controls are changed on sections that support them.

5. The implementation is cleanly landed in the repo and passes `npm run build`.

---

## Explicit Non-Acceptance Conditions

Do not mark v12 complete if any of the following remain true:

- `composed-section.tsx` still renders most panel blocks with bespoke card styling
- `faq-section.tsx` still wraps its accordion in a raw `surface-panel`
- `final-cta-section.tsx` still uses raw card styling in any layout while exposing card controls
- `tech-stack-section.tsx` still exposes card controls for layouts that do not honor them
- changing `cardChrome` in admin only produces a nearly invisible result because the renderer bypasses the shared contract

---

## Deliverable

When finished, provide:

- a short summary of which section/layout variants were migrated to the shared card contract
- a short summary of which controls were hidden because they were not truthful
- confirmation that `npm run build` passes
- confirmation that admin save/publish produces visible frontend card changes on the proof sections

This round is about making the card layer truthful.
Nothing else should distract from that.
