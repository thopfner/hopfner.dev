# 01 v2 Decision and Target State

This file defines the architecture the coding agent should build toward.

## Target Outcome

Ship an elite SaaS-grade visual section editor that:

- stays parallel to the current form editor
- uses drag and drop to reorder sections
- uses a polished canvas for visual selection and editing
- maps only to existing CMS fields and existing design variables
- preserves the current frontend rendering contract
- does not require a new persisted editor schema

## Architecture Decision

### Use For v2

- `dnd-kit`
- current section-based admin state
- current `EditorDraft` / `VersionPayload` conversion helpers
- current landing-section preview components
- current publish/save RPCs and tables

### Do Not Use For v2

- `Craft.js`

### Why

The current problem is not "missing page-builder framework". The current problem is:

- broken persistence wiring
- incorrect database reads
- preview truthfulness gaps
- underpowered UI polish

Adding Craft.js now would increase risk without solving the current correctness problems first.

## Visual Editor Model

The visual editor remains a projection over existing CMS data.

### Canonical persisted model

- `sections`
- `section_versions`
- `global_sections`
- `global_section_versions`
- `pages`
- `section_type_defaults`
- `site_formatting_settings`
- design preset registries

### Canonical admin working model

- selected page
- ordered section ids
- selected section
- section-level dirty draft keyed by section id
- page-level reorder dirty state

### Explicit non-goal

Do not persist:

- drag state
- node state
- editor layout state
- serialized component trees

## What v2 Must Feel Like

The current build reads as an internal tool. v2 should feel like a serious product.

Required qualities:

- obvious hierarchy
- instant selection feedback
- high preview fidelity
- high trust in save/publish state
- meaningful drag affordances
- keyboard support
- clear local vs global ownership
- clean fallback path to form editing

## v2 Boundaries

### Allowed

- fix visual-editor route behavior
- fix loader and persistence code
- add additive shared helpers if required
- improve canvas and drag interaction
- improve structure rail and inspector UI
- add targeted tests
- hide or gate the route until ready

### Not Allowed

- frontend renderer contract changes
- new persisted visual-editor schema
- arbitrary token creation
- content-model redesign
- custom/composed full support by force
- large form-editor rewrites

## Immediate Priority Order

1. make the route safe
2. make reads and writes correct
3. make preview truthful
4. make drag and drop premium
5. prove regression safety

That order matters. Do not polish a broken contract.
