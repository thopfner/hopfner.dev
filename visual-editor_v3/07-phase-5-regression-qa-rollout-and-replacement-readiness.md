# 07 Phase 5 Regression QA Rollout and Replacement Readiness

This is the release gate for the whole v3 effort.

## Phase Goal

Prove the visual editor is safe, truthful, and close to replacement-grade without causing regressions in the live app.

## Core Release Rule

Do not ship based on feature completeness alone.

The editor must also prove:

- renderer truthfulness
- persistence correctness
- parity coverage
- interaction stability
- rollout safety

## Required Test Matrix

### Contract Tests

- loader matches live schema columns
- preview merge order matches public renderer merge order
- `sections.formatting_override` is applied
- page-level formatting overrides are respected
- capability checks and parity registry stay aligned

### Persistence Tests

- save local draft
- publish local draft
- restore and rollback flows where applicable
- reorder persistence
- dirty-state reset after successful save
- failed save/publish preserves local state and surfaces a real error

### Visual-Editor Behavior Tests

- section selection
- section reorder with mouse
- section reorder with keyboard
- inline text editing commit and cancel
- CTA link editing
- direct-manipulation spacing/sizing commit and cancel
- undo/redo
- locked global-section behavior

### Representative Section Coverage

Use a coverage set that includes:

- hero
- CTA block
- card grid
- title/body list
- steps
- FAQ
- proof/testimonial section
- booking-oriented section
- at least one composed/custom section

## Manual QA Matrix

Run authenticated browser QA for:

- content-only edits
- formatting-only edits
- mixed content plus formatting edits
- CTA label plus link edits
- background media edits
- spacing and sizing handle interactions
- reorder plus save
- reorder plus publish
- undo/redo before save
- page with both local and global sections
- page with unsupported or partially supported section edge cases
- desktop and tablet viewport modes

## Rollout Plan

1. keep feature behind a default-off flag
2. enable for internal pilot only
3. validate on at least two real pages with materially different section mixes
4. compare editor output against live frontend for those pages
5. collect UX issues before broader admin exposure
6. only then consider making it the preferred path for selected admins

## Replacement-Readiness Checklist

The visual editor can only be considered a future default when:

- common authoring no longer depends on the form editor
- parity gaps are rare and documented
- direct editing is dependable
- token-based manipulation is dependable
- save/publish confidence is high
- manual QA regularly passes on representative pages
- admin users can complete normal editing tasks faster than before

## Build Gate

Require:

- clean production build in the actual target environment or a clean equivalent
- passing targeted tests for the new visual-editor code
- no console or network errors in authenticated admin QA during core flows

## Final Approval Standard

Approve the release only if it meets all three:

1. `Correct`
   Same content model, same renderer truth, same persistence meaning.

2. `Capable`
   Full practical parity plus direct editing for common tasks.

3. `Premium`
   Confident interactions, low friction, and strong recovery behavior.
