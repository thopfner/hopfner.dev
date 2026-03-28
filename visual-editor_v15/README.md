# Visual Editor v15

## Scope

This batch is a focused UX hardening pass. It exists to close two remaining workflow defects that undermine an otherwise strong visual-editor experience.

In scope:

1. keep the visual-editor header bar frozen and always visible when users select sections from the left rail
2. refine the single-line text overlay editor so it is as readable and comfortable as the now-good large-text overlay
3. replace any weak proof in the touched areas with behavior tests or explicit helper tests

Out of scope:

1. public frontend renderer changes
2. broad visual-editor shell redesign
3. rich-text editor redesign
4. inspector information architecture changes unrelated to these two issues
5. new page-builder capabilities

## Hard Rules

1. Do not patch this with only cosmetic class changes. Fix the workspace height and scroll contract correctly.
2. Do not rely on `scrollIntoView` if it can still affect the wrong scroll container.
3. Do not regress the current large-text overlay experience while improving small/single-line text editing.
4. Do not reintroduce a second text-edit architecture.
5. Do not claim completion based on build-only evidence or source-string checks.
6. Do not proceed to the next phase until the current gate passes.

## Execution Order

1. Read `00-coding-agent-prompt.md`.
2. Read `01-quick-qa-findings-and-target-state.md`.
3. Execute `02-phase-1-sticky-workspace-chrome-and-canvas-scroll.md`.
4. Execute `03-phase-2-single-line-overlay-readability.md`.
5. Finish with `04-qa-acceptance-and-stop-gates.md`.

## Phase Gates

1. Phase 1 gate: selecting sections from the left rail scrolls only the canvas, and the visual-editor toolbar remains persistently visible.
2. Phase 2 gate: single-line plain-text editing uses the existing overlay architecture but with an editor-safe readability treatment that avoids truncation and oversized display styling.

Do not mark this batch complete until both phase gates and the final QA gate pass.

## Required Output From The Coding Agent

Return a completion report with:

1. exact files changed
2. the exact workspace height/overflow contract after the fix
3. the exact section-selection scroll path after the fix
4. the exact overlay readability treatment introduced for single-line fields
5. the exact tests added or upgraded
6. the exact command results for the required checks
7. any blocker that forced a stop, with the exact file and unsupported path

## Definition Of Done

This batch is complete only if all of the following are true:

1. the visual-editor toolbar remains visible while selecting and navigating sections from the left rail
2. section selection scrolls the canvas intentionally and does not rely on browser/default container behavior
3. single-line text editing no longer feels truncated, oversized, or harder to read than large-text editing
4. large-text overlay behavior remains as good as it is now
5. touched areas are covered by real behavior or helper tests
6. `npm test -- tests/visual-editor` passes
7. `npm run build` passes
