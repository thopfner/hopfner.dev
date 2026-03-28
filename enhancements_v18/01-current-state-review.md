# Current State Review

This is the verified gap review of the current implementation on the server repo.

## Finding 1: Dirty tracking still serializes large objects on edit

Severity: High

Files:

- `components/admin/section-editor/dirty-paths.ts:8-14`
- `components/admin/section-editor/dirty-paths.ts:80-107`
- `components/admin/section-editor/use-section-editor-session.ts:72-97`
- `components/admin/section-editor/use-section-editor-session.ts:113-135`

What is true right now:

- `valuesEqual()` still uses `stableStringify()` for object comparison.
- formatting updates still compare the full formatting object.
- content updates still compare the full content object.
- those comparisons still happen inside reducer actions that fire during editing.

Why this matters:

- the original v17 objective was to remove full-form stringify from the hot path
- this implementation removed the old monolith but retained full-object deep comparison for the most expensive state slice
- large `content` trees still pay a deep-serialization cost while typing

Required conclusion:

- Phase 6 is not complete

## Finding 2: The session API is still whole-object, not path-aware

Severity: High

Files:

- `components/admin/section-editor/use-section-editor-session.ts:186-190`
- `components/admin/section-editor/content-editor-router.tsx:22-63`
- `components/admin/section-editor/section-editor-drawer-shell.tsx:228-234`

What is true right now:

- the session exposes `setContent(updater)` and `replaceContent(next)`
- the router still passes the full `content` object into each editor
- editors still update state by rebuilding large objects and arrays inline

Why this matters:

- the extraction is real, but the active editor still behaves like one large controlled subtree
- React only gained file boundaries, not granular state boundaries
- the heavy editor files still recreate large arrays for small field edits

Required conclusion:

- the target architecture from v17 was only partially implemented

## Finding 3: Memoized shell panels are still fed unstable inline callbacks

Severity: Medium

Files:

- `components/admin/section-editor/section-editor-drawer-shell.tsx:322-375`

What is true right now:

- `VersionStatusCard` receives new wrapper callbacks each render
- `CommonFieldsPanel` receives inline `onOpenBackgroundLibrary` and `onError`
- `ContentEditorRouter` receives inline `onError` and `onOpenNavLogoLibrary`

Why this matters:

- these child components are wrapped in `memo`
- but React cannot skip them when function props change identity every render
- this directly weakens the point of the shell extraction

Required conclusion:

- shell prop stability work is incomplete

## Finding 4: The heavy editors are still monolithic controlled trees

Severity: Medium

Files:

- `components/admin/section-editor/editors/card-grid-editor.tsx`
- `components/admin/section-editor/editors/custom-composer-editor.tsx`
- `components/admin/section-editor/editors/footer-grid-editor.tsx`
- `components/admin/section-editor/editors/hero-cta-editor.tsx`

Measured state:

- `custom-composer-editor.tsx`: 933 lines
- `footer-grid-editor.tsx`: 521 lines
- `card-grid-editor.tsx`: 488 lines
- `hero-cta-editor.tsx`: 306 lines

What is true right now:

- the largest editors are still large single render functions
- there are no `useState` local edit islands inside these editors
- there are still 166 inline `onChange` sites and 85 inline `onClick` sites across `components/admin/section-editor`
- the largest editors are not exported as memoized row-based subsystems

Why this matters:

- the previous 5,000-line file was split, but the main editing hotspots were mostly redistributed
- typing in a single card or custom block still re-renders the entire active editor

Required conclusion:

- extraction improved maintainability, but not enough runtime isolation

## Finding 5: Rich text still writes canonical state on every editor update

Severity: Medium

Files:

- `components/admin/section-editor/fields/tiptap-json-editor.tsx:60-70`
- `components/admin/section-editor/editors/card-grid-editor.tsx:315+`
- `components/admin/section-editor/editors/custom-composer-editor.tsx:100+`

What is true right now:

- `TipTapJsonEditor` calls `onChange(editor.getJSON())` on every `onUpdate`
- large editors render multiple TipTap fields inline
- there is no buffered commit strategy or parent-rerender guard specific to TipTap

Why this matters:

- rich text editing is one of the worst-case interaction paths in this drawer
- unrelated parent rerenders still put pressure on active rich text fields

Required conclusion:

- rich text stability work is incomplete

## Finding 6: Profiling acceptance criteria were not closed

Severity: Medium

Files:

- `enhancements_v17/03-phase-plan.md`
- `enhancements_v17/05-acceptance-checklist.md`

What is true right now:

- the repo contains the v17 profiling requirements
- this review did not find committed profiler notes or a before/after evidence trail tied to the drawer refactor

Why this matters:

- without profiler evidence, the refactor cannot be treated as performance-complete

Required conclusion:

- the next pass must begin and end with measurement, not assumption
