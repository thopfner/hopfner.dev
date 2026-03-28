# Exact Polish Pass Plan

This is the exact implementation scope for v18. The goal is to finish the performance architecture, not start another broad refactor.

## 1. Finish the session contract

Primary files:

- `components/admin/section-editor/use-section-editor-session.ts`
- `components/admin/section-editor/dirty-paths.ts`

Required changes:

- remove hot-path `stableStringify()` usage for `content` and `formatting` dirty updates
- keep full serialization only where it belongs:
  - save-time payload assembly
  - optional one-time hydration sanity checks
- replace whole-object dirty markers with exact dirty path membership
- implement reducer actions that describe the actual edit:
  - `set-meta-field`
  - `set-formatting-path`
  - `set-content-path`
  - `replace-content-subtree`
  - `patch-custom-block-path`
  - `hydrate`
  - `reset-to-base`

Implementation rules:

- a path change like `content.cards.2.title` must be tracked as that exact path
- if a value returns to the base snapshot value, that dirty path must clear
- reducer actions must update only the affected subtree, not re-derive the entire draft shape
- `isDirty` remains `dirtyPaths.size > 0`

What does not count:

- keeping `dirtyPaths` as a set while still deep-comparing the whole `content` object
- replacing one stringify call with another deep-equality helper

## 2. Stabilize shell props so memo boundaries work

Primary file:

- `components/admin/section-editor/section-editor-drawer-shell.tsx`

Required changes:

- replace all inline handler wrappers passed to memoized children with `useCallback` functions
- do this for:
  - save draft
  - publish draft
  - open delete modal
  - open background library
  - open nav logo library
  - open custom image library
  - shared error setter passed into children
- keep `linkMenuProps` memoized as it is now

Implementation rules:

- `VersionStatusCard`, `CommonFieldsPanel`, `ContentEditorRouter`, and `PreviewPane` must receive stable function props unless their true dependencies changed
- no inline lambdas should remain in props passed to memoized shell panels

What does not count:

- memoizing children while still passing fresh lambdas into them

## 3. Change the router from whole-content transport to slice transport

Primary file:

- `components/admin/section-editor/content-editor-router.tsx`

Required changes:

- stop passing a generic `content` blob plus `onContentChange`
- adapt the session API to typed editor contracts
- each editor should receive:
  - only the slice it needs
  - stable patch callbacks for that slice
  - editor-specific resources only when needed

Example direction:

- `CardGridEditor`
  - `cards`
  - `sectionVariant`
  - `columns`
  - `cardTone`
  - `eyebrow`
  - `onSetField(path, value)`
  - `onPatchCard(index, patch)`
  - `onSetCardField(index, path, value)`
- `CustomComposerEditor`
  - `flattenedCustomBlocks`
  - `customBlockOverrides`
  - `onPatchBlock(blockId, patch)`
  - `onSetBlockField(blockId, path, value)`

Implementation rules:

- route-level adapters may still read the canonical content object
- editor components should stop reconstructing unrelated content on every field change

## 4. Split the large active editors into row/block subsystems

Primary files:

- `components/admin/section-editor/editors/card-grid-editor.tsx`
- `components/admin/section-editor/editors/custom-composer-editor.tsx`
- `components/admin/section-editor/editors/footer-grid-editor.tsx`
- `components/admin/section-editor/editors/hero-cta-editor.tsx`

Required changes:

- split each heavy editor into:
  - a small editor shell
  - memoized row/block subcomponents
- introduce row-level or block-level components for the true hotspots

Minimum required subcomponent extraction:

- card grid:
  - `card-grid-row.tsx`
  - optional `card-display-controls.tsx`
- custom composer:
  - `custom-block-editor.tsx`
  - block-type sub-editors or at minimum per-block memoized rows
- footer grid:
  - footer card row
  - grouped-link row
  - legal-link row
- hero CTA:
  - proof-panel editor row
  - trust item row
  - stat row

Implementation rules:

- row/block components must be wrapped in `memo`
- their props must be stable enough for `memo` to matter
- typing in one row must not force rerender of sibling rows

What does not count:

- moving 500 lines into another single 500-line file
- extracting helper functions while keeping one top-level render loop

## 5. Add buffered field commits where they buy real latency

Primary files:

- heavy editor row/block components
- optionally a shared hook under `components/admin/section-editor`

Required changes:

- add a small local buffering layer for text-heavy fields inside row/block components
- commit strategy:
  - immediate visual typing in the field
  - canonical session update on blur and/or short debounce
- use this for the worst offenders:
  - card titles / text inputs inside repeaters
  - footer link labels
  - custom composer card / faq / step text fields

Implementation rules:

- do not debounce the entire canonical draft
- do not buffer fields that must remain immediately synchronized for correctness
- local buffer state must re-sync correctly after hydrate, save, restore, or external content replacement

What does not count:

- adding a blanket debounce around the whole editor session

## 6. Harden TipTap as a controlled bridge

Primary file:

- `components/admin/section-editor/fields/tiptap-json-editor.tsx`

Required changes:

- keep the TipTap editor instance stable across unrelated parent rerenders
- prevent content echo loops where parent updates feed back into the editor unnecessarily
- only push external content into TipTap when the incoming value truly changed and the current editor state needs re-sync
- support a delayed commit path for large rich-text fields if needed

Implementation rules:

- rich text fields must not lose selection or feel unstable during unrelated edits
- media insertion flows must continue to work

## 7. Clean up the preview pipeline

Primary files:

- `components/admin/section-editor/preview-pane.tsx`
- `components/admin/section-preview.tsx`

Required changes:

- choose one preview lag mechanism
- do not keep both:
  - `useDeferredValue` in `preview-pane.tsx`
  - `useDebouncedValue()` inside `SectionPreview`
- keep preview work off the hot typing path
- keep preview visual behavior unchanged

Recommended direction:

- let `PreviewPane` own deferred subscriptions
- simplify `SectionPreview` so it renders what it receives

Why this matters:

- the current double-lag setup is not the primary lag source, but it is unnecessary complexity and makes debugging harder

## 8. Do not re-open solved architecture areas

Do not spend this pass rewriting:

- `use-section-editor-resources.ts`
- save / publish / restore payload assembly
- the compatibility export pattern in `components/section-editor-drawer.tsx`
- `FormattingControls` unless a targeted bug is discovered

The focus is the hot edit path, not another broad reorganization.
