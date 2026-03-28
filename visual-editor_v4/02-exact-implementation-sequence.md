# 02 Exact Implementation Sequence

This is the required build order. Do not reorder it.

## Step 1 Remove The Wrong Interaction Model

Deprecate the current bottom overlay edit bar.

Target file:

- `components/admin/visual-editor/page-visual-editor-inline-edit.tsx`

Required action:

- stop mounting the bottom chip/input bar as the main editing UI
- do not replace it with another floating strip

## Step 2 Add A Shared Visual Editing Context

Create a provider that is active only inside the admin visual preview.

Recommended new files:

- `components/landing/visual-editing-context.tsx`
- `components/landing/editable-text-slot.tsx`
- `components/landing/editable-link-slot.tsx`

Reason:

- landing section components can consume these primitives safely
- public frontend rendering remains unchanged when no provider is mounted
- the visual editor gets direct control without forking the renderer

The provider must expose:

- current `sectionId`
- selected field path
- editing field path
- start field focus
- start edit
- update draft path
- commit edit
- cancel edit
- open link editor
- close link editor

## Step 3 Mount The Provider Inside `SectionPreview`

Target file:

- `components/admin/section-preview.tsx`

Required action:

- wrap the admin preview tree in the visual-editing provider
- pass adapter callbacks that read/write the existing dirty draft in the visual editor store
- do not change the public-page renderer

Important:

- `SectionPreview` remains the admin-only integration point
- public frontend code must not mount the provider

## Step 4 Replace Raw Text Render Sites With Slot Components

This is the critical step.

In each built-in landing section component, replace direct plain-text render sites with `EditableTextSlot` or `EditableLinkSlot`.

Pattern:

- frontend mode: render normal text/link with zero behavior change
- admin visual mode, not editing: render the same text with a subtle editable affordance and field metadata
- admin visual mode, editing: render the actual in-place editor in that same location

Do not render separate floating inputs unless they are anchored as the actual in-place editing surface over the same text box.

Preferred implementation:

- `EditableTextSlot` renders the final element itself via `as="p" | "h1" | "h2" | "span" | "button"`
- in non-edit mode it renders that element with the original text
- in edit mode it swaps to an input or autosize textarea with matched layout classes

This is better than wrapping an existing `h1` with an input overlay.

## Step 5 Use Explicit Field Paths

Every editable field must have an explicit path string.

Examples:

- `meta.title`
- `meta.subtitle`
- `content.eyebrow`
- `meta.ctaPrimaryLabel`
- `meta.ctaPrimaryHref`
- `content.cards.0.title`
- `content.cards.0.text`
- `content.steps.1.body`
- `content.items.2.question`
- `content.testimonial.quote`

Use positional paths for array items. The current CMS model is positional already, so do not invent synthetic IDs.

## Step 6 Build The In-Place Text Editor Component

Create one generic controlled component for visible text editing.

Recommended new file:

- `components/admin/visual-editor/page-visual-editor-inline-field.tsx`

Requirements:

- supports single-line and multiline modes
- auto-focus on entry
- preserves width and alignment
- auto-resizes for multiline fields
- commits/cancels cleanly
- stops propagation so section selection and drag do not trigger

Do not let each section reinvent this logic.

## Step 7 Build The CTA Link Editing Popover

Create an anchored popover for CTA destinations.

Recommended new file:

- `components/admin/visual-editor/page-visual-editor-link-popover.tsx`

Requirements:

- anchored to the selected CTA/button
- shows current destination clearly
- supports the same internal page, anchor, and external URL workflows as the form editor
- updates `meta.ctaPrimaryHref` or `meta.ctaSecondaryHref` directly
- can be opened by clicking a small link affordance on the CTA or by `Mod+K` when the CTA is focused

Do not ship a plain text input as the only link editing control.

## Step 8 Sync Inspector And Canvas Editing

The inspector and in-place editor must update the same draft state.

Required rule:

- there is one dirty draft per section
- in-place editing and inspector editing both mutate that same draft
- whichever surface edits the field, the other surface reflects it immediately

Do not create separate “canvas draft” and “inspector draft” states.

## Step 9 Disable Conflicting Interactions During Edit

When a field is in edit mode:

- spacing handles are hidden or inert
- reorder drag is disabled for that section
- section-level click handlers do not steal focus
- keyboard shortcuts respect the active field editor first

Without this, the UX will feel unstable.

## Step 10 Keep The Visual Editing Surface Strictly Truthful

The edited field must still be rendered through the same section layout and typography system.

That means:

- same heading classes
- same subtitle classes
- same button chrome
- same layout constraints

Do not replace in-place editing with generic admin-styled inputs that break the visual truth of the canvas.
