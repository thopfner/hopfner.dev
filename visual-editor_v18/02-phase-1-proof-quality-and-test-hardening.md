# Phase 1: Proof Quality And Test Hardening

## Goal

Replace weak source-inspection proof for the touched v17 surfaces with behavior-oriented tests that validate real render and interaction outcomes.

## Files To Change, In Order

1. `tests/visual-editor/v17-alignment-corrections.test.ts`
2. any existing visual-editor test utilities already used elsewhere in the suite
3. if needed, one new focused test file for page-workspace or canvas semantics

## Source Workflows And Files To Reuse

1. reuse the current Vitest testing stack already used in `tests/visual-editor`
2. reuse any existing render helpers already present in the visual-editor tests
3. keep `isComposedSectionSupported` helper tests, but do not let them be the only meaningful proof

## Step-By-Step Implementation

1. Review `tests/visual-editor/v17-alignment-corrections.test.ts` and identify every test that only inspects source text instead of rendered behavior.
2. Keep the helper-level `isComposedSectionSupported` truth tests because they are legitimate.
3. Replace the source-inspection tests for page panel behavior with render-state tests that prove:
   - the footer is always rendered
   - clean state and dirty state both render the footer
   - the intended buttons and statuses appear in the correct state
4. Replace the source-inspection tests for structure/canvas semantics with render-state tests that prove:
   - global sections expose explicit global/locked semantics where required
   - unsaved state is visible when a node is dirty
   - title clamping/readability expectations are present through rendered class/state assertions, not file-content reads
5. If the current component boundaries make behavior testing impossible, extract the smallest pure presentation helper needed for testability. Do not refactor unrelated architecture.
6. Remove or reduce any source-string tests that are now redundant.

## Required Behavior

1. the v18 completion report can cite real behavior tests for the touched surfaces
2. the suite meaningfully proves page footer states and state semantics
3. the helper tests remain, but no longer carry the whole validation burden

## What Must Not Change In This Phase

1. do not change product behavior yet unless a testability helper is strictly necessary
2. do not widen into a new testing architecture
3. do not keep duplicate weak tests once stronger tests exist

## Required Tests For The Phase

1. helper truth tests for composed support
2. render-state tests for page footer clean vs dirty states
3. render-state tests for global/locked semantics and dirty-state visibility in touched UI

## Gate For Moving Forward

Do not proceed to Phase 2 until all of the following are true:

1. source-string inspection is no longer the main proof for the touched surfaces
2. clean and dirty footer states are behavior-tested
3. state-semantics rendering is behavior-tested
4. `npm test -- tests/visual-editor` passes
