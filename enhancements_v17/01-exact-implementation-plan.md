# Exact Implementation Plan

This plan is grounded in the live server implementation.

## Confirmed Current Hotspots

### Hot path 1: whole-form dirty serialization

Current code:

- `components/section-editor-drawer.tsx:1395-1409`

Problem:

- every keystroke rebuilds `formPayload`
- every keystroke runs `stableStringify(formPayload)`
- dirty checking cost scales with whole content size, not changed field size

### Hot path 2: single render tree owns everything

Current code:

- `components/section-editor-drawer.tsx:1968-4952`

Problem:

- one parent render owns version status, common fields, formatting, all built-in editors, custom composer editor, and preview
- even when closed branches are not mounted, the parent still owns all edit state and rebuilds the entire active subtree

### Hot path 3: inline section editors

Current code:

- built-in section editors:
  - `components/section-editor-drawer.tsx:2165-3996`
- custom composer block editors:
  - `components/section-editor-drawer.tsx:3997-4896`

Problem:

- the drawer file mixes shell logic and content-editor logic
- content editing cannot be isolated from unrelated state ownership

### Hot path 4: preview subscribes to live parent objects

Current code:

- `components/section-editor-drawer.tsx:4931-4943`

Problem:

- `SectionPreview` is memoized, but it still receives fresh `content` and `formatting` references every edit
- preview invalidation stays on the typing path

### Hot path 5: TipTap wrapper still lives inside the monolith

Current code:

- `components/section-editor-drawer.tsx:1140-1231`

Problem:

- rich text editing concerns are still defined inside the monolith
- even if the editor instance is local to that subcomponent, it is still part of the same file and same architectural surface

## Correct Refactor Outcome

The finished drawer must have three distinct layers:

1. `resources`
   Remote data loading, RPC operations, page/anchor lookup, capability/preset loading.
2. `session`
   Canonical editable draft, reducer actions, dirty tracking, hydration/reset.
3. `panels`
   Version/status UI, common fields, formatting UI, active content editor, preview.

If any one layer still directly owns the responsibilities of another, the refactor is incomplete.

## Exact Implementation Requirements

### Requirement 1: Replace canonical `useState` sprawl with a reducer

Current canonical draft state is split across:

- `title`
- `subtitle`
- `ctaPrimaryLabel`
- `ctaPrimaryHref`
- `ctaSecondaryLabel`
- `ctaSecondaryHref`
- `backgroundMediaUrl`
- `formatting`
- `content`

Replace those with a reducer-backed `draft` object.

Do not migrate transient UI state into the reducer. Keep UI-only state local:

- delete modal open
- media library open/close
- current media picker target
- drawer open/close

### Requirement 2: Replace `isDirty` stringify with path-based dirty tracking

Use a reducer-managed `dirtyPaths: Set<string>`.

Rules:

- every mutation action declares a logical path
- reducer compares changed value against `baseSnapshot`
- add path when different from base
- remove path when equal to base
- derive `isDirty` from `dirtyPaths.size > 0`

For array-heavy operations:

- mark the nearest stable collection path dirty
- examples:
  - `content.cards`
  - `content.steps`
  - `content.customBlocks.<blockId>`

Do not try to preserve perfect leaf-level dirty granularity for reorder-heavy collections if it increases fragility.

### Requirement 3: Introduce an editor router

The drawer must render the active section-type editor through a single router component.

Do not leave a long chain of `type === "..." ? (...) : null` in the shell.

Required router coverage:

- `hero_cta`
- `card_grid`
- `steps_list`
- `title_body_list`
- `rich_text_block`
- `label_value_list`
- `faq_list`
- `cta_block`
- `footer_grid`
- `nav_links`
- `social_proof_strip`
- `proof_cluster`
- `case_study_split`
- custom composed sections

### Requirement 4: Narrow props to the active editor slice

Each content editor receives:

- typed `value`
- stable write actions
- only the resource props it needs
- only the media helpers it needs

Do not pass:

- full `content`
- full `draft`
- version state
- unrelated common field state

### Requirement 5: Preview must run on a deferred draft snapshot

Create a preview wrapper with:

- `useDeferredValue` for preview draft props
- optionally `startTransition` when preview state derivation is expensive

Canonical editor state must remain immediate. Only preview subscription is deferred.

### Requirement 6: Shared field primitives must be moved first

Before splitting all section editors, extract reusable field primitives:

- `LinkMenuField`
- `ListEditor`
- `TipTapJsonEditor`
- shared media picker field patterns
- shared row/repeater primitives for cards, stats, logos, FAQs

This avoids creating 14 smaller monoliths with duplicated inline row logic.

## Live Data / RPC Flows That Must Stay Stable

Current save/publish/restore logic:

- `load`: `components/section-editor-drawer.tsx:1478-1580`
- `hydrateFrom`: `components/section-editor-drawer.tsx:1584-1608`
- `onSaveDraft`: `components/section-editor-drawer.tsx:1618-1682`
- `onPublishDraft`: `components/section-editor-drawer.tsx:1684-1711`
- `onConfirmDeleteDraft`: `components/section-editor-drawer.tsx:1713-1734`
- `onRestore`: `components/section-editor-drawer.tsx:1736-1764`

Do not change:

- version table contract
- `publishRpc` / `restoreRpc` usage
- draft version increment behavior
- legacy multi-draft cleanup behavior

You may reorganize where these live, but their payload/output behavior must remain consistent.
