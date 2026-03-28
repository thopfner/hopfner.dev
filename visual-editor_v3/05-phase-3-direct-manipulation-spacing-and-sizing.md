# 05 Phase 3 Direct Manipulation Spacing and Sizing

This phase adds the missing "visual" part of the editor in a disciplined way.

## Phase Goal

Let admins adjust spacing and sizing directly on the canvas, while still writing only the existing design-variable values.

## Core Rule

No freeform styling.

Every drag, slider, or handle interaction must resolve back to an allowed stored value that already exists in the CMS contract.

## What Direct Manipulation Should Control

### Section spacing

- top spacing
- bottom spacing
- outer spacing
- inner content spacing / padding

### Section sizing

- max width
- width mode
- hero minimum height
- grid gap where supported

### Optional Later Within This Phase

- alignment toggles surfaced adjacent to the relevant visual region
- shadow intensity only where it is already tokenized or numerically supported

## Recommended Interaction Model

Use visible but disciplined handles:

- top and bottom spacing rails on selected section bounds
- width handles or width rail for content container
- hero height handle for supported hero sections
- token-snapped slider popovers for spacing/gap controls

The admin should see cause and effect directly on the canvas.

## Snapping Requirement

All manipulation must snap to the existing enumerated options.

Examples:

- `spacingTop` and `spacingBottom` values from the existing select datasets
- `outerSpacing` values from the existing allowed options
- `paddingY`, `maxWidth`, `widthMode`, `heroMinHeight`, and `gridGap` from their current option lists

Do not invent new pixel values or hidden nonstandard tokens.

## Dual Control Requirement

Each direct-manipulation control should have both:

- canvas interaction
- exact inspector representation

This preserves precision, accessibility, and auditability.

## UX Recommendations

- show handles only on selected section to keep the canvas clean
- show current token label while dragging
- preview changes live during drag
- commit on release
- support keyboard nudging across the same discrete scale
- expose reset-to-inherited or clear-override action where relevant

## Implementation Recommendation

Represent these manipulations as transforms over option arrays, not CSS math.

Example:

- if the user drags downward on bottom spacing, move to the next allowed token in the `spacingBottom` scale
- if the user drags inward on width, move through the allowed `maxWidth` scale

This keeps behavior deterministic and contract-safe.

## Acceptance Criteria

- the current visual-editor gap around spacing controls is closed
- admins can adjust spacing and sizing directly on canvas for supported sections
- every manipulated value maps back to the existing stored field values
- changes remain truthful in the preview because the preview uses the same renderer contract
- no new style values appear in persisted payloads

## Release Warning

If a direct-manipulation interaction cannot map cleanly to a stored semantic value, do not ship it in this phase.

Elite quality here means disciplined power, not uncontrolled freedom.
