# Hopfner Enhancements v8

## Purpose

This is the only implementation brief to use for the next round.

Ignore the prior enhancement packs while executing this one.

This brief is intentionally self-contained so there is no ambiguity about:

- what is still broken
- what the correct architecture should be
- what must be changed in code and data
- how success will be verified

## Executive summary

The current implementation has improved the codebase, but it has not yet fully achieved the design-system objective.

The biggest remaining failure is this:

- the project now has design-system concepts, resolver functions, and database registry tables
- but the runtime/admin still relies too heavily on hardcoded code constants
- and the visible frontend differentiation is still too weak in key proof cases

The clearest proof case is `Service Snapshot`.

Its formatting values are published and resolved, but the section still does not visually differentiate strongly enough from the other `card_grid` section.

That means the system is not yet delivering on the promise of:

- tokenized
- scalable
- dynamic
- elite-level
- consistently renderable UI behavior

This round must fix that decisively.

---

## Current QA findings you must treat as true

These findings are based on the current live repo and live site.

### 1. The SQL-backed registries exist, but the runtime is still mostly code-driven

The database now contains these tables and they are seeded:

- `design_theme_presets`
- `section_presentation_presets`
- `component_family_presets`
- `section_preset_registry`
- `section_control_capabilities`

However, the live app still relies heavily on hardcoded code maps instead of loading these registries dynamically:

- section presets are still read from `lib/design-system/presets.ts`
- section capabilities are still read from `lib/design-system/capabilities.ts`
- the section editor drawer reads those code constants directly
- the resolver also uses the code preset constants directly

This means the architecture is only half transitioned.

The database-backed design system exists, but the application is not fully using it as the source of truth.

That is not acceptable for the target system.

### 2. `Service Snapshot` is still the proof-case failure

The live published version of `Service Snapshot` already contains:

- `sectionRhythm = standard`
- `sectionSurface = spotlight_stage`
- `cardFamily = service`
- `cardChrome = elevated`
- `contentDensity = airy`
- `gridGap = wide`
- `dividerMode = strong`
- `accentRule = left`
- `labelStyle = pill`

So this is **not** a draft/publish issue.

The section is published correctly.

The remaining problem is renderer strength and design-system realization.

### 3. `dividerMode` is still not truly implemented for `card_grid`

`card_grid` now uses the shared `ui` object, but `dividerMode` still does not materially affect rendering there.

That means at least one editor-visible design-system control remains effectively dead in the flagship proof section.

This is not acceptable.

### 4. The `service` family is still visually underpowered

The `service` family currently produces only a restrained variation of the default card look.

That is why `Service Snapshot` still does not feel materially different enough from `Core Outcomes`.

This is a design-system failure, not a content problem.

The family identity is too weak.

### 5. Global theme preset management still uses the legacy table path

The admin global formatting UI still loads and applies templates through the older `formatting_templates` table.

That means the new `design_theme_presets` registry has not yet become the actual theme system.

This must be unified.

---

## Core objective for v8

Finish the transition to a real, database-driven design system.

The end state must be:

1. database-backed preset registries are the source of truth
2. admin UI reads those registries dynamically
3. frontend resolver reads those registries through a normalized loading layer
4. all supported controls produce visible and consistent results
5. `Service Snapshot` becomes the unmistakable proof that the system works

This is not optional.

---

## Non-negotiable rules

1. Do not add more parallel hardcoded maps if a DB registry already exists for the same concept.
2. Do not leave any editor-visible control without a deterministic renderer effect.
3. Do not ship a “service” card family that still looks like the default card system.
4. Do not keep the old theme-template path as the primary long-term mechanism.
5. Do not solve the proof-case issue with random one-off CSS inside one section.

You must solve this at the design-system layer.

---

## Required implementation outcomes

## Outcome 1: Make the DB registries the real source of truth

The new registry tables must become the runtime-backed design system.

### Required behavior

- the app should load section presets from `section_presentation_presets` and `section_preset_registry`
- the app should load component family defaults from `component_family_presets`
- the app should load capabilities from `section_control_capabilities`
- the app should load theme presets from `design_theme_presets`

### Required implementation strategy

Use a layered approach:

