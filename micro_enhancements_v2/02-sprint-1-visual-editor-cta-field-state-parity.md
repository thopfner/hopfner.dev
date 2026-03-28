# Sprint 1: Visual Editor CTA Field-State Parity

## Goal

Make the visual editor behave like the form editor when a CTA is hidden:
- toggle stays visible
- label/link values are preserved
- label/link inputs become disabled and visually subdued

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-inspector.tsx`
2. `/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-global-section-panel.tsx`

## Source Workflows / Files To Reuse

Reuse the field-state behavior from:
- `/var/www/html/hopfner.dev-main/components/admin/section-editor/common-fields-panel.tsx`

Use the existing CTA visibility helpers already in place:
- `/var/www/html/hopfner.dev-main/lib/cms/cta-visibility.ts`

## Step-By-Step Implementation

### Step 1

In `page-visual-editor-inspector.tsx`, extend `InspectorInput` to accept `disabled?: boolean`.

Required implementation:
- pass the `disabled` attribute to the underlying `<input>` / `<textarea>`
- add disabled styling so the control reads as inactive
- keep the base layout and sizing identical

Do not change the input component signature more than necessary.

### Step 2

In the `Actions` section of `page-visual-editor-inspector.tsx`:
- compute `priEnabled` and `secEnabled` exactly as today
- when `canTogglePri` is true and `priEnabled` is false, disable the primary CTA label/link inputs
- when `canToggleSec` is true and `secEnabled` is false, disable the secondary CTA label/link inputs

If a CTA does not support toggling for that section type, keep the inputs behaving exactly as they do now.

### Step 3

In `page-visual-editor-global-section-panel.tsx`, extend `GInput` to accept `disabled?: boolean` and apply the same inactive treatment.

Do not create a new shared component for this batch. Keep the change local.

### Step 4

Thread disabled state into:
- `NavLinksContent` header CTA label/link inputs
- `FooterGridContent` per-card CTA 1 label/link inputs
- `FooterGridContent` per-card CTA 2 label/link inputs

The toggle remains interactive. Only the dependent fields become disabled.

### Step 5

Verify there is no value clearing logic tied to toggling off.

Do not add any clearing behavior. Hidden CTAs must preserve their current label/link data.

## Required Behavior

- Toggling `Show primary CTA` off disables the primary CTA label/link inputs.
- Toggling `Show secondary CTA` off disables the secondary CTA label/link inputs.
- Toggling back on restores the existing values and editability.
- Visual editor behavior matches the form editor expectation for hidden CTA controls.

## What Must Not Change In This Sprint

- no frontend CTA rendering logic
- no persistence schema changes
- no CTA helper contract changes
- no footer subscribe changes yet

## Required Tests For This Sprint

Add rendered tests that prove:
- disabled state in the visual inspector when a shared CTA is hidden
- disabled state in the global panel when header CTA is hidden
- disabled state in the global panel when a footer card CTA is hidden
- toggling back on re-enables the same fields without losing prior values

These tests must render UI, not inspect source strings.

## Gate For Moving Forward

Do not proceed until:
- all hidden CTA inputs are disabled in both visual-editor surfaces
- rendered tests for these interactions pass
