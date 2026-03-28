# Visual Editor v19

## Scope

This batch is a focused polish and truthfulness correction pass.

It exists to fix the remaining visual-editor regressions that still make the product feel less premium than the public frontend it is supposed to represent.

In scope:

1. remove the false top-row chrome that makes the section type pill read like real page spacing
2. make section chrome feel like overlay chrome, not layout content
3. finish the page-footer stability work so clean and dirty states keep the same structural footprint
4. add proof and QA gates strong enough to catch this exact regression in the future

Out of scope:

1. new editor capabilities
2. frontend renderer changes
3. new persistence or CMS schema changes
4. broad visual-editor redesign
5. unrelated inspector or composition work

## Hard Rules

1. Do not solve the section-gap regression by changing real section spacing tokens or renderer spacing.
2. Do not leave the type chip in a full-width top row.
3. Do not make chrome look like content or content look like chrome.
4. Do not regress v18’s improved global/locked semantics.
5. Do not keep the page footer structurally different between clean and dirty states.
6. Do not use only pure resolver tests as proof for this batch.
7. Do not proceed to the next phase until the current gate passes.

## Execution Order

1. Read `00-coding-agent-prompt.md`.
2. Read `01-audit-gap-and-target-state.md`.
3. Execute `02-phase-1-section-chrome-anchoring-and-gap-removal.md`.
4. Execute `03-phase-2-page-footer-true-stability.md`.
5. Execute `04-phase-3-proof-and-visual-qa-hardening.md`.
6. Finish with `05-qa-acceptance-and-stop-gates.md`.

## Phase Gates

1. Phase 1 gate: selected and hovered sections no longer display a false top gutter or artificial row that is not present in the frontend rendering.
2. Phase 2 gate: page footer keeps the same visual structure and slot footprint in both clean and dirty states.
3. Phase 3 gate: the batch is covered by rendered behavior proof plus manual visual QA targeted at the exact regression.

Do not mark this batch complete until all three phase gates and the final QA gate pass.

## Required Output From The Coding Agent

Return a completion report with:

1. exact files changed
2. the exact old node-chrome layout and the exact new layout
3. the exact footer slot structure in clean and dirty states
4. the exact tests added or rewritten, by user-facing scenario
5. the exact manual QA performed against the section-gap regression
6. the exact command results for required checks
7. any blocker or compromise, with the exact file and reason

## Definition Of Done

This batch is complete only if all of the following are true:

1. section chrome no longer creates the appearance of extra spacing above the section
2. the section type chip reads as overlay chrome, not as a separate content row
3. action chrome also reads as overlay chrome, not as layout content
4. global/locked and dirty semantics remain explicit and lightweight
5. page footer uses one stable structure in both clean and dirty states
6. the regression is covered by stronger proof than pure presentation-state resolver tests
7. manual visual QA confirms the selected section matches the intended overlay behavior
8. `npm test -- tests/visual-editor` passes
9. `npm run build` passes
