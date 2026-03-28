# v6 Ship Bar And Rules

## Objective

Finish the current in-place editing system so it behaves like a premium production visual CMS editor across all built-in sections already rendered in the admin canvas.

This is a parity-and-quality completion pass.

It is not:

- a new layout feature pass
- a form-editor replacement migration
- a frontend renderer rewrite
- a custom-section/composed-section project

## Definition Of Done

v6 is only complete when all five conditions are true:

1. `Built-in coverage is complete`
   Every built-in section rendered through `SectionPreview` has full on-canvas editing parity for visible plain-text fields and link destinations.

2. `Rich text is no longer a dead surface`
   Every HTML-backed text block has a field-anchored visual editing affordance in the canvas.

3. `Large text edits correctly`
   Hero headlines and other wrapped blocks edit inside their real rendered footprint, not inside a tiny overlay.

4. `Link editing is CMS-grade`
   Visual editor link editing uses the same page/anchor/custom semantics as the form editor.

5. `Public rendering is unchanged`
   When the visual-editing provider is absent, the public site renders exactly as before.

## Hard Rules

### 1. No selective completion

Do not wire one or two fields in a section and then move on.

A section is only `done` when:

- all visible plain-text fields are editable
- all visible link labels are editable
- all visible link destinations are editable
- HTML-backed text is reachable through an anchored editor
- repeated items are individually editable

### 2. No visual-editor-only renderer forks

Do not create admin-only copies of landing sections.

Allowed:

- shared slot primitives
- admin-only provider/context
- admin-only visual fallbacks for animation, ticker, or hidden metadata surfaces

Not allowed:

- duplicate section trees just for editing
- alternate payload shapes
- alternate formatting merge logic

### 3. No raw URL editing widgets

The current custom link popover is not sufficient.

The visual editor must reuse the same semantic link model as the form editor:

- this page anchor
- another page top
- another page section
- custom URL
- clear link

### 4. No dead rich-text blocks

If a section renders `bodyHtml`, `answerHtml`, `narrativeHtml`, or equivalent rich text, the visual editor must expose an anchored edit experience for that block.

Do not flatten structured rich text to plain text just to make the visual editor easier to implement.

### 5. Editing mode beats motion mode

When visual editing is active:

- animated counters must become stable editable text surfaces
- marquees must become stable editable rows or tiles
- hidden metadata attached to image-only surfaces must get a visible hotspot

The canvas is an authoring tool first.

## Explicit Scope

In scope:

- built-in sections rendered by `components/admin/section-preview.tsx`
- shared visual-editing primitives in `components/landing`
- visual editor adapter/state in `components/admin/visual-editor`
- shared link and rich-text editing infrastructure

Out of scope for this brief:

- custom/composed sections
- legacy `contact-section` unless the visual editor starts routing through it
- media upload/editor redesign
- new public-facing section designs

## Release Discipline

The coding agent must finish foundation work first, then execute the section matrix, then run the QA gate.

Do not interleave new polish work before parity is complete.
