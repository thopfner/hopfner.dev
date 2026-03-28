# Phase 3: Proof And Visual QA Hardening

## Goal

Add the right proof for this class of regression so the editor cannot quietly drift back into visually untruthful chrome placement.

## Files To Change, In Order

1. the tests added or touched in Phase 1 and Phase 2
2. any tiny extracted presentational helper needed for rendered testability

## Source Workflows And Files To Reuse

1. reuse the v18 presentation-state approach where it helps
2. add rendered component tests where pure resolvers are not enough
3. keep the visual-editor suite focused and maintainable

## Step-By-Step Implementation

1. Keep the pure resolver tests where they are useful.
2. Add at least one rendered component test for the node chrome itself.
3. The node-chrome test must prove the new anchoring model:
   - no full-width top-row container
   - independent edge-docked chip/actions chrome
4. Add rendered tests for the page footer structure so the clean/dirty slot layout is asserted at the component level, not only via resolver output.
5. Perform manual visual QA in the live editor on a section like `Card Grid`.
6. Include before/after reasoning in the completion report so the reviewer can compare against the exact regression.

## Required Behavior

1. this batch is protected by stronger proof than v18
2. the exact regression shown in the screenshot is explicitly covered by QA
3. the next reviewer can trust the completion report

## What Must Not Change In This Phase

1. do not rely only on resolver tests
2. do not add broad screenshot infrastructure if a focused rendered test is enough
3. do not bloat the test suite with duplicate assertions

## Required Tests For The Phase

1. rendered node-chrome test
2. rendered page-footer structure test
3. existing resolver tests updated only where necessary to stay truthful

## Gate For Moving Forward

Do not mark the batch complete until all of the following are true:

1. rendered proof exists for the touched UI
2. manual visual QA was performed against the section-gap regression
3. the phase tests pass
