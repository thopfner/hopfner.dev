# 04 Field Editor Sizing And Link UX Spec

This document defines the quality bar for editing surfaces.

## Problem To Solve

The current edit surface is too small for large wrapped text.

On the hero heading, the input surface can collapse into a cramped field that shows only part of the text clearly.

That is not elite and it breaks the value of in-place editing.

## Required Sizing Model

The edit surface must inherit the rendered field box, not invent a tiny replacement box.

### Required Behavior On Edit Start

When a field enters edit mode:

- measure the rendered element box
- capture:
  - width
  - min height
  - line height
  - text alignment
  - font family
  - font size
  - font weight
  - letter spacing
  - padding if relevant

- render the edit surface in the same location with at least that measured width and height

## Editor Mode Rules

### Use Block Autosize Editor For These

- headings
- subtitles
- paragraph blocks
- card descriptions
- step bodies
- FAQ answers
- testimonial quote
- any visible text likely to wrap

Required element:

- autosizing `textarea`

Reason:

- a single-line input is the wrong control for wrapped display text

### Use Single-Line Editor Only For These

- micro labels
- short nav labels
- short CTA labels
- short stat labels where wrapping is not expected

Even here, the editor must still preserve visible width rather than collapsing to a minimal field.

## Required Autosize Technique

Do not rely on `fieldSizing: content` alone.

Implement:

- a hidden measurement mirror element using the same typography classes
- or a resize strategy based on the current rendered element rect plus content measurement

The result must:

- keep the whole heading readable
- grow naturally as text changes
- maintain wrapping behavior

## Required Hero Heading Fix

For the hero title specifically:

- treat it as a block autosize editor
- preserve the current heading width and wrap behavior
- do not use a single-line `<input>`
- do not reduce the title to a narrow text-entry strip

## CTA Link UX Spec

The current raw-URL popover is below standard.

Replace it with a proper anchored CMS link editor.

### Required Features

- anchored to the CTA being edited
- current destination type shown clearly
- internal page selection
- anchor selection when relevant
- external URL entry
- clear apply/cancel behavior

### Reuse Requirement

Reuse existing form-editor link workflow rather than inventing a second link system.

Relevant existing surfaces:

- `components/admin/section-editor/fields/link-menu-field.tsx`
- page and anchor loading logic already used by the form editor

### UX Rule

The CTA label and CTA destination must feel like one editing flow.

Expected behavior:

- click CTA text to edit label
- click CTA link affordance to edit destination
- stay anchored to the button while doing both

## Focus And Conflict Rules

While any field is editing:

- section drag is disabled
- spacing handles are hidden or inert
- section selection does not steal focus
- keyboard shortcuts first respect the active field editor

## Anti-Patterns To Avoid

- single-line input for wrapped display headings
- tiny inline field that only shows the tail end of the text
- detached floating modal for CTA link editing
- raw URL text box as the primary CMS link workflow
