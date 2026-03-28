# 03 Phase 1 Full Control Surface Parity

This phase closes the control gap with the form editor.

## Phase Goal

Make the visual editor capable of editing the same important content and formatting state as the form editor, without requiring admins to bounce back for common tasks.

## Scope

Bring the following into the visual editor:

- all shared meta fields
- all CTA fields
- all background-media fields
- all existing formatting groups
- all supported section presets
- all section-specific content panels that are part of the normal authoring path

## Required Parity Groups

### Content

- title
- subtitle
- eyebrow or equivalent label fields
- CTA primary label
- CTA primary href
- CTA secondary label
- CTA secondary href
- background media URL and picker flow

### Formatting

- presentation tokens
- component tokens
- advanced spacing
- low-level overrides
- section preset application
- hero-specific layout controls
- shadow and inner-shadow controls

### Section Data

For section-specific arrays and item collections:

- card titles and descriptions
- steps titles and body copy
- FAQ question and answer content
- testimonial/proof text where present
- booking or CTA copy fields that affect visible rendering

## UX Recommendation

Do not simply clone the form editor panel stack into the visual editor.

Reorganize the visual editor into a clearer structure:

- `Content`
- `Actions`
- `Style`
- `Layout`
- `Advanced`

This is a better mental model for visual editing than "meta + formatting + misc".

## Shared Component Strategy

Where possible, extract shared field controls so both editors use the same:

- validation
- option lists
- link-picker behavior
- media-picker behavior
- formatting-option semantics

But do not force a brittle deep refactor. Shared pure controls and adapters are preferable to merging entire editors.

## Fallback Rule

The form editor can remain available, but it should no longer be the primary workaround for missing common fields.

The visual editor should still be allowed to hand off rare complex cases, but that handoff must become the exception rather than the norm.

## Acceptance Criteria

- the QA findings about missing formatting controls are resolved
- CTA and background-media editing are present in the visual editor
- section-specific content coverage is materially expanded
- the visual editor can handle the normal authoring path for representative page types
- parity is proven by tests or an explicit field registry, not assumed

## Release Warning

Do not move into "premium interactions" work before this parity phase is substantially complete.

A premium shell around incomplete editing coverage will create the wrong impression and slow down replacement-readiness.
