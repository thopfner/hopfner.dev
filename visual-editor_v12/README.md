# Visual Editor v12

## Scope

This batch fixes two narrow but important visual-editor regressions in product quality:

1. the section-type chrome in the top-left of each section must stop reading like a real layout row or fake section spacing
2. CTA links inside the visual editor must stop navigating away from the page

This batch is intentionally narrow. Do not expand it into broader shell redesign or CTA system refactoring.

## Hard Rules

1. Do not change the public frontend renderer behavior.
2. Do not change saved link values, link payload paths, or link-building semantics.
3. Do not patch every section CTA individually unless the preview-layer fix proves insufficient.
4. Fix navigation safety at the visual-editor preview layer first.
5. The section-type chrome must feel like editor chrome, not page content.
6. Do not proceed if the preview-layer solution breaks inline text editing, link editing, or section selection.

## Execution Order

1. Read `00-coding-agent-prompt.md`.
2. Read `01-root-causes-and-target-state.md`.
3. Execute `02-phase-1-overlay-chrome-and-link-safety.md`.
4. Finish with `03-qa-acceptance-and-stop-gates.md`.

## Phase Gates

There is one implementation phase in this batch.

Do not mark the batch complete until the single phase gate and the final QA gate both pass.

## Required Output From The Coding Agent

Return a completion report with:

1. exact files changed
2. exact tests added or updated
3. exact test/build commands run and results
4. manual QA results for both fixes
5. any blocker encountered

## Definition Of Done

This batch is complete only if all of the following are true:

1. the section-type label no longer visually reads as a separate row or fake section spacing
2. clicking CTA links in the visual editor never navigates away
3. inline CTA label editing still works
4. link-destination editing still works
5. section selection still works
6. `npm test -- tests/visual-editor` passes
7. `npm run build` passes
