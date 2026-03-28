# Phased Execution

This is the exact landing order for v18. Do not skip ahead to "cleanup" before the hotspot boundaries are fixed.

## Phase 0: Baseline And Evidence

Tasks:

- record React profiler baselines for:
  - typing in hero title
  - typing in card-grid card title
  - editing card-grid rich text
  - editing a custom composer card or FAQ answer
  - editing a footer grouped link label
  - switching a formatting control
- write a short evidence note in the PR or working log:
  - which components rerender
  - worst offending commits

Exit criteria:

- baseline evidence exists before code changes

## Phase 1: Shell Prop Stability

Files:

- `components/admin/section-editor/section-editor-drawer-shell.tsx`

Tasks:

- replace inline callback props passed into memoized shell children
- keep callback identities stable with `useCallback`
- verify `VersionStatusCard`, `CommonFieldsPanel`, `ContentEditorRouter`, and `PreviewPane` can actually skip rerenders when their data did not change

Exit criteria:

- no inline callback props remain on memoized shell children

## Phase 2: Path-Based Session Actions

Files:

- `components/admin/section-editor/use-section-editor-session.ts`
- `components/admin/section-editor/dirty-paths.ts`

Tasks:

- implement exact path writes for content and formatting
- remove hot-path deep serialization from dirty updates
- keep hydrate / reset / save compatibility unchanged

Exit criteria:

- no `stableStringify()` or equivalent deep compare remains in the edit-time formatting/content dirty path
- reducer actions can describe exact field writes

## Phase 3: Router Slice Contracts

Files:

- `components/admin/section-editor/content-editor-router.tsx`
- relevant editor prop types

Tasks:

- stop passing full generic content plus generic whole-content mutation into heavy editors
- adapt exact session actions to editor-specific typed props

Exit criteria:

- heavy editors receive only the slices and callbacks they need

## Phase 4: Heavy Editor Isolation

Files:

- `card-grid-editor.tsx`
- `custom-composer-editor.tsx`
- `footer-grid-editor.tsx`
- `hero-cta-editor.tsx`

Tasks:

- extract row/block subcomponents
- wrap row/block subcomponents in `memo`
- add local buffered field state where needed

Priority order:

1. `card-grid-editor.tsx`
2. `custom-composer-editor.tsx`
3. `footer-grid-editor.tsx`
4. `hero-cta-editor.tsx`

Exit criteria:

- typing in one row does not rerender sibling rows in profiler

## Phase 5: Rich Text Stability

Files:

- `components/admin/section-editor/fields/tiptap-json-editor.tsx`
- any row/block components that host TipTap

Tasks:

- keep editor instance stable
- avoid unnecessary content resets
- optionally delay commits for large rich-text payloads

Exit criteria:

- editing one rich-text field does not feel unstable during unrelated updates

## Phase 6: Preview Pipeline Cleanup

Files:

- `components/admin/section-editor/preview-pane.tsx`
- `components/admin/section-preview.tsx`

Tasks:

- keep preview off the hot typing path
- remove redundant double-lag behavior

Exit criteria:

- preview remains responsive enough
- preview no longer adds avoidable complexity or duplicate lag layers

## Phase 7: Regression, Build, And Final Profiling

Tasks:

- re-run the same profiler scenarios from Phase 0
- run build and any available lint/tests
- verify save / publish / restore / delete draft still behave correctly

Exit criteria:

- before/after profiler evidence exists
- the lag reduction is visible in actual editing scenarios
- behavior remains correct

## Suggested Commit Boundaries

1. `perf(editor): stabilize shell callbacks and panel memo boundaries`
2. `perf(editor): introduce path-based session writes and exact dirty tracking`
3. `perf(editor): convert router to slice-based editor contracts`
4. `perf(editor): isolate card grid and custom composer row rendering`
5. `perf(editor): isolate footer and hero editor rows`
6. `perf(editor): harden TipTap bridge and simplify preview pipeline`
7. `test(editor): profile, verify behavior, and clean up`