1. keep the existing code constants only as a temporary fallback
2. introduce runtime loaders for the DB-backed registries
3. normalize DB rows into the same internal types currently used by the resolver
4. flip the primary path so DB data wins
5. keep code constants only as emergency fallback for missing rows

### Required result

Changing preset/config rows in the DB must be reflected by the runtime after normal reload paths, not require code edits.

That is the whole point of this architecture.

---

## Outcome 2: Replace the legacy global template system with the new theme preset system

The current global formatting UI still uses `formatting_templates`.

That is not the target architecture anymore.

### Required changes

- transition the global formatting admin UI to `design_theme_presets`
- preserve read-only system presets vs editable user presets if needed
- keep migration/backward-compatibility only if necessary
- if `formatting_templates` must remain temporarily, it should be clearly marked legacy and not remain the primary path

### Required result

The site-wide theme preset workflow should be:

1. load presets from `design_theme_presets`
2. apply a selected design-theme preset to `site_formatting_settings`
3. edit and save user-defined theme presets back into the new registry

The new DB-backed theme system must become real, not theoretical.

---

## Outcome 3: Finish the section preset architecture

The section preset model must not just exist in name.

It must drive:

- admin preset selection
- renderer defaults
- visible section behavior

### Required changes

- move preset loading out of static `SECTION_PRESETS` as the primary source
- keep local typed normalization helpers, but source the data from DB
- ensure `sectionPresetKey` resolves through DB-backed preset data first

### Required result

If a preset row such as `services_snapshot` is updated in the DB, the section should resolve differently without requiring a code change.

---

## Outcome 4: Make `card_grid` a fully realized design-system section

`card_grid` is the current proof case and must become the strongest implementation example.

### Required controls that must be real for `card_grid`

All of these must visibly affect output:

- `sectionRhythm`
- `sectionSurface`
- `contentDensity`
- `gridGap`
- `cardFamily`
- `cardChrome`
- `accentRule`
- `dividerMode`
- `labelStyle` if exposed
- `headingTreatment` if exposed

### Required implementation rule

Do not let `card_grid` remain a generic card repeater with minor variations.

Each token must create a clear, repeatable, semantic visual outcome.

### Specific required fix for `dividerMode`

`dividerMode` must be truly implemented for `card_grid`.

That means:

- `none` = no visible internal dividers
- `subtle` = restrained separator treatment
- `strong` = clearly stronger separator treatment

This can be implemented through:

- explicit separators between content zones
- header/content/footer divider strength
- internal list/divider treatment

But it must be visually real and testable.

It is not enough to store the value.

### Specific required fix for `accentRule`

If `accentRule` is supported for `card_grid`, it must visibly affect cards when set:

- `left`
- `top`
- `inline`

No silent no-op behavior is acceptable.

### Specific required fix for `labelStyle`

If this is exposed for `card_grid` or card content, it must visibly affect tags/badges/eyebrow treatments.

If it is not truly supported, hide it for that section type.

---

## Outcome 5: Strengthen the `service` family so it is unmistakably distinct

The `service` family is currently too close to the default card system.

This must change.

### Design requirement

The `service` family should feel like:

- premium offering cards
- structured and intentional
- slightly more productized
- calmer and more professional than proof cards
- more elevated and composed than default panels

### It must not feel like

- a generic bordered dark card
- the same default card with a slight gradient
- visually interchangeable with proof/outcome cards

### Required `service` family traits

Implement a stronger family identity using a consistent token bundle.

Recommended characteristics:

- stronger heading hierarchy
- more pronounced top region / internal structure
- restrained but visible elevation
- more deliberate border/accent logic
- improved spacing rhythm inside the card
- clearer separation between headline and supporting text
- optional label/tag treatment aligned to `labelStyle`

### Required visual distinction vs `proof`

The difference should be obvious:

- `service` = premium offer / solution card
- `proof` = evidence / outcome / metric card

These two families must not collapse into the same visual language.

---

## Outcome 6: Make `Service Snapshot` the official proof case

Treat `Service Snapshot` as the required demonstration that the system works.

### Required live result

On the homepage:

- `Service Snapshot` must visibly differ from `Core Outcomes`
- the difference must be obvious without inspecting code
- the difference must come from the shared design-system architecture, not one-off CSS hacks

