# v8 Large-Text Editing And Dirty-State Fix

These are the two highest-priority UX corrections.

## 1. Large Text Editing Must Stop Collapsing

## Current problem

The current text-edit slot still relies on the last measured inline/block rect and then swaps to an in-flow input/textarea.

That is not strong enough for large display text.

Symptoms:

- only the last words stay visible
- the editor surface feels narrower than the rendered text
- multiline authoring feels fragile

## Required solution

Move large-text editing from an in-flow replacement model to an anchored overlay editor model.

### Product requirement

When the user edits a headline, paragraph, or other large block:

- the edit surface must open over the same visual block
- it must show the full current content
- it must preserve the text width closely enough that line wraps remain understandable
- it must not collapse to a narrow last-line input

### Implementation direction

For multiline and large text surfaces:

- keep the rendered element in place for measurement
- capture its exact client rect
- render the actual editor as an anchored overlay textarea positioned to that rect
- clamp the overlay within the canvas viewport if necessary
- auto-size height from content
- keep typography, padding, line-height, and max-width consistent with the rendered block

Recommended rule:

- single-line compact labels may remain inline
- anything that is heading-sized, paragraph-sized, or multiline should use the overlay editor path

### File touchpoints

- `components/landing/editable-text-slot.tsx`
- optionally a new shared primitive such as `components/landing/editable-text-overlay.tsx`

## 2. Dirty State Must Only Represent Real Changes

## Current problem

The editor currently marks a section dirty even when the user only clicks into a field and exits without changing anything.

That is a trust problem.

## Required solution

The dirty-state system needs two guards:

### Guard A. Field-level no-op protection

When a field commit happens:

- compare the committed value with the current field value before writing
- if unchanged, close edit mode and do not call the update path

### Guard B. Draft-level semantic equality protection

At the draft/store layer:

- if a proposed new draft is semantically equal to the current effective draft, do nothing
- if a proposed new draft is semantically equal to the original draft, clear dirty state instead of setting it

This guard must exist even if the field-level guard exists.

Reason:

- spacing handles
- structured editors
- future controls

all need the same semantic protection.

### Required implementation detail

Do not rely on object identity.

Use deterministic semantic comparison of the draft payload.

Recommended options:

- a stable deep-equality helper
- or serialized normalized comparison if normalization is already guaranteed

### File touchpoints

- `components/landing/visual-editing-context.tsx`
- `components/landing/editable-text-slot.tsx`
- `components/admin/visual-editor/page-visual-editor-node.tsx`
- `components/admin/visual-editor/page-visual-editor.tsx`

## Acceptance

This file is complete only when:

- large text opens into a genuinely usable edit surface
- clicking in and out of unchanged text does not produce an unsaved state
- editing then restoring the exact original value clears dirty state cleanly
