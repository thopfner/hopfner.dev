# Shared Primitives And Editor Foundation

v6 will fail if the coding agent tries to close the matrix with more one-off patches.

The next implementation must strengthen the shared primitives first.

## 1. `EditableTextSlot` Must Stop Guessing Width

Current problem:

- the edit input is measured too late
- large wrapped headings still collapse into an undersized input

Required implementation:

- replace the current `measuredWidth` approach with a mirror-box strategy
- keep a hidden measurement element that mirrors the rendered text node while focused
- capture both width and height before the display node is swapped out
- for multiline text, size the textarea to the rendered block width and current scroll height
- for single-line text, use rendered width plus safety padding, never `N ch`

Hard requirement:

- the home hero title must show the full string while editing without clipping the user down to the last few words

Primary files:

- `components/landing/editable-text-slot.tsx`
- `components/landing/section-primitives.tsx`

## 2. Extract A Real Visual Link Picker

Current problem:

- `EditableLinkSlot` still ships a custom popover that is not equivalent to the form editor

Required implementation:

- extract the semantic link menu logic out of the form editor path
- create a shared visual-link-picker primitive that uses the same page/anchor/custom model
- preserve the same `parseHref` / `buildHref` semantics
- load pages and anchors through the existing resource path instead of hardcoding text inputs

UI requirement:

- visual editor link editing must feel like a compact premium popover, not a second inspector form

Primary files:

- `components/landing/editable-link-slot.tsx`
- `components/admin/section-editor/fields/link-menu-field.tsx`
- `components/admin/section-editor/use-section-editor-resources.ts`
- `components/landing/visual-editing-context.tsx`
- `components/admin/visual-editor/page-visual-editor-node.tsx`

## 3. Add A Rich-Text Surface Primitive

Current problem:

- sections that render HTML-backed text still become dead zones

Required implementation:

- add a dedicated visual-editor primitive for structured rich text
- do not force rich-text fields through the string-only `EditableTextSlot`
- the primitive should render the existing block and expose an anchored composer when selected
- the anchored composer should use the existing rich-text editor stack, not a new editor stack

Behavior:

- closed state: normal rendered content with a subtle hover/focus affordance
- open state: anchored editing panel sized for real authoring, not a tiny popover
- save path: writes the structured rich-text field and keeps fallback plain text synchronized only where the existing payload helpers already do that safely

Primary files:

- `components/landing/visual-editing-context.tsx`
- new `components/landing/editable-rich-text-slot.tsx`
- `components/admin/section-editor/fields/tiptap-json-editor.tsx`
- `components/admin/section-editor/payload.ts`

## 4. Add Admin-Only Static Fallbacks For Motion Surfaces

Current problem:

- animated counters and marquees are marketing behaviors, not editing behaviors

Required implementation:

- when visual editing is active, counters render as stable text
- when visual editing is active, marquee rows render as stable editable rows or tiles
- public rendering keeps the current motion behavior

Primary files:

- `components/landing/logo-ticker.tsx`
- `components/landing/hero-section.tsx`
- `components/landing/proof-cluster-section.tsx`
- `components/landing/tech-stack-section.tsx`
- any shared helper introduced for editable metric values

## 5. Add A Hotspot Pattern For Hidden Metadata

Current problem:

- image-backed logos or image-first variants can hide text or link metadata with no direct canvas affordance

Required implementation:

- when a visible element is image-driven, selected state must reveal a compact hotspot chip
- the hotspot must allow editing of hidden text or link metadata tied to that visible element
- the hotspot must not appear on the public frontend

Primary files:

- `components/landing/social-proof-strip-section.tsx`
- `components/landing/tech-stack-section.tsx`
- any shared hotspot helper created in `components/landing`

## 6. Extend Visual Editing Context Deliberately

Current problem:

- current context assumes every field is a string or raw href

Required implementation:

- keep the current string-field path APIs
- add explicit structured-field APIs instead of overloading the text slot
- support:
  - string text edits
  - link-destination edits
  - rich-text document edits
  - optional hidden-field hotspot state

Do not:

- make the context generic in a way that hides behavior
- bury section-specific hacks inside the provider

Primary files:

- `components/landing/visual-editing-context.tsx`
- `components/admin/visual-editor/page-visual-editor-node.tsx`