### Required specific configuration

The following published values must create a strong visible result:

- `sectionSurface = spotlight_stage`
- `cardFamily = service`
- `cardChrome = elevated`
- `contentDensity = airy`
- `gridGap = wide`
- `dividerMode = strong`
- `accentRule = left`
- `labelStyle = pill`

### Required visual expectation

Compared with `Core Outcomes`, `Service Snapshot` should feel:

- more premium
- more structured
- more spacious
- more offer-oriented
- more visibly staged

If a reviewer can still say “these look basically the same,” the work is not complete.

---

## Outcome 7: Keep built-in and composed sections on the same system

Do not let composed/custom sections drift away from the built-in design-system pipeline.

### Required behavior

Composed sections must resolve through the same normalized section UI object where applicable.

This includes:

- rhythm
- surface
- density
- grid gap
- heading treatment
- label style
- divider mode

### Required rule

The design-system contract should be shared, not duplicated separately for composed vs built-in sections.

---

## Technical implementation plan

Execute in this order.

### Step 1: Audit and unify all design-system data sources

Identify where each of these is currently sourced:

- theme presets
- section presentation presets
- component family presets
- section preset registry
- capability matrix

Then make the DB-backed registries primary.

Keep code fallback only temporarily.

### Step 2: Add runtime loaders and typed normalizers

Add data loaders that:

- read the new DB tables
- normalize rows into internal typed objects
- expose those objects to:
  - admin UI
  - page renderer
  - resolver layer

### Step 3: Update admin UIs to use DB-driven registries

Required targets:

- global theme preset UI
- section editor preset UI
- control visibility / capabilities

The admin must no longer depend primarily on hardcoded preset/capability maps.

### Step 4: Finish `card_grid` renderer realization

Required targets:

- token-to-class resolution
- divider behavior
- stronger service family
- clearer chrome behavior
- stronger visible response to surface/rhythm

### Step 5: Validate `Service Snapshot`

This is the immediate proof case.

Only after this is correct should you consider the design-system rollout successful.

### Step 6: Run regression QA across other section types

Verify:

- `steps_list`
- `label_value_list`
- `faq_list`
- `cta_block`
- composed sections

The goal is to confirm the system is general, not just patched for `card_grid`.

---

## Data and migration requirements

### Required migration discipline

All live DB tables used by the new design system must exist in tracked migrations inside the repo.

This is critical.

The current live DB appears to have the new v7 registry tables, but the migration folder in the repo does not clearly show matching tracked migration files.

That is deployment risk and must be corrected.

### Required action

Create explicit migration files for:

- `design_theme_presets`
- `section_presentation_presets`
- `component_family_presets`
- `section_preset_registry`
- `section_control_capabilities`

Include:

- schema
- indexes
- policies if required
- system seed data

Do not leave the production schema ahead of source control.

---

## Acceptance criteria

This work is only complete when all of the following are true.

### Architecture

- DB-backed registries are the primary source of truth
- code constants are fallback only, or removed if no longer necessary
- admin and runtime resolve the same preset/capability data model

### Editor behavior

- section preset options come from the DB-backed registry path
- theme preset options come from the DB-backed registry path
- capability visibility is based on the active capability data source, not stale hardcoded lists

### Renderer behavior

- `card_grid` fully supports all declared controls
- `dividerMode` is visibly implemented for `card_grid`
- `service` family is visually distinct and strong
- `Service Snapshot` clearly differs from `Core Outcomes`

### Source-of-truth hygiene

- required migration files exist in the repo
- the live DB schema is reproducible from source control

### Visual proof

On the live homepage, a reviewer should be able to say:

- `Core Outcomes` reads as proof/outcome cards
- `Service Snapshot` reads as service/offer cards
- the difference is deliberate, strong, and system-driven

If not, do not close the task.

---

## Final instruction

Do not optimize for “mostly working.”

Optimize for:

- one coherent design-system architecture
- one coherent source of truth
- one visible proof case that clearly demonstrates the system is real

If needed, simplify the architecture in code, but do not leave it split between:

- DB tables
- code presets
- legacy templates
- partial renderer support

That split architecture is the exact problem we are trying to end.

