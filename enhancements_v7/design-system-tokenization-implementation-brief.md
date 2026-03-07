# Design System Tokenization Implementation Brief

## Objective

Build a robust, scalable, replicable design-system architecture so that all supported formatting controls are tokenized and render consistently across all section types.

This is now a system architecture task, not a one-off UI patch.

## Non-negotiable outcome

Every supported backend formatting control must follow this path:

1. stored as a semantic token or preset reference
2. normalized through one shared resolver
3. applied through one shared rendering contract
4. produce a predictable, visible frontend outcome

No section should maintain its own isolated interpretation of shared styling semantics.

---

## Core Design-System Model

Implement the design system in four layers.

### Layer 1: Site theme tokens

These define the global visual language.

Examples:

- typography roles
- background/base colors
- card surface base colors
- shadow scales
- radius scales
- signature layers
- accent color system

These are site-wide and should be applied from one root token object.

### Layer 2: Section presentation tokens

These define how a section behaves structurally.

Examples:

- section rhythm
- section surface
- content density
- grid gap
- heading treatment
- label treatment
- divider intensity

These should not be interpreted differently per component.

They should resolve to shared spacing/layout/chrome primitives.

### Layer 3: Component family tokens

These define reusable UI component personalities.

Examples:

- card family
- card chrome
- process step style
- metric tile style
- trust/logo row style
- CTA stage style

These must be reusable across multiple section types.

For example:

- `service`
- `proof`
- `metric`
- `process`
- `logo_tile`
- `cta`

These are not just labels. They are token bundles.

### Layer 4: Section preset composition

These define best-practice combinations for specific use cases.

Examples:

- `services_snapshot`
- `proof_metrics`
- `process_flow`
- `trust_strip`
- `hero_stage`
- `cta_close`

These presets should compose the lower token layers instead of hardcoding classes into one component.

This is how you make the system repeatable and editor-friendly.

---

## Required Architectural Rule

No renderer may directly interpret raw formatting JSON values independently if those values belong to the shared design system.

Instead:

- backend values -> normalized tokens
- normalized tokens -> resolved design-system object
- resolved design-system object -> renderer

The renderers should receive resolved styling semantics, not raw ad hoc fields.

---

## Current System Problem To Eliminate

The project currently mixes:

- raw formatting JSON
- section-specific styling branches
- partially reused shared primitives
- dead or weakly applied controls

This creates inconsistent behavior such as:

- a control working in one section but not another
- a control saving but producing no meaningful visual delta
- the same token name meaning different things in different components

That pattern must end in v7.

---

## Required Target Architecture

Implement a shared resolver layer.

### Required new shared modules

Create a design-system module set along these lines:

- `lib/design-system/tokens.ts`
- `lib/design-system/resolve-site-theme.ts`
- `lib/design-system/resolve-section-presentation.ts`
- `lib/design-system/resolve-component-family.ts`
- `lib/design-system/resolve-section-preset.ts`
- `lib/design-system/capabilities.ts`

Exact filenames can vary, but the separation of concerns should remain.

### Responsibilities

#### `tokens.ts`

Define the canonical token vocabularies and allowed values.

Examples:

- `ThemeTokenSet`
- `SectionPresentationTokens`
- `ComponentFamilyTokens`
- `SectionPresetTokens`

Do not keep these as loose strings spread across components.

#### `resolve-site-theme.ts`

Input:

- saved site-wide settings
- template preset tokens
- page-level overrides if applicable

Output:

- resolved root CSS variables
- resolved theme object

#### `resolve-section-presentation.ts`

Input:

- section formatting
- section preset defaults
- section type defaults

Output:

- normalized section presentation object:
  - `rhythm`
  - `surface`
  - `density`
  - `gridGap`
  - `headingTreatment`
  - `labelStyle`
  - `dividerMode`

#### `resolve-component-family.ts`

Input:

- component family key
- chrome modifier
- variant context

Output:

- resolved card/process/metric/logo/CTA styles

#### `resolve-section-preset.ts`

