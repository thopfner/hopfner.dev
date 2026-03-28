# Visual Editor v17

## Scope

This batch is a correction and alignment pass. It exists to bring the current visual-editor result back into line with the original product intent after the v16 implementation drifted in a few important ways.

In scope:

1. unify composed-section support truth so canvas and inspector use the same exact support decision
2. make the page-workspace footer persistent and product-grade instead of conditional-only
3. improve structure-rail readability and restore explicit locked/global semantics
4. add real behavior proof for the touched UX paths

Out of scope:

1. public frontend renderer changes
2. new CMS persistence models
3. new visual-editor capabilities
4. broad shell redesign
5. rich-text or drag-and-drop architecture changes

## Hard Rules

1. Do not let canvas and inspector use different support logic for composed sections.
2. Do not keep the page-workspace action area hidden when the page is clean. Make it persist and communicate state clearly.
3. Do not make the structure rail denser while trying to improve it.
4. Do not weaken locked/global semantics for reusable sections.
5. Do not count source-string or import-only tests as the main proof for this batch.
6. Do not proceed to the next phase until the current gate passes.

## Execution Order

1. Read `00-coding-agent-prompt.md`.
2. Read `01-audit-alignment-gaps-and-target-state.md`.
3. Execute `02-phase-1-composed-support-truth.md`.
4. Execute `03-phase-2-page-workspace-footer-and-state.md`.
5. Execute `04-phase-3-structure-rail-readability-and-lock-semantics.md`.
6. Finish with `05-qa-acceptance-and-stop-gates.md`.

## Phase Gates

1. Phase 1 gate: schema-backed composed sections and unsupported composed sections are classified identically on canvas and in the inspector.
2. Phase 2 gate: page settings always have a visible sticky footer with clear clean/dirty state, and the page workspace still feels premium.
3. Phase 3 gate: the structure rail is easier to scan, and global locked sections communicate both meanings clearly.

Do not mark this batch complete until all three phase gates and the final QA gate pass.

## Required Output From The Coding Agent

Return a completion report with:

1. exact files changed
2. the exact shared composed-support helper or path introduced
3. the exact page-workspace footer behavior before and after
4. the exact rail readability and lock/global semantics changes
5. the exact tests added or upgraded
6. the exact command results for required checks
7. any blocker that forced a stop, with the exact file and unsupported path

## Definition Of Done

This batch is complete only if all of the following are true:

1. composed-section support truth is shared between canvas and inspector
2. schema-backed composed sections never show a misleading unsupported state
3. unsupported composed sections still show a truthful fallback
4. page settings always expose a visible sticky footer with clear status
5. the structure rail is easier to scan on long pages
6. global locked sections communicate both “global” and “locked”
7. touched UX paths are proven by behavior-oriented tests
8. `npm test -- tests/visual-editor` passes
9. `npm run build` passes
