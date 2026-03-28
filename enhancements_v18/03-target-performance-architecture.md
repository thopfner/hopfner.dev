# Target Performance Architecture

This is the recommended end state for the remaining polish pass. Keep it targeted. Do not over-engineer beyond the hotspot boundaries.

## Module Layout

```text
components/
  section-editor-drawer.tsx
  admin/
    section-editor/
      section-editor-drawer-shell.tsx
      use-section-editor-resources.ts
      use-section-editor-session.ts
      dirty-paths.ts
      payload.ts
      types.ts
      preview-pane.tsx
      version-status-card.tsx
      common-fields-panel.tsx
      content-editor-router.tsx
      hooks/
        use-buffered-field.ts
      fields/
        link-menu-field.tsx
        list-editor.tsx
        tiptap-json-editor.tsx
      editors/
        card-grid-editor.tsx
        card-grid-row.tsx
        custom-composer-editor.tsx
        custom-block-editor.tsx
        footer-grid-editor.tsx
        footer-card-row.tsx
        hero-cta-editor.tsx
        hero-proof-panel-row.tsx
        hero-trust-item-row.tsx
        hero-stat-row.tsx
```

You do not need to create every file above if a smaller grouping is enough, but the runtime boundaries must exist.

## Responsibility Split

### `use-section-editor-session.ts`

Own:

- canonical draft
- base snapshot
- exact dirty path tracking
- stable action creators

Do not own:

- large object deep equality for edit-time dirty state
- editor-specific content cloning logic

### `content-editor-router.tsx`

Own:

- section-type selection
- adapting canonical session actions into editor-specific props

Do not own:

- editor-internal row rendering
- full generic content mutation logic

### Heavy editor shells

Own:

- the top-level layout for one editor type
- wiring editor-specific row callbacks

Do not own:

- every row's local typing behavior
- unrelated sibling row rendering

### Row / block components

Own:

- one card, one footer group, one custom block, one trust item, one stat row
- local buffered field state when useful
- exact commits back into the session

Must be:

- `memo` wrapped
- passed stable callbacks
- keyed by stable IDs or indexes that match current payload semantics

### `preview-pane.tsx`

Own:

- the deferred preview subscription
- preview title bar
- no-preview fallback

Do not own:

- canonical editor state
- its own second layer of debouncing if `SectionPreview` is simplified

## Session API Shape

Recommended surface:

```ts
type SectionEditorSession = {
  draft: EditorDraft
  baseSnapshot: EditorDraft | null
  isDirty: boolean
  dirtyPaths: Set<string>
  hydrate: (draft: EditorDraft) => void
  resetToBase: () => void
  actions: {
    setMetaField: (field: keyof EditorDraftMeta, value: string) => void
    setFormattingPath: (path: string, value: unknown) => void
    setContentPath: (path: string, value: unknown) => void
    replaceContentSubtree: (path: string, value: unknown) => void
    patchCustomBlockPath: (blockId: string, path: string, value: unknown) => void
  }
}
```

The exact names may differ. The important part is the semantics:

- exact path write
- exact dirty path update
- no full-content deep compare in the hot path

## Buffered Field Strategy

Use a very small shared hook for text-heavy row fields:

```ts
type UseBufferedFieldArgs<T> = {
  value: T
  onCommit: (value: T) => void
  delayMs?: number
}
```

Rules:

- local state updates immediately for typing
- commit on blur
- optionally commit after a short idle delay
- external value changes re-sync the buffer when the canonical state changes underneath it

Good uses:

- repeater text inputs
- textarea fields in card / custom block rows
- footer link labels

Bad uses:

- toggle switches where immediate canonical state is cheap and important
- preview-wide debouncing

## Definition Of Runtime Success

When editing a single repeater row:

- the shell may rerender once because the parent state changed
- memoized shell panels should not rerender if their props did not change
- sibling rows should not rerender
- preview updates should be deferred
- the dirty state should update without serializing the full `content` object
