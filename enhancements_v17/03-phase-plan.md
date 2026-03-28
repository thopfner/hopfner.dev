# Phase Plan

This is the exact landing order. Do not collapse these phases unless profiling proves it is safe.

## Phase 0: Baseline And Safety Rails

Deliverables:

- record React profiler baselines for:
  - typing in hero title
  - typing in card-grid card text
  - editing a custom composer proof card
  - switching formatting preset
- add a temporary measurement note in the PR description
- verify current behaviors for:
  - load existing section
  - save draft
  - publish draft
  - delete draft
  - restore prior version

Exit criteria:

- baseline interaction timings captured
- behavior matrix documented before refactor begins

## Phase 1: Extract Shared Primitives

Files to create:

- `fields/link-menu-field.tsx`
- `fields/list-editor.tsx`
- `fields/tiptap-json-editor.tsx`

Files to touch:

- `components/section-editor-drawer.tsx`

Rules:

- no state architecture changes yet
- imports switch to extracted primitives
- zero behavioral drift

Exit criteria:

- helper components leave the main file
- main file is already materially smaller
- TipTap wrapper is no longer defined in the monolith

## Phase 2: Extract Panel Boundaries

Files to create:

- `version-status-card.tsx`
- `common-fields-panel.tsx`
- `preview-pane.tsx`

Rules:

- still no reducer yet if that complicates the move
- extract these as memoized components with narrow props
- preview pane should be introduced here, even if it still receives immediate props initially

Exit criteria:

- version UI no longer lives inline
- common fields no longer live inline
- preview rendering is wrapped by a dedicated component

## Phase 3: Introduce `useSectionEditorResources`

Files to create:

- `use-section-editor-resources.ts`
- `types.ts`
- optionally `payload.ts`

Move into resources hook:

- versions load
- whitelist load
- custom composer schema load
- pages / anchors lazy loaders
- save / publish / delete / restore calls

Rules:

- keep external behavior identical
- keep payload shape identical
- the shell should only consume a resource API, not raw Supabase details

Exit criteria:

- Supabase access is isolated from UI composition
- shell no longer owns the resource orchestration details

## Phase 4: Introduce `useSectionEditorSession`

Files to create:

- `use-section-editor-session.ts`
- `dirty-paths.ts`

Move into session hook:

- canonical draft state
- base snapshot
- hydration/reset
- stable actions

Initial implementation rule:

- it is acceptable in this phase to keep `isDirty` temporarily derived from stringify if needed for a safe landing
- but the state shape must already be reducer-based

Exit criteria:

- canonical edit state no longer uses the many top-level `useState` hooks
- shell consumes a reducer-backed session API

## Phase 5: Extract The Editor Router

Files to create:

- `content-editor-router.tsx`
- all built-in editors under `editors/`
- `custom-composer-editor.tsx`

Landing order inside this phase:

1. simplest editors first:
   - `rich-text-block-editor`
   - `faq-list-editor`
   - `cta-block-editor`
2. medium complexity:
   - `title-body-list-editor`
   - `label-value-list-editor`
   - `steps-list-editor`
   - `social-proof-strip-editor`
   - `proof-cluster-editor`
   - `case-study-split-editor`
3. highest complexity last:
   - `hero-cta-editor`
   - `card-grid-editor`
   - `footer-grid-editor`
   - `nav-links-editor`
   - `custom-composer-editor`

Rules:

- each editor gets narrow props
- parent no longer contains inline section editor JSX
- custom composer editor must become its own subsystem, not remain partially inline

Exit criteria:

- shell file contains no section-type editing JSX
- active content editor is selected through router only

## Phase 6: Replace Dirty Stringify

Remove hot-path dependency on:

- `stableStringify(formPayload)`
- `stableStringify(baseSnapshot)`

Implement:

- dirty path set
- path-aware update actions
- `isDirty = dirtyPaths.size > 0`

Rules:

- keep final payload serialization only at save time if needed
- if a field returns to its original value, dirty state must clear correctly

Exit criteria:

- no full payload stringify on every keystroke
- dirty state remains accurate through save, restore, and rehydrate flows

## Phase 7: Defer Preview Work

Update `preview-pane.tsx`:

- use `useDeferredValue` on the preview draft
- optionally use `startTransition` for expensive preview preparation

Rules:

- do not debounce canonical editor state
- only the preview subscription can lag slightly

Exit criteria:

- rapid typing no longer causes preview-driven jank

## Phase 8: Regression, Profiling, And Cleanup

Tasks:

- profile the same interactions from Phase 0
- remove dead helpers from the old monolith
- ensure import path compatibility for `components/section-editor-drawer.tsx`
- clean up stale comments that refer to old structure

Exit criteria:

- profiler shows meaningfully lower render cost
- all behaviors still work
- final structure is maintainable

## Suggested PR / Commit Structure

1. `refactor(editor): extract shared drawer field primitives`
2. `refactor(editor): extract version/common/preview panels`
3. `refactor(editor): isolate section editor resources`
4. `refactor(editor): introduce reducer-backed edit session`
5. `refactor(editor): extract built-in section editors and router`
6. `refactor(editor): extract custom composer editor`
7. `perf(editor): replace stringify dirty tracking with path-based tracking`
8. `perf(editor): defer preview updates and clean up shell`

If a single PR is required, still preserve these commit boundaries.
