# Visual Editor v1 Plan

This bundle is the implementation brief for a parallel Craft.js visual editor in the admin backend of `hopfner.dev`.

It is written against the current live codebase and database shape at `/var/www/html/hopfner.dev-main`. It assumes the coding agent is working in a dirty repository and must not revert unrelated user changes.

## What Was Verified

- The app is a single Next.js codebase serving both public pages and admin.
- Public rendering is driven by `app/(marketing)/[slug]/page.tsx` plus `lib/cms/get-published-page.ts`.
- The current admin section editor persists drafts and published versions through `components/admin/section-editor/use-section-editor-resources.ts`.
- The admin preview path already renders real landing components through `components/admin/section-preview.tsx`.
- Formatting, content, site theme tokens, presets, and composer schemas are stored in PostgreSQL `jsonb`.
- Section semantic control support is stored both in code fallbacks and in the normalized `section_control_capabilities` table.

## Database Reality

The user assumption was correct: most design and formatting state is stored as JSON blobs.

### JSONB Storage

- `section_type_defaults.default_formatting`
- `section_type_defaults.default_content`
- `section_type_defaults.capabilities`
- `section_versions.formatting`
- `section_versions.content`
- `global_section_versions.formatting`
- `global_section_versions.content`
- `sections.formatting_override`
- `pages.formatting_override`
- `site_formatting_settings.settings`
- `design_theme_presets.tokens`
- `section_presentation_presets.tokens`
- `component_family_presets.tokens`
- `section_type_registry.composer_schema`
- `formatting_templates.settings`

### Normalized Tables That Matter

- `pages`
- `sections`
- `section_versions`
- `global_sections`
- `global_section_versions`
- `section_type_defaults`
- `section_type_registry`
- `tailwind_class_whitelist`
- `site_formatting_settings`
- `design_theme_presets`
- `section_presentation_presets`
- `component_family_presets`
- `section_preset_registry`
- `section_control_capabilities`

### RPCs / DB Behaviors That Must Remain Untouched

- `publish_section_version`
- `restore_section_version`
- `publish_global_section_version`
- `rollback_global_section_to_version`
- `detach_global_section_to_local`
- `global_section_impact_preview`
- `bootstrap_make_admin`
- `validate_section_version_payload`

## Frontend Mapping Reality

The current frontend render contract is the non-negotiable source of truth.

### Published Page Assembly

`lib/cms/get-published-page.ts` loads:

- page row
- enabled sections
- published local section versions
- published global section versions
- section defaults
- Tailwind whitelist
- site formatting settings
- custom composed section schemas

### Merge Order

For section formatting in `app/(marketing)/[slug]/page.tsx`:

1. site-level base formatting
2. section type default formatting
3. section row `formatting_override`
4. published version `formatting`

For section content:

1. section type default content
2. published version `content`

Then `resolveSectionUi` validates and resolves semantic design tokens into renderer-consumable UI props.

## Core Decision

The visual editor must be an additive admin authoring layer over the existing CMS contract.

It must not introduce:

- a new persisted visual schema
- a Craft JSON storage model
- new frontend renderer logic
- new public page render paths
- refactors to existing save/publish functions before v1 proves stable

### The Safe Architecture

- Craft.js is used as the interaction shell, selection model, and drag/drop canvas.
- The canonical data model remains the existing admin draft model:
  - section meta fields
  - section `content`
  - section `formatting`
  - page section ordering
- Actual persistence continues to write the existing version rows and call the existing RPCs.
- Actual visual output continues to be generated from the current landing section components and design token resolver.

In short: Craft drives authoring, but not storage truth and not frontend truth.

## Recommended v1 Scope

The first release should be intentionally narrow to protect the current system while still shipping a serious editor.

### Included

- New admin-only page visual editor route
- Parallel access to the current form editor
- Page-level section canvas
- Drag/drop reordering of page sections
- Selection and inline inspection of existing section design variables
- Editing only existing formatting keys and preset choices
- Accurate preview using current renderer components
- Save draft and publish through existing section version flows
- Clear lock states for global sections
- Clear fallbacks to the current form editor for content-heavy edits

### Explicitly Excluded From v1

- New frontend rendering behaviors
- New database tables for the visual editor
- Persisting Craft node trees
- Arbitrary CSS editing outside current whitelist/token systems
- Freeform content block composition beyond current CMS schema
- Replacing the current form editor
- Deep global-section visual editing in the page route
- Large refactors inside `page-editor.tsx` or `SectionEditorDrawerShell`

## Why This Scope Is Correct

- It satisfies the request for a parallel visual editor.
- It keeps the first release mapped only to existing design variables.
- It avoids touching the current public rendering system.
- It avoids rewriting stable editor behavior in a dirty repository.
- It creates a stable base for a later true full-site visual CMS without forcing risky schema changes now.

## High-Risk Areas

- React 19 compatibility with Craft.js must be proven with an explicit dependency spike before integration work proceeds.
- The current repo is dirty on `main`; the agent must not assume a clean baseline.
- There is effectively no first-party test coverage beyond `tests/pages-list.create-modal.test.tsx`.
- Global sections and custom/composed sections require special handling and must not be rushed into v1 without parity coverage.

## Phase Index

- `01-current-state-and-non-negotiables.md`
- `02-phase-1-foundation-and-parallel-routing.md`
- `03-phase-2-craft-canvas-and-visual-shell.md`
- `04-phase-3-token-inspector-and-section-interop.md`
- `05-phase-4-persistence-parity-and-regression-qa.md`
- `06-phase-5-post-v1-expansion.md`

## Release Standard

This is not a "page builder MVP". The first release should feel premium in behavior, architecture, and author confidence.

That means:

- high preview fidelity
- explicit unsupported states
- safe fallbacks instead of hidden breakage
- zero hidden frontend contract drift
- visible dirty state and save state
- clear lock semantics for global content
- regression tests for the new adapter layer
- a rollback path that is trivial because the old editor remains intact
