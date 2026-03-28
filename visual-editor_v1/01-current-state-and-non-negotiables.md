# 01 Current State and Non-Negotiables

This file is the baseline contract for the coding agent. Do not start implementation without accepting every constraint in this document.

## Objective

Ship a parallel admin-only visual editor without regressing:

- public rendering
- existing form-based editing
- draft/publish semantics
- global section behavior
- section version validation

## Verified Current System

### Public Rendering

Primary files:

- `app/(marketing)/[slug]/page.tsx`
- `lib/cms/get-published-page.ts`
- `components/landing/*`
- `components/landing/composed-section.tsx`
- `lib/design-system/resolve.ts`
- `lib/design-system/tokens.ts`

The live page renderer consumes merged page and section data, resolves allowed design tokens, and dispatches to built-in section components or the composed renderer.

### Admin Editing

Primary files:

- `app/admin/(protected)/pages/[pageId]/page-editor.tsx`
- `components/admin/section-editor/section-editor-drawer-shell.tsx`
- `components/admin/section-editor/use-section-editor-resources.ts`
- `components/admin/section-editor/use-section-editor-session.ts`
- `components/admin/section-editor/payload.ts`
- `components/admin/formatting-controls.tsx`
- `components/admin/section-preview.tsx`

Key reality:

- the page editor manages list-level page section operations
- the section editor manages per-section versioning and save/publish
- the preview stack is already admin-only and additive
- global sections use a separate page and flow

### Data Contract

Canonical persisted objects:

- section row
- page row
- published section version
- draft section version
- global section row
- published global section version
- site formatting settings
- section presentation presets
- component family presets
- theme presets

Canonical draft shape in admin:

- `EditorDraft.meta`
- `EditorDraft.formatting`
- `EditorDraft.content`

Canonical formatting shape:

- `FormattingState` from `components/admin/formatting-controls.tsx`

The visual editor must write back into that same shape.

## Non-Negotiable Rules

### 1. No Public Renderer Changes

Do not change:

- the merge order in `app/(marketing)/[slug]/page.tsx`
- `resolveSectionUi` semantics
- landing section component props or token expectations
- frontend-only renderer logic to accommodate the visual editor

The visual editor must adapt to the frontend contract, not the other way around.

### 2. No New Persisted Visual Schema

Do not:

- add `craft_state` columns
- store serialized Craft trees in version rows
- create a second competing section formatting model
- introduce a new admin-only style schema that later needs translation

Craft state is ephemeral UI state only.

### 3. Do Not Rewrite Existing Editing Functions

For v1:

- do not replace `SectionEditorDrawerShell`
- do not replace `useSectionEditorResources`
- do not replace the current page editor route
- do not refactor existing save/publish behavior unless the change is strictly additive and backed by tests

Reuse current behavior where possible. Mirror it where necessary. Do not destabilize it.

### 4. Only Existing Design Variables In v1

Allowed write targets:

- existing `FormattingState` keys
- existing presentation presets
- existing component family presets
- existing section preset selection
- existing section ordering in `sections.position`

Not allowed in v1:

- arbitrary spacing controls beyond current schema
- arbitrary class-name construction
- new style tokens
- new layout primitives
- new CMS capabilities

### 5. Global Section Safety Is Mandatory

If a section is linked to `global_sections`:

- page visual editor must not silently mutate the global draft
- page visual editor must not pretend it is editing a local section
- the UI must clearly label the node as global and locked
- any mutation path must route the user intentionally to the appropriate existing editor or a future dedicated global visual editor

### 6. Dirty Repository Hygiene

The repository is already dirty. The agent must:

- read before editing
- avoid reverting unrelated work
- avoid "cleanup" refactors
- isolate changes to new visual-editor files and minimal additive integration points

## Confirmed Storage Model

### Section and Page Formatting

Stored in JSONB:

- `section_versions.formatting`
- `global_section_versions.formatting`
- `sections.formatting_override`
- `pages.formatting_override`

### Site Theme / Design Tokens

Stored in JSONB:

- `site_formatting_settings.settings`
- nested token object under `site_formatting_settings.settings.tokens`
- `design_theme_presets.tokens`

### Section Presentation / Component Presets

Stored in JSONB:

- `section_presentation_presets.tokens`
- `component_family_presets.tokens`

Mapped through:

- `section_preset_registry`

### Custom Section Schemas

Stored in JSONB:

- `section_type_registry.composer_schema`

### Capability Matrix

Stored in normalized booleans:

- `section_control_capabilities`

With code fallback in:

- `lib/design-system/capabilities.ts`

## Merge and Validation Invariants

### Merge Invariant

Every preview and editor adapter must respect current merge order:

1. site settings
2. section defaults
3. row override
4. version formatting

### Validation Invariant

Every save path must still pass through:

- Tailwind whitelist validation in current admin save logic
- `validate_section_version_payload` on publish/restore flows

### Capability Invariant

The visual editor must use:

- `section_control_capabilities` and `loadCapabilitiesFromClient`
- built-in meta field truth contract from `builtin-editor-contract.ts`

Do not expose controls the renderer does not honor.

## Required Product Behavior For v1

- visual editor is a separate route, not a rewrite of the current page editor
- the current form editor remains available at all times
- selection is explicit
- save state is explicit
- unsupported states are explicit
- global nodes are explicit
- content-edit fallback is explicit
- publish remains explicit

## Required Technical Behavior For v1

- no DB migration required to ship the first version
- no frontend runtime changes
- no service-role dependency for normal visual editor authoring
- same auth and RLS posture as current admin editing
- same section version history semantics
- same published output after save/publish

## Exit Criteria For This Baseline

The coding agent can proceed only after confirming:

- the implementation will be additive
- Craft is UI-only and not storage truth
- existing formatting JSON remains canonical
- the page visual editor will not write unsupported tokens
- global sections are locked or redirected in v1
