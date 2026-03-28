# 04 Phase 2 Inline Text and Link Editing

This phase turns the visual editor into a true authoring surface rather than an inspector-first tool.

## Phase Goal

Enable direct editing of text-bearing fields and CTA links inside the visual workflow.

## Product Standard

Admins should be able to click visible text and edit it where it appears, with minimal mode friction.

The target is not unrestricted `contentEditable` everywhere. The target is controlled, reliable inline editing that writes back to the existing payload model.

## Required Coverage

At minimum, inline editing should cover:

- titles
- subtitles
- eyebrow/label text
- CTA button labels
- card titles
- card descriptions where represented as plain text
- step titles and body copy
- FAQ questions and answers
- testimonial or proof quotes when represented as strings

## Link Editing Standard

CTA links should be editable directly from the visual workflow via:

- anchored popover or side drawer
- same page/link/anchor picker capabilities as the form editor
- visibility of current target type
- clear validation for internal vs external destinations

The user should not need to leave the visual editor to change button label plus destination together.

## Recommended Interaction Model

Use a two-state model:

- `select state`
  Section or subfield is selected, handles are visible.

- `edit state`
  The selected text field becomes directly editable with focused controls and commit/cancel behavior.

This reduces accidental text mutation during navigation and drag operations.

## Important Technical Rule

Avoid naive global `contentEditable` as the core strategy.

Prefer controlled inline editor surfaces that:

- know the payload path they are editing
- can sanitize and validate input
- can preserve undo/redo behavior
- do not desynchronize React state from rendered text

## Subfield Mapping Requirement

Introduce visual field anchors for repeaters and nested content items.

Example:

- card grid item 2 title
- steps list item 3 description
- FAQ item 1 answer

Each visible text fragment that is editable should map back to a stable payload path.

## UI Recommendations

- click text to edit
- double-click or explicit edit affordance if single-click conflicts with selection
- hover affordance that signals editability without clutter
- inline toolbar or popover only where needed
- keyboard shortcuts for commit/cancel
- clear visual distinction between selected section and selected field

## Inspector Relationship

The inspector should remain available as:

- a secondary editing surface
- a place for bulk edits and exact values
- a safe fallback for long or structurally complex fields

Inline editing should complement the inspector, not remove it.

## Acceptance Criteria

- common visible text can be edited without using the form editor
- CTA labels and links can be edited within the visual workflow
- repeater item text fields are addressable and editable
- inline edits preserve the current payload semantics
- keyboard and mouse interactions are predictable

## Out Of Scope For This Phase

- full rich-text document authoring model redesign
- arbitrary embedded content blocks
- new frontend typography system

If richer text exists later, handle it as a targeted extension on top of the same field-anchor model.
