# Section Editor Drawer Refactor Plan

Target file today: `components/section-editor-drawer.tsx`
Observed on server: 5,047 lines on 2026-03-08

## Executive Summary

Claude's diagnosis is basically correct, but "extract 13 editors" by itself is not a sufficient fix.

The real problem is not only file size. It is that one component currently owns:

- remote loading state
- version management state
- common field state
- formatting state
- content state for every section type
- custom-composer block editing
- dirty tracking via full-payload serialization
- live preview input props
- rich text editor instances

As long as that all lives in one render path, the drawer will keep paying the cost of parent re-renders, preview prop churn, and whole-form dirty checks even if some JSX is moved into child files.

The correct fix is a structural split:

1. separate resource loading from edit-session state
2. replace dozens of top-level `useState` calls with a typed reducer/session model
3. extract memoized panel boundaries and an editor router
4. pass only the active slice of state to the active content editor
5. move preview onto a deferred snapshot so typing is never blocked by preview invalidation
6. replace full-form `stableStringify()` dirty checks with incremental path-based dirty tracking

## What The Current File Is Actually Doing

### Confirmed hot spots

- full payload + stringify dirty check:
  - `components/section-editor-drawer.tsx:1395-1409`
- monolithic version bar + fields + formatting + content + preview render:
  - `components/section-editor-drawer.tsx:1968-4952`
- all built-in content editors inline:
  - `components/section-editor-drawer.tsx:2165-3996`
- custom composer block editors inline:
  - `components/section-editor-drawer.tsx:3997-4896`
- preview gets live `content` and `formatting` object props every edit:
  - `components/section-editor-drawer.tsx:4931-4943`
- TipTap editor wrapper is still defined inside this file:
  - `components/section-editor-drawer.tsx:1140-1231`

### Existing partial optimizations already in place

- select option arrays are hoisted out of render
- `FormattingControls` is extracted and memoized:
  - `components/admin/formatting-controls.tsx:472-519`
- `SectionPreview` is extracted and memoized:
  - `components/admin/section-preview.tsx:152-185`
  - `components/admin/section-preview.tsx:767`
- the drawer skips rendering the full body while closed:
  - `components/section-editor-drawer.tsx:1968-1969`

That matters because it shows the easy optimizations have already been attempted. The remaining issue is architectural.

## Non-Negotiable Refactor Rules

1. Do not keep the parent component as the canonical owner of every tiny edit event.
2. Do not pass the full `content` object to unrelated panels.
3. Do not keep full-form stringification in the hot typing path.
4. Do not let the live preview subscribe directly to every keystroke.
5. Do not solve this with a cosmetic "move JSX to files" refactor only.
6. Do not introduce a heavyweight external state library just to escape the current file.

Use React primitives properly. This can be solved cleanly with extracted components plus a reducer-driven editor session.

## Recommended Target Architecture

Create a dedicated module tree:

