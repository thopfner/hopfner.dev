# Visual Editor v16

## Scope

This batch is a premium polish and consistency pass. It exists to move the visual editor from “strong internal tool” toward “elite SaaS editing product” without widening into a new capability sprint.

In scope:

1. reduce on-canvas chrome noise and improve section selection hierarchy
2. productize the structure rail and page settings panel so they feel premium and information-rich rather than form-like
3. remove the current composed-section canvas dead-end for schema-backed composed sections
4. add stronger behavior proof for touched UX paths

Out of scope:

1. public frontend renderer changes
2. new persistence models
3. broad drag-and-drop architecture changes
4. rich-text editor redesign
5. collaboration, comments, approvals, or multi-user presence

## Hard Rules

1. Do not widen this into a general visual-editor redesign.
2. Do not add more badges, chips, or labels than you remove. The goal is stronger hierarchy with less noise.
3. Do not regress the current sticky workspace behavior or the current large-text editing behavior.
4. Do not keep the composed-section inspector path while still hard-blocking the same section on canvas when a valid schema exists.
5. Do not claim completion based on screenshot-only or source-string-only evidence.
6. Do not proceed to the next phase until the current gate passes.

## Execution Order

1. Read `00-coding-agent-prompt.md`.
2. Read `01-live-qa-findings-and-target-state.md`.
3. Execute `02-phase-1-canvas-chrome-and-structure-rail-polish.md`.
4. Execute `03-phase-2-page-workspace-and-actions-productization.md`.
5. Execute `04-phase-3-composed-section-canvas-truthfulness.md`.
6. Finish with `05-qa-acceptance-and-stop-gates.md`.

## Phase Gates

1. Phase 1 gate: the canvas and structure rail have clearer hierarchy and less chrome noise without losing function.
2. Phase 2 gate: page-level workspace surfaces feel productized and primary actions remain obvious at common editor sizes.
3. Phase 3 gate: schema-backed composed sections are no longer visually blocked on canvas while still being editable in the current visual-editor workflow.

Do not mark this batch complete until all three phase gates and the final QA gate pass.

## Required Output From The Coding Agent

Return a completion report with:

1. exact files changed
2. exact UI elements removed, consolidated, or restyled in the canvas chrome
3. exact structure-rail and page-panel hierarchy changes
4. exact composed-section blocking path removed or narrowed
5. exact tests added or upgraded
6. exact command results for required checks
7. any blocker that forced a stop, with the exact file and unsupported path

## Definition Of Done

This batch is complete only if all of the following are true:

1. section selection chrome feels lighter and more intentional
2. the structure rail communicates section identity and status more clearly than it does now
3. the page settings panel feels like a product surface, not a raw admin form
4. primary save/publish actions remain discoverable at common laptop viewport sizes
5. schema-backed composed sections are not visually blocked on canvas
6. touched UX paths are covered by behavior-oriented tests
7. `npm test -- tests/visual-editor` passes
8. `npm run build` passes
