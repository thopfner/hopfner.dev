# Visual Editor v18

## Scope

This batch is a premium-finish alignment pass.

It exists to close the remaining gap between "works well" and "elite product surface" without widening into another feature sprint.

In scope:

1. replace weak source-inspection tests with real behavior proof for the touched visual-editor surfaces
2. make the page-workspace footer/action model feel persistent and intentional in both clean and dirty states
3. align canvas chrome semantics with the stronger structure-rail semantics so state is communicated consistently
4. remove the last internal-tool cues from the touched surfaces without changing the frontend renderer or CMS contracts

Out of scope:

1. public frontend renderer changes
2. new page-composition capabilities
3. schema redesign for composed sections
4. new persistence models
5. broad layout redesign of the visual editor

## Hard Rules

1. Do not add new product scope to this batch.
2. Do not regress the current v17 behavior that already works.
3. Do not rely on source-string or import-only tests as the main proof.
4. Do not make the page footer visually jump between clean and dirty states.
5. Do not leave state semantics inconsistent between canvas chrome and the structure rail.
6. Do not proceed to the next phase until the current gate passes.

## Execution Order

1. Read `00-coding-agent-prompt.md`.
2. Read `01-audit-premium-finish-gaps-and-target-state.md`.
3. Execute `02-phase-1-proof-quality-and-test-hardening.md`.
4. Execute `03-phase-2-page-workspace-action-consistency.md`.
5. Execute `04-phase-3-canvas-chrome-semantics-and-premium-polish.md`.
6. Finish with `05-qa-acceptance-and-stop-gates.md`.

## Phase Gates

1. Phase 1 gate: touched v18 behaviors are proven by behavior-oriented tests, not source inspection.
2. Phase 2 gate: page-workspace footer is visually persistent and action-consistent in both clean and dirty states.
3. Phase 3 gate: canvas chrome, rail semantics, and quick-scan status language tell one consistent story.

Do not mark this batch complete until all three phase gates and the final QA gate pass.

## Required Output From The Coding Agent

Return a completion report with:

1. exact files changed
2. the exact weak tests removed or rewritten
3. the exact clean-state and dirty-state footer behavior after the change
4. the exact state-semantics changes made to canvas chrome
5. the exact tests added, by user scenario
6. the exact command results for required checks
7. any blocker that forced a stop, with the exact file and contract mismatch

## Definition Of Done

This batch is complete only if all of the following are true:

1. touched v18 surfaces are covered by behavior-oriented tests
2. the page-workspace footer always stays visible and keeps the same action structure
3. clean state is explicit without hiding the primary action area
4. dirty state is explicit without changing footer hierarchy
5. canvas chrome communicates global and locked semantics clearly, not by icon shorthand alone
6. rail and canvas use compatible state language and signals
7. the touched UI feels more premium and less like an internal tool
8. `npm test -- tests/visual-editor` passes
9. `npm run build` passes