```text
components/admin/section-editor/
  section-editor-drawer.tsx          # thin shell/export
  use-section-editor-resources.ts    # versions, pages, anchors, presets, capabilities
  use-section-editor-session.ts      # reducer, actions, dirty tracking, draft state
  types.ts
  version-status-card.tsx
  common-fields-panel.tsx
  content-editor-router.tsx
  preview-pane.tsx
  fields/
    link-menu-field.tsx
    list-editor.tsx
    tiptap-json-editor.tsx
    media-list-field.tsx
    repeater-row.tsx
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

### Top-level responsibilities

#### `useSectionEditorResources`

Own only remote/data concerns:

- loading versions
- loading allowed classes
- loading custom schema
- loading pages / anchors
- loading DB presets / capabilities
- save / publish / delete / restore RPC calls

#### `useSectionEditorSession`

Own only editable draft concerns:

- canonical editable draft model
- typed patch/update actions
- base snapshot
- incremental dirty tracking
- reset/load/restore semantics

#### `SectionEditorDrawer`

Own only composition:

- drawer shell
- layout columns
- wiring resources to session
- passing stable callbacks into child panels

This file should end up in the low hundreds of lines, not thousands.

## State Model

Do not keep ~40 independent `useState` hooks for the canonical draft.

Use one reducer-backed session shape:

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

### Why a reducer is necessary

- one stable `dispatch` replaces dozens of recreated closures
- path-based updates make exact dirty tracking possible
- child editors can receive narrow selectors plus typed actions
- reverting a field back to its original value can correctly clear dirty state

## Dirty Tracking: Replace Full-Form Stringify

Current hot path:

- `stableStringify(formPayload)` on every keystroke

Replacement:

- reducer keeps `dirtyPaths: Set<string>`
- every update action includes a logical path, for example:
  - `meta.title`
  - `formatting.gridGap`
  - `content.cards`
  - `content.cards.2.title`
- reducer compares only the changed path against the base snapshot
- `isDirty = dirtyPaths.size > 0`

Important nuance:

- for reorderable arrays or complex nested operations, mark the nearest stable container path dirty
- do not chase perfect leaf granularity where it adds complexity with no UX gain

This eliminates whole-form serialization from the typing path while preserving exact dirty semantics.

## Preview Isolation

The preview is already memoized, but that does not help if the parent keeps passing fresh `content` and `formatting` references on every keystroke.

Create a `PreviewPane` wrapper:

- build a `previewDraft` with `useDeferredValue` or a short debounce
- optionally wrap preview updates in `startTransition`
- pass the deferred snapshot into `SectionPreview`

Recommended behavior:

- form controls update immediately
- preview trails slightly behind while typing
- no preview lag should block the left-side editing panel

Do not debounce the canonical edit state itself. Debounce only the preview subscription.

## Content Editor Strategy

### Important: extraction alone is not enough

If you extract `HeroCtaEditor` but still pass the whole `content` object and inline closures from the parent, you will shrink the file without fixing the architecture.

Each editor should receive:

- only the slice it needs
- stable action callbacks
- any local UI-only open/closed state it owns itself

### Recommended editor prop shape

```ts
type HeroCtaEditorProps = {
  value: HeroCtaContent
  onPatch: (path: string, value: unknown) => void
  onListChange: (path: string, next: string[]) => void
  onMediaPick: (path: string, url: string) => void
  onError: (message: string) => void
}
```

Do not pass unrelated props into every editor.

### Shared field primitives first

Before extracting all section editors, extract and reuse these shared building blocks:

- `LinkMenuField`
- `ListEditor`
- `TipTapJsonEditor`
- image/media field rows
- small repeater row components for list items, stats, FAQ entries, logo entries

This prevents the refactor from turning into 15 copied mini-monoliths.

## TipTap Strategy

Move `TipTapJsonEditor` into `components/admin/section-editor/fields/tiptap-json-editor.tsx`.

Rules:

- the editor instance must live only inside that field component
- parent state changes elsewhere must not threaten the editor instance
- if needed, the field can keep local editor state and emit normalized JSON upward on update

Do not keep TipTap definitions inside the main drawer file.

## Extraction Order

This is the safest order. It keeps behavior stable while progressively introducing the real architecture.

### Phase 0: Baseline and Safety Net

- record profiler baseline in React DevTools
- record the slowest interaction paths:
  - typing in hero/body fields
  - editing card-grid rows
  - editing custom-composer blocks
  - switching section presets
- add or update targeted tests around:
  - load/reset from published/draft
  - save draft
  - publish
  - restore version

### Phase 1: Create Module Boundaries Without Behavior Change

- move helper components out of `section-editor-drawer.tsx`:
  - `LinkMenuField`
  - `ListEditor`
  - `TipTapJsonEditor`
  - `StatusBadge`
- extract:
  - `VersionStatusCard`
  - `CommonFieldsPanel`
- keep current state ownership temporarily

Goal:

- shrink the main file
- establish import structure
- preserve behavior 1:1

### Phase 2: Introduce `useSectionEditorSession`

- replace the many canonical draft `useState` hooks with reducer state
- keep resource loading separate
- keep RPC and Supabase logic outside the reducer
- expose stable typed actions:
  - `setMetaField`
  - `setFormattingField`
  - `patchContent`
  - `replaceContent`
  - `resetFromVersion`

Goal:

- stabilize update paths
- prepare for fine-grained child props
- remove full-form local state sprawl

### Phase 3: Extract `ContentEditorRouter`

- replace the huge inline `type === "..." ? ... : null` block
- render only the active editor component
- add one component per built-in section type
- add `CustomComposerEditor` as its own top-level editor

Goal:

- parent shell stops evaluating thousands of lines of inactive JSX
- only the active editor subtree re-renders

### Phase 4: Slice Props Properly

- each editor receives only its typed content slice
- common fields do not receive content props
- version panel does not receive content or formatting props
- preview pane receives only deferred snapshot props

Goal:

- changing `content.cards[2].title` does not re-render version actions, formatting controls, or unrelated editors

### Phase 5: Replace Dirty Stringify With Incremental Dirty Tracking

- remove `stableStringify(formPayload)` from hot typing paths
- keep serialization only where needed for save/publish payload generation
- derive `isDirty` from reducer-maintained dirty paths

Goal:

- typing latency no longer scales with entire payload size

### Phase 6: Preview Decoupling

- create `PreviewPane`
- feed it deferred draft state
- confirm preview no longer thrashes during rapid typing

### Phase 7: Polish and Regression Pass

- remove stale parent callbacks
- memoize top-level panels and editors
- verify keyboard focus, drawer open/close, and modal flows
- profile again and compare with baseline

## What Claude Should Not Do

- do not try to land this as one giant uncontrolled rewrite without phases
- do not keep `section-editor-drawer.tsx` as the main logic file and just import extracted JSX chunks
- do not add `useMemo`/`useCallback` everywhere as a substitute for architecture
- do not push all child editors into local shadow state unless there is a clear reason
- do not debounce save-state correctness

## What "Done Properly" Looks Like

- `components/section-editor-drawer.tsx` becomes a thin shell
- all content editors live in dedicated files
- only the active content editor re-renders during typing
- dirty tracking is exact without full-form stringify on every keystroke
- preview is visibly responsive but isolated from input latency
- TipTap instances are stable and independently mounted
- version management and common fields feel instant even during heavy content editing

## Acceptance Criteria

Functional:

- no behavior regression in save draft / publish / restore / delete draft
- payload shape sent to RPC remains unchanged
- all section types and custom composer blocks still edit correctly

Performance:

- no whole-drawer typing lag in large content editors
- repeated keystrokes in heavy editors do not stall the UI
- preview updates no longer block left-column interactions

Structural:

- main drawer file is reduced to shell-level responsibilities
- content editors are isolated by type
- remote/resource logic is separated from local draft session logic

## Recommendation To Claude

This refactor is large, but it is the correct kind of large. This drawer is the core CMS editing surface. It should be treated like infrastructure, not like a page component that can survive incremental patchwork forever.

If Claude wants a safe path, the right answer is not to avoid the refactor. The right answer is to stage it in the order above and keep the payload contract stable while the architecture changes underneath.
