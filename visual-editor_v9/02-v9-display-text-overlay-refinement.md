# v9 Display-Text Overlay Refinement

This is the highest-priority v9 work.

## Problem

The latest overlay implementation is directionally correct, but it still has a usability flaw for very large headings and display blocks.

Likely causes:

- the textarea inherits the full live display typography
- the caret lands at the end of the text on focus
- the textarea can visually bias toward the last lines of the content
- the overlay width is tied to the rendered block without an edit-mode typography adjustment

This matches the user report that only the last couple of words feel visible/editable.

## Decision

Adopt an edit-mode display typography scale.

This is recommended.

## Required behavior

For oversized heading/display text in edit mode:

- render the editor in an anchored overlay
- reduce font size by one deliberate edit step relative to the live rendered size
- keep weight and line-height close enough to preserve meaning
- ensure the full text block is visible on open
- reset caret/scroll position so the user is not dropped into the last line

## Explicit implementation requirements

### 1. Add edit-mode typography mapping

Do not reuse the exact live display typography for very large headings.

Create a small, explicit mapping for edit mode.

Examples:

- display XL -> display LG
- display LG -> display MD
- large H2/H3 -> one step smaller

Use a mapping, not ad hoc style overrides.

This should only apply when:

- the field is using the overlay editor path
- and the text is clearly display-scale

Do not downsize normal paragraph editing unnecessarily.

### 2. Force top-of-text visibility on open

On overlay open:

- set the caret deliberately
- set `scrollTop = 0`
- ensure the textarea is showing the beginning of the content, not the tail

If the product choice is “select all on first open,” then still guarantee the visible region starts at the top.

### 3. Add viewport clamping

The overlay should not blindly use the raw rect if that creates a poor editing box.

Clamp overlay dimensions against viewport padding.

Recommended:

- preserve left/top anchor
- cap max height to a comfortable portion of viewport
- allow internal scroll only after the initial visible block is clearly readable

### 4. Improve overlay styling

The overlay should look intentional, not like a browser textarea dropped on top.

Recommended refinements:

- stronger surface/background contrast
- cleaner padding
- slightly softer ring/shadow
- preserve the content box shape of the original block

## File touchpoints

- `components/landing/editable-text-slot.tsx`
- optional shared helper if the edit-mode typography mapping deserves extraction

## Non-goals

- do not reintroduce bottom-bar editing
- do not move large-text edits back to the inspector
- do not overbuild a floating mini-toolbar for plain text

## Acceptance

This work is complete only when:

- the hero title can be opened and fully read comfortably in edit mode
- the overlay no longer feels biased toward the last lines
- the edit-mode typography feels intentionally optimized for editing
