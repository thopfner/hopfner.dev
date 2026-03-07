# SQL Migration And Rollout Plan

## Goal

Introduce a durable persistence model for design-system tokens and presets without breaking the existing CMS.

## Migration strategy

Use additive migrations.

Do not break existing `formatting` JSON consumers immediately.

## Phase 1: Add registries

Add new tables for:

- `design_theme_presets`
- `section_presentation_presets`
- `component_family_presets`
- `section_preset_registry`
- `section_control_capabilities`

Use:

- `key text unique not null`
- `name text not null`
- `description text`
- `is_system boolean default true`
- `tokens jsonb not null default '{}'::jsonb`
- timestamps

## Phase 2: Seed system presets

Seed at least:

- theme presets:
  - `obsidian_operator`
  - `executive_slate`
  - `signal_grid`
- presentation presets:
  - `hero_stage`
  - `services_snapshot`
  - `proof_grid`
  - `trust_strip`
  - `process_flow`
  - `cta_close`
- component family presets:
  - `service`
  - `proof`
  - `metric`
  - `process`
  - `logo_tile`
  - `cta`

## Phase 3: Add optional preset references to existing formatting payloads

Preferred direction:

- continue storing `formatting jsonb`
- add preset keys inside the JSON structure rather than immediate schema expansion

This is lower-risk and easier to roll out.

## Phase 4: Update defaults and blueprint content

Update:

- section type defaults
- homepage blueprint/default content

so they reference system presets instead of relying on scattered formatting combinations.

## Phase 5: Backfill key sections

Backfill the homepage sections, starting with:

1. `service-snapshot`
2. `core-outcomes`
3. `how-engagements-work`
4. `trust-proof`
5. `final-cta`

## Rollout rule

Do not migrate every section manually before the resolver exists.

Build:

1. token registries
2. resolver
3. admin capability matrix
4. renderer support

Then backfill section presets.

## Required safeguards

- keep backward compatibility for legacy formatting JSON
- treat direct per-field formatting as fallback
- make preset-based formatting take precedence when present
- add clear seed ids/keys so future migrations can upsert safely

