# Claude Execution Prompt

You are working in `/var/www/html/hopfner.dev-main`.

The v17 refactor landed, but the editor drawer is still laggy because the key runtime isolation work is incomplete. This pass is not another extraction exercise. It is a targeted performance polish pass to finish the architecture.

Current verified facts:

- `components/section-editor-drawer.tsx` is now a thin compatibility export
- the shell/resources/session/router/editor split exists
- the drawer still has these concrete gaps:
  - `components/admin/section-editor/dirty-paths.ts:8-14` still deep-compares objects via `stableStringify()`
  - `components/admin/section-editor/dirty-paths.ts:80-107` still deep-compares full `formatting` and `content` on edits
  - `components/admin/section-editor/use-section-editor-session.ts:186-190` still exposes whole-content actions instead of exact path actions
  - `components/admin/section-editor/content-editor-router.tsx:22-63` still transports a full generic `content` object into editors
  - `components/admin/section-editor/section-editor-drawer-shell.tsx:322-375` still passes unstable inline callbacks into memoized children
  - the largest active editors are still monolithic:
    - `custom-composer-editor.tsx`: 933 lines
    - `footer-grid-editor.tsx`: 521 lines
    - `card-grid-editor.tsx`: 488 lines
  - `components/admin/section-editor/fields/tiptap-json-editor.tsx:60-70` still commits canonical state on every TipTap update

Your job:

1. start with profiler evidence for the current drawer
2. stabilize shell callback props so extracted panels can actually skip rerenders
3. replace whole-content reducer writes with exact path-based session actions
4. remove hot-path full-object dirty comparisons
5. convert the router to slice-based editor contracts
6. split the heavy editors into memoized row/block subcomponents
7. add buffered field commits where they materially reduce typing latency
8. harden `TipTapJsonEditor`
9. keep preview off the hot typing path without double-lag complexity
10. end with profiler evidence and behavioral verification

Non-negotiable constraints:

- do not change the save / publish / restore / delete draft payload contract
- do not count another file extraction as a performance fix
- do not keep deep object serialization in the edit-time dirty path
- do not keep heavy editors as single giant controlled trees
- do not add a blanket debounce around the entire editor session
- do not claim completion without profiler evidence

Implementation bar:

- typing in one card-grid row should not rerender sibling rows
- typing in one custom composer block should not rerender unrelated blocks
- memoized shell panels should not rerender because of fresh inline handler props
- dirty state should update exactly and cheaply
- rich text editors must remain stable during unrelated updates

Priority order:

1. shell prop stability
2. path-based session actions and dirty tracking
3. card-grid and custom-composer row isolation
4. footer-grid and hero row isolation
5. TipTap bridge hardening
6. preview pipeline cleanup

If you must land in phases, stop only at a real phase boundary with:

- passing build
- no behavior regression in the touched path
- a short note describing what profiler change was achieved and what remains

Do not stop after another extraction-only pass.
