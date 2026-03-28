# 04 Phase 3 Token Inspector and Section Interop

This phase turns the visual shell into a real editor by mapping the selected section to existing formatting variables and current save/publish behavior.

## Phase Goal

Enable visual editing of existing design variables only, with persistence through the current draft/version pipeline.

## Core Rule

The visual editor writes only current CMS fields.

## Likely File Touchpoints

Primary new files:

- `components/admin/visual-editor/page-visual-editor-inspector.tsx`
- `components/admin/visual-editor/page-visual-editor-actions.tsx`
- `components/admin/visual-editor/use-visual-section-session.ts`
- `components/admin/visual-editor/use-visual-section-persistence.ts`
- `components/admin/visual-editor/visual-editor-formatting-adapter.ts`

Primary existing helpers to reuse:

- `components/admin/formatting-controls.tsx`
- `components/admin/section-editor/payload.ts`
- `components/admin/section-editor/types.ts`
- `components/admin/section-editor/builtin-editor-contract.ts`
- `components/admin/section-editor/use-section-editor-resources.ts`
- `lib/design-system/loaders.ts`
- `lib/design-system/capabilities.ts`

Avoid modifying current save/publish functions in-place. Prefer additive wrapper hooks in the visual editor namespace.

For v1, the inspector may change:

- `sectionPresetKey`
- `sectionRhythm`
- `sectionSurface`
- `contentDensity`
- `gridGap`
- `headingTreatment`
- `labelStyle`
- `subtitleSize`
- `dividerMode`
- `cardFamily`
- `cardChrome`
- `accentRule`
- existing layout/container fields already in `FormattingState`
  - `paddingY`
  - `outerSpacing`
  - `spacingTop`
  - `spacingBottom`
  - `maxWidth`
  - `textAlign`
  - `heroRightAlign`
  - `widthMode`
  - `heroMinHeight`
  - `shadowMode`
  - `innerShadowMode`
  - `innerShadowStrength`
  - `containerClass`
  - `sectionClass`
  - `mobile.*`

It must not write new keys.

## Control Gating

The inspector must be capability-aware.

Use:

- `loadCapabilitiesFromClient`
- `section_control_capabilities`
- `builtin-editor-contract.ts` for built-in shared field truth

Behavior:

- hide unsupported controls
- disable unsupported controls with explanation when helpful
- do not expose dead controls just because they exist in a generic UI component

## Preset Behavior

Use current DB registries and current resolver expectations.

### Section Presets

Source:

- `section_preset_registry`
- `section_presentation_presets`
- `component_family_presets`

Behavior:

- allow selecting existing presets valid for the section type
- surface preset name and description
- allow overriding individual fields after preset application
- display which fields are preset-derived vs explicitly overridden if feasible

### Site Theme Tokens

Source:

- `site_formatting_settings.settings.tokens`
- `design_theme_presets.tokens`

Behavior in v1:

- apply them to the preview
- show current theme context in the toolbar or inspector
- do not turn the page visual editor into a site-theme editor

Site theme editing remains in the existing global/theme admin area for v1.

## Interop With Existing Form Editor

The visual editor is parallel, not replacement.

For every selected section, provide:

- `Open form editor`
- `Save draft`
- `Publish`
- `Discard visual changes`

Recommended behavior:

- style and structure changes happen in the visual editor
- complex content editing still routes to the existing form drawer in v1

This is not a weakness. It is the correct no-regression boundary for the first release.

## Persistence Model

### Recommended Implementation Path

Build a small additive adapter around current section draft semantics.

The adapter should:

- derive the selected section's effective draft
- normalize formatting with current helper logic
- convert back through current payload helpers
- call current version-save semantics

Preferred reuse:

- `payload.ts` helpers
- `FormattingState`
- current class validation
- current publish RPCs

Avoid:

- copying business rules without tests
- inventing a second draft serialization path

Recommended adapter boundary:

- visual editor local section state
- current payload helpers
- existing Supabase draft/version writes
- existing publish RPC calls

Do not allow Craft event handlers to write directly to Supabase without passing through the typed adapter layer.

## Save and Publish Behavior

For the selected local section:

- save draft creates a new draft version exactly like the current editor
- publish uses the existing publish RPC
- restore and delete draft remain available only if the UX is clear; otherwise leave them in the form editor for v1

For page order:

- persist through the existing section row ordering model
- do not bundle reorder into section version payloads

## Global Section Interop

For global sections selected on the page canvas:

- show exact source label
- show impact warning
- disable direct style mutation
- CTA to open:
  - existing global editor now
  - dedicated global visual editor later

Optional safe enhancement:

- allow `detach_global_section_to_local` only through an explicit guarded action with confirmation, matching current semantics

Do not auto-detach.

## Content Editing Boundary

V1 visual editor should not attempt to fully replace current content forms.

Recommended v1 content policy:

- render live content faithfully
- allow limited meta-field edits only if already trivial and safe
- route complex content edits to current form editor

Examples of content that should stay in the existing form editor for v1:

- card arrays
- steps arrays
- FAQ arrays
- rich text bodies
- proof/testimonial structures
- booking intake field objects
- composed section schema blocks

## Acceptance Criteria

- selecting a local built-in section exposes only truthful current controls
- edits update the live preview immediately
- save draft writes the same payload shape as the current editor
- publish produces the same frontend output as current editing flows
- no new formatting keys appear in persisted JSON
- global sections cannot be accidentally mutated from the page route

## Test Requirements

Add at least:

- formatting inspector to `FormattingState` mapping tests
- preset application and override tests
- unsupported-control gating tests
- save-draft adapter tests
- publish adapter tests
- global-section lock tests

## Phase Risk Gates

Do not move to rollout until:

- persisted formatting matches current schema exactly
- published output matches current renderer expectations
- the user can always fall back to the current form editor