Input:

- section preset key
- section type

Output:

- composed defaults for:
  - section presentation
  - component family
  - variant mapping

#### `capabilities.ts`

Defines exactly which controls are supported by each section type and variant.

This must be shared by:

- admin editor UI
- renderer validation

This is how you stop showing dead controls.

---

## Data Model Strategy

Use a hybrid approach.

Do not throw away the current JSONB formatting model immediately.

Instead:

- preserve backward compatibility
- add formal token registries and preset references
- migrate the frontend and admin to prefer token keys over ad hoc raw values

This is the safest, most scalable path.

### Recommended persisted model

Keep section formatting JSON, but evolve it toward this structure:

```json
{
  "themePresetKey": "obsidian_operator",
  "sectionPresetKey": "services_snapshot",
  "presentation": {
    "rhythm": "standard",
    "surface": "spotlight_stage",
    "density": "airy",
    "gridGap": "wide",
    "headingTreatment": "display",
    "labelStyle": "mono",
    "dividerMode": "strong"
  },
  "component": {
    "family": "service",
    "chrome": "elevated",
    "accentRule": "left"
  },
  "overrides": {
    "...": "..."
  }
}
```

You do not need to use this exact JSON shape everywhere immediately, but the implementation direction should move toward it.

### Key design rule

Preset references and token keys should be the primary authored values.

Freeform overrides should be secondary.

---

## SQL / Persistence Architecture

Introduce formal token registries.

### Required new registry tables

Create tables along these lines:

1. `design_theme_presets`
2. `section_presentation_presets`
3. `component_family_presets`
4. `section_preset_registry`
5. `section_control_capabilities`

The exact naming can vary, but the responsibilities should remain separate.

### 1. `design_theme_presets`

Purpose:

- stores site-wide design-system presets

Example fields:

- `id`
- `key`
- `name`
- `description`
- `is_system`
- `tokens jsonb`
- `created_at`
- `updated_at`

Examples to seed:

- `obsidian_operator`
- `executive_slate`
- `signal_grid`

### 2. `section_presentation_presets`

Purpose:

- stores reusable layout/surface/rhythm presets

Example fields:

- `id`
- `key`
- `name`
- `description`
- `tokens jsonb`

Examples:

- `hero_stage`
- `services_snapshot`
- `proof_grid`
- `trust_strip`
- `process_flow`
- `cta_close`

### 3. `component_family_presets`

Purpose:

- stores reusable family styling bundles

Example fields:

- `id`
- `key`
- `name`
- `description`
- `tokens jsonb`

Examples:

- `service`
- `proof`
- `metric`
- `process`
- `logo_tile`
- `cta`

### 4. `section_preset_registry`

Purpose:

- maps a semantic preset to a section type and optional variant context

Example fields:

- `id`
- `key`
- `section_type`
- `variant_key`
- `presentation_preset_key`
- `component_family_key`
- `default_content_variant`
- `is_system`

This is how a “Services Snapshot” preset becomes reusable rather than hardcoded.

### 5. `section_control_capabilities`

Purpose:

- defines what controls each section type and variant actually supports

Example fields:

- `id`
- `section_type`
- `variant_key`
- `supports_rhythm`
- `supports_surface`
- `supports_density`
- `supports_grid_gap`
- `supports_card_family`
- `supports_card_chrome`
- `supports_accent_rule`
- `supports_divider_mode`
- `supports_heading_treatment`
- `supports_label_style`

This table can be relational or JSONB-backed. Either is fine.

The important part is:

- one authoritative source of truth
- shared by admin and renderer logic

---

## Required Frontend Rendering Contract

Every section component must accept one resolved design-system object, not a bag of optional styling guesses.

### Required section render contract

Use a shared prop shape similar to:

```ts
type ResolvedSectionUi = {
  rhythm: ...
  surface: ...
  density: ...
  gridGap: ...
  headingTreatment: ...
  labelStyle: ...
  dividerMode: ...
  componentFamily?: ...
  componentChrome?: ...
  accentRule?: ...
}
```

