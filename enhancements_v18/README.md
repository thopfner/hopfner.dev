# Section Editor Drawer v18 Polish Pass

Target:

- repo: `/var/www/html/hopfner.dev-main`
- compatibility entry: `components/section-editor-drawer.tsx`
- current shell: `components/admin/section-editor/section-editor-drawer-shell.tsx`

Verified state on 2026-03-08:

- the v17 extraction did land:
  - `components/section-editor-drawer.tsx` is now a thin compatibility export
  - `section-editor-drawer-shell.tsx`, `use-section-editor-resources.ts`, `use-section-editor-session.ts`, `content-editor-router.tsx`, and per-type editor files now exist
- the drawer still feels slow because the highest-value performance work is still incomplete:
  - dirty tracking still deep-compares `content` and `formatting` with `stableStringify()`
  - the session API still mutates whole `content` objects instead of exact paths/slices
  - large active editors still rebuild large arrays and JSX trees on each keystroke
  - memoized shell panels still receive unstable inline callbacks
  - there is no profiler evidence in the repo that the Phase 0 / Phase 8 requirements were completed

This pack is the exact next pass. It is not another extraction brief. It is the implementation brief for finishing the performance work that v17 left incomplete.

## Read Order

1. `01-current-state-review.md`
2. `02-exact-polish-pass-plan.md`
3. `03-target-performance-architecture.md`
4. `04-phased-execution.md`
5. `05-claude-execution-prompt.md`
6. `06-acceptance-and-profiling.md`

## Core Goal

Make the section editor drawer feel production-grade under real editing load by finishing the structural performance work:

- exact dirty tracking with no full-object stringify in the hot edit path
- path-aware session updates instead of whole-content replacement
- memoized row/block boundaries inside the heavy editors
- buffered field commits where appropriate
- stable shell props so extracted panels can actually skip rerenders
- preview work isolated from typing
- rich text editors stable during unrelated edits

## Non-Negotiable Constraints

- no payload contract change for save / publish / restore / delete draft flows
- no cosmetic refactor counted as a performance fix
- no claiming success without React profiler evidence
- no broad state-library rewrite
- no behavior regression for built-in section types or custom composer types
