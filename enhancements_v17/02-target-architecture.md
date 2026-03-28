# Target Architecture

## Proposed Module Layout

```text
components/
  section-editor-drawer.tsx                 # compatibility export only
  admin/
    section-editor/
      section-editor-drawer-shell.tsx
      use-section-editor-resources.ts
      use-section-editor-session.ts
      types.ts
      dirty-paths.ts
      payload.ts
      preview-pane.tsx
      version-status-card.tsx
      common-fields-panel.tsx
      content-editor-router.tsx
      fields/
        link-menu-field.tsx
        list-editor.tsx
        tiptap-json-editor.tsx
        media-url-field.tsx
        image-width-field.tsx
        repeater-item-row.tsx
      editors/
        hero-cta-editor.tsx
        card-grid-editor.tsx
        steps-list-editor.tsx
        title-body-list-editor.tsx
        rich-text-block-editor.tsx
        label-value-list-editor.tsx
        faq-list-editor.tsx
        cta-block-editor.tsx
        footer-grid-editor.tsx
        nav-links-editor.tsx
        social-proof-strip-editor.tsx
        proof-cluster-editor.tsx
        case-study-split-editor.tsx
        custom-composer-editor.tsx
```

## Exact Responsibility Split

### `section-editor-drawer.tsx`

Purpose:

- preserve current import path for callers
- re-export the new shell

This file should become tiny.

### `section-editor-drawer-shell.tsx`

Own:

- drawer chrome
- left/right two-column layout
- composition of child panels
- UI-only modal state

Do not own:

- resource loading internals
- draft mutation internals
- content-editor JSX for individual section types

### `use-section-editor-resources.ts`

Own:

- Supabase client creation
- capability/preset loading
- version list loading
- allowed classes loading
- custom composer schema loading
- page list / anchor list loading
- save / publish / delete / restore RPC functions

Public API should resemble:

```ts
type SectionEditorResources = {
  loading: boolean
  error: string | null
  versions: SectionVersionRow[]
  allowedClasses: Set<string>
  customComposerSchema: ComposerSchema | null
  pages: CmsPageRow[]
  pagesLoading: boolean
  anchorsByPageId: Record<string, string[]>
  anchorsLoadingByPageId: Record<string, boolean>
  activePresets: Record<string, SectionPreset>
  activeCapabilities: Record<string, SectionCapability>
  ensurePagesLoaded: () => Promise<void>
  ensureAnchorsLoaded: (pageId: string) => Promise<void>
  load: (opts?: { forceHydrate?: boolean }) => Promise<LoadedEditorState>
  saveDraft: (draft: VersionPayload, context: SaveContext) => Promise<void>
  publishDraft: (context: PublishContext) => Promise<void>
  deleteDraft: (context: DeleteContext) => Promise<void>
  restoreVersion: (context: RestoreContext) => Promise<void>
}
```

### `use-section-editor-session.ts`

Own:

- canonical edit draft
- base snapshot
- dirty path tracking
- hydration/reset
- stable action creators

Public API should resemble:

```ts
type SectionEditorSession = {
  draft: EditorDraft
  baseSnapshot: EditorDraft | null
  isDirty: boolean
  dirtyPaths: Set<string>
  hydrate: (payload: VersionPayload) => void
  resetToBase: () => void
  actions: {
    setMetaField: (field: MetaField, value: string) => void
    setFormatting: (updater: (prev: FormattingState) => FormattingState) => void
    patchContent: (path: string, value: unknown) => void
    replaceContent: (next: Record<string, unknown>) => void
    patchCustomBlock: (blockId: string, patch: Record<string, unknown>) => void
  }
}
```

### `version-status-card.tsx`

Own:

- current published/draft/editing badges
- action menu
- unsaved/draft/live explanatory copy

It must not receive `content`, `formatting`, or full draft payloads.

### `common-fields-panel.tsx`

Own:

- title / subtitle
- CTA labels and links
- background media

It must operate only on `draft.meta`.

### `content-editor-router.tsx`

Own:

- section type switch
- custom composer detection
- selecting the correct editor component

It must receive only:

- `sectionType`
- `content`
- write actions
- editor-specific resources

### `preview-pane.tsx`

Own:

- deferred preview snapshot
- preview title bar
- no-preview fallback

It must not sit on the hot typing path.

## Reducer Contract

### Core state

```ts
type EditorDraft = {
  meta: {
    title: string
    subtitle: string
    ctaPrimaryLabel: string
    ctaPrimaryHref: string
    ctaSecondaryLabel: string
    ctaSecondaryHref: string
    backgroundMediaUrl: string
  }
  formatting: FormattingState
  content: Record<string, unknown>
}

type EditorSessionState = {
  draft: EditorDraft
  baseSnapshot: EditorDraft | null
  dirtyPaths: Set<string>
}
```

### Required actions

```ts
type EditorSessionAction =
  | { type: "hydrate"; payload: EditorDraft }
  | { type: "set-meta-field"; field: keyof EditorDraft["meta"]; value: string }
  | { type: "set-formatting"; updater: (prev: FormattingState) => FormattingState }
  | { type: "patch-content"; path: string; value: unknown }
  | { type: "replace-content"; value: Record<string, unknown> }
  | { type: "patch-custom-block"; blockId: string; patch: Record<string, unknown> }
  | { type: "mark-base-snapshot"; payload: EditorDraft | null }
```

### Dirty path helper rules

- compare against `baseSnapshot`
- keep helper functions isolated in `dirty-paths.ts`
- support:
  - primitive field replace
  - array replace
  - object patch

## Editor Prop Contracts

Each built-in editor should have a typed `value` contract derived from current content shape.

Example:

```ts
type CardGridEditorProps = {
  value: Record<string, unknown>
  onContentReplace: (next: Record<string, unknown>) => void
  onContentPatch: (path: string, value: unknown) => void
  onOpenMediaLibrary: (target: CardImageTarget) => void
  onError: (message: string) => void
}
```

The router is responsible for adapting generic session actions to editor-specific props.

## Transitional Compatibility Strategy

Keep `FormattingControls` and `SectionPreview` as they are for now.

Do not rewrite them during the first refactor pass unless a hard requirement emerges. The bottleneck is the drawer architecture, not those files.
