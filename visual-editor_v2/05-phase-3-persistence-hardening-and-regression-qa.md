# 05 Phase 3 Persistence Hardening and Regression QA

This phase is the release gate.

## Phase Goal

Prove that the corrected visual editor is safe to expose to admins as an internal pilot.

## Core Rule

No release based on appearance alone.

The feature must prove:

- correct reads
- correct writes
- correct publish behavior
- truthful preview
- safe fallback to the form editor

## Persistence Guidance

For v2, do not redesign persistence.

Use:

- current payload helpers
- current table semantics
- current RPC semantics

Recommendation:

- keep a dedicated visual-editor persistence adapter
- make it call the same argument shapes and perform the same validation steps as the current form editor
- if a shared helper is extracted, do it only as a pure helper with test coverage

Do not rewrite the old editor to chase elegance.

## Test Matrix

### Loader tests

- page load success path
- page load schema error path
- custom/composed classification
- whitelist hydration
- override hydration

### Persistence tests

- save local draft
- publish local draft
- publish failure surfaces real error
- save blocked for global node
- save-order failure restores clear error state

### UI state tests

- save-and-switch clears dirty state
- unsaved selection prompt cancel path
- unsaved selection prompt discard path
- form-editor fallback link
- feature flag hides route entry point

### Render truth tests

For representative built-ins:

- `hero_cta`
- `card_grid`
- `steps_list`
- `title_body_list`
- `faq_list`
- `cta_block`
- `social_proof_strip`
- `proof_cluster`
- `case_study_split`
- `booking_scheduler`

These tests should assert the visual editor uses the same effective preview contract, not pixel-perfect snapshots.

## Manual QA Matrix

Run authenticated browser QA for:

- page with local built-in sections only
- page with both local and global sections
- page with custom/composed section present
- reorder only
- formatting-only save draft
- formatting-only publish
- save-and-switch prompt
- disabled feature-flag path

## Rollout Recommendation

1. default flag off
2. enable only in a pilot environment
3. verify at least two real pages with different section mixes
4. keep the form editor as the default path
5. only then consider a broader admin rollout

## Build Gate

The build must complete cleanly in the actual target environment.

Because the current server checkout is dirty and the build recently stalled late in the process, do not treat "compiled successfully" as enough. Require a full zero-exit build in the exact deployment path or in a clean matching environment.

## Exit Criteria

- feature flag defaults off
- loader and publish path are correct
- preview is truthful
- drag/drop feels premium
- tests cover actual visual-editor files
- full build exits cleanly
- manual admin QA passes