Then each section renderer decides only how to apply that already-resolved semantic object.

It should not:

- parse raw CMS strings itself
- define its own fallback meaning for shared values
- expose dead props it does not use

---

## Required Admin / CMS Contract

The admin must no longer behave like an unconstrained form builder for styling knobs.

It should behave like a design-system editor.

### Required admin behavior

1. Offer preset selection first
2. Offer semantic controls second
3. Offer advanced overrides only where supported

### Required UI structure

For each section:

- `Section preset`
- `Presentation`
- `Component family`
- `Advanced overrides`

The preset should prefill the token fields.

The capability matrix should control which fields appear.

### Required guardrail

If a section/variant does not support a token, the control must not appear.

This is non-negotiable.

---

## Immediate Proof-Case Requirement: `card_grid`

Use `card_grid` as the first end-to-end proof that the system works.

### Why `card_grid` first

It currently exposes the architectural weakness most clearly:

- `service-snapshot` stores meaningful formatting tokens
- those tokens are published
- frontend differences are still too weak or dead

### Required `card_grid` token behavior

For `card_grid`, all of these must become real, visible, and consistent:

- `rhythm`
- `surface`
- `density`
- `gridGap`
- `cardFamily`
- `cardChrome`
- `dividerMode`

### Required `service` family behavior

The `service` family must not visually equal the default card-grid style.

It needs a distinct identity.

Recommended characteristics:

- stronger vertical structure
- calmer, more intentional border treatment
- more internal spacing hierarchy
- optional heading row or eyebrow/tag treatment
- less generic panel feel than the default fallback

### Required `service-snapshot` preset

Seed a dedicated section preset for `Service Snapshot`.

Required baseline:

- `presentation.surface = spotlight_stage`
- `presentation.rhythm = standard`
- `presentation.density = airy`
- `presentation.gridGap = wide`
- `presentation.dividerMode = strong`
- `component.family = service`
- `component.chrome = elevated`

Most importantly:

the renderer outcome must be materially distinct from a default `proof` or generic `card_grid`.

---

## Required Rollout Order

Implement in this order.

1. Introduce token registries and migrations.
2. Build shared token resolver modules.
3. Build capability matrix and wire it into admin.
4. Refactor `card_grid` to use the new resolved UI contract.
5. Refactor the remaining built-in sections onto the same contract.
6. Refactor `ComposedSection` onto the same contract.
7. Seed presets and update section defaults.
8. Run QA matrix and visual regression checks.

Do not start with scattered section tweaks.

Build the system first, then attach sections to it.

---

## Required Deliverables

The coding agent should deliver all of the following.

### Backend / SQL

- migration(s) for token/preset registries
- seeded flagship theme presets
- seeded section presentation presets
- seeded component family presets
- seeded section capability metadata

### Shared code

- design-system token definitions
- shared resolver functions
- capability lookup utilities

### Admin UI

- preset-aware controls
- capability-aware control visibility
- cleaner section formatting editing model

### Frontend

- shared resolved UI contract
- `card_grid` fully migrated first
- remaining section types migrated afterward

### QA

- proof that backend formatting changes apply consistently
- proof that unsupported controls are not shown
- proof that `Service Snapshot` now visibly differs from other card-grid sections through the token system

---

## Acceptance Criteria

This work is complete only when all of the following are true.

### System architecture

- shared formatting semantics are defined in one place
- all supported controls resolve through one shared token pipeline
- renderer behavior is consistent across built-in and composed sections

### Admin quality

- controls are token/preset based, not ad hoc
- unsupported controls are hidden
- presets are reusable and understandable

### Frontend quality

- applying the same token values to different eligible sections produces consistent behavior
- `Service Snapshot` visibly reflects its configured settings
- section surfaces, card families, density, and divider treatments are no longer weak or inconsistent

### Brand/system quality

- the design language is dynamically applicable across the site
- the system is scalable for new sections
- the system is replicable for future pages without bespoke styling logic

