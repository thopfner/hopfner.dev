# 03 Phase 2 Craft Canvas and Visual Shell

This phase introduces Craft.js as the admin interaction layer while keeping the current CMS payload as the only persisted truth.

## Phase Goal

Deliver a serious visual canvas for page sections:

- section selection
- drag/drop page ordering
- visual focus and hierarchy
- side-by-side inspection
- accurate render fidelity

## Core Architecture

### Non-Negotiable Principle

Craft node state is not persisted and is not the canonical data model.

Canonical state remains a local typed store built from:

- page row
- section rows
- draft version payloads
- published version payloads
- defaults
- presets
- capabilities

Craft state is a projection of that canonical store.

### Why This Matters

If Craft becomes storage truth, you create:

- a second schema
- a translation problem
- a regression surface between admin and public rendering
- a migration burden the current system does not need

That is exactly what v1 must avoid.

## Likely File Touchpoints

Primary new files:

- `app/admin/(protected)/pages/[pageId]/visual/page.tsx`
- `components/admin/visual-editor/page-visual-editor.tsx`
- `components/admin/visual-editor/page-visual-editor-shell.tsx`
- `components/admin/visual-editor/page-visual-editor-canvas.tsx`
- `components/admin/visual-editor/page-visual-editor-node.tsx`
- `components/admin/visual-editor/page-visual-editor-structure.tsx`
- `components/admin/visual-editor/page-visual-editor-overlay.tsx`
- `components/admin/visual-editor/page-visual-editor-store.ts`
- `components/admin/visual-editor/page-visual-editor-selectors.ts`

Likely additive integration files:

- `components/admin/section-preview.tsx`
- `app/admin/(protected)/pages/[pageId]/page-editor.tsx`

Do not edit in this phase unless absolutely necessary:

- `app/(marketing)/[slug]/page.tsx`
- `lib/cms/get-published-page.ts`
- `components/landing/*`

## Recommended Node Model

Use a minimal node tree.

### Node Types

- `VisualPageRoot`
- `VisualSectionNode`

Do not introduce per-text, per-card, or per-field Craft nodes in v1.

Reason:

- the current CMS is section-version based, not block-tree based
- first release is mapped only to existing design variables
- per-field node authoring would pressure the team into a new persistence model

## Section Node Shape

Each section node should carry:

- `sectionId`
- `pageId`
- `sectionType`
- `source`
  - `page`
  - `global`
- `isGlobal`
- `isCustomComposed`
- `position`
- `key`
- `meta`
- `content`
- `formatting`
- `publishedVersionId`
- `draftVersionId`

This is editor convenience state only. Persist through the existing CMS write model, not through Craft serialization.

## Canvas Rendering Strategy

Use the actual admin preview renderer inside each node shell.

Recommended rendering stack:

- outer Craft node wrapper for selection and drag handles
- inner visual preview using existing admin preview components
- node overlay for hover, selected, dirty, draft, published, global, and unsupported states

### Preferred Preview Source

Use current admin preview infrastructure wherever possible:

- `components/admin/section-preview.tsx`
- or an additive page-level visual preview renderer built from the same landing components

The key rule is the same either way:

- render the current landing section components
- resolve the current design tokens
- apply the current site token CSS variables

Do not invent a second visual language for the canvas.

If `components/admin/section-preview.tsx` cannot truthfully render custom/composed sections without widening risk, keep custom/composed support explicitly locked in v1 and do not force support by mutating public render code.

## Handling Section Types

### Built-In Local Sections

Full support in v1:

- render
- select
- drag reorder
- inspect formatting
- save draft
- publish

### Global Sections In Page Canvas

Support as locked nodes in v1:

- visible on canvas
- selectable
- reorderable at page structure level if current page editor allows it
- clearly marked as global
- editing disabled inside page visual editor
- CTA routes to existing global section editor or future global visual editor

Do not mutate global section versions from the page visual route in v1.

### Custom / Composed Sections

Recommended v1 behavior:

- render if truthful preview is easy using current composed section code
- otherwise show a high-quality locked placeholder with exact reason and a CTA to open the current form editor

Do not fake support.

## Drag and Drop Semantics

The canvas should support page section reorder only.

Required behavior:

- drag handle on each section shell
- keyboard-accessible reorder actions in addition to pointer drag
- optimistic reorder in local state
- persisted reorder only through existing `sections.position` semantics

Avoid:

- nested drag/drop
- within-section field drag/drop
- freeform arbitrary placement

Those do not match the current CMS data model.

## Selection and Inspector Model

Only one active section edit target at a time in v1.

Selection should drive:

- inspector content
- dirty-state ownership
- save/publish controls
- fallback CTA to current form editor

If the selected section has unsaved changes and the user selects another section:

- prompt explicitly
- allow save draft
- allow discard local visual changes
- allow cancel

## UX Standard

This is where the product must start feeling elite.

Required shell behaviors:

- crisp hover and selected states
- visible section boundaries without damaging preview fidelity
- accurate local/global/draft badges
- viewport presets
- contextual inspector
- keyboard navigation between sections
- no lag while typing or switching selection

Recommended UI zones:

- top toolbar
- left structure panel
- center canvas
- right inspector

## Performance Requirements

- defer heavy preview updates where possible
- keep the selected-section inspector separate from full-page rerenders
- lazy-load expensive section renderers
- memoize derived preview props carefully
- do not let Craft rerender the entire page on every keystroke

## Acceptance Criteria

- Craft canvas initializes for a page
- every supported built-in section is represented by a node
- selection is stable
- reorder interaction works in memory
- global nodes are locked and labeled
- unsupported custom states are explicit
- preview uses current section renderers

## Test Requirements

Add at least:

- node projection test from canonical page state
- selected-node state test
- reorder reducer/store test
- global lock-state test
- unsupported custom/composed-state test

## Phase Risk Gates

Do not move to persistence until:

- section rendering is truthful
- drag reorder works locally
- selection and dirty-state handoff works cleanly
- the canvas feels stable under real admin data
