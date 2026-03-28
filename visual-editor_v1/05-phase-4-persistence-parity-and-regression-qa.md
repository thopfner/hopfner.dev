# 05 Phase 4 Persistence, Parity, and Regression QA

This phase is the release gate. No launch without passing it.

## Phase Goal

Prove that the new visual editor is architecturally safe and operationally regression-free relative to the current system.

## Release Principle

The old editor staying available is not enough.

The new editor must prove:

- data parity
- visual parity
- persistence parity
- global-content safety
- route-level stability

## Required Test Coverage

The repo currently has almost no app-level tests. That means this feature must bring its own regression harness.

### Unit / Integration Tests

Required minimum set:

- visual loader normalization
- canonical-store to Craft-node projection
- selected-section dirty-state transitions
- inspector token mapping
- preset application
- save-draft payload shape
- publish adapter call arguments
- reorder persistence mapping
- global lock behavior
- unsupported custom/composed behavior

### Render Fidelity Tests

Add admin-side render tests for representative built-in sections:

- `hero_cta`
- `card_grid`
- `steps_list`
- `title_body_list`
- `rich_text_block`
- `label_value_list`
- `faq_list`
- `cta_block`
- `social_proof_strip`
- `proof_cluster`
- `case_study_split`
- `booking_scheduler`

The purpose is not screenshot-perfect pixel tests. The purpose is to prove the visual editor preview still invokes the same section component contract and token resolution path.

### Manual QA Matrix

Run a structured QA pass for each of these states:

- local built-in section with published version only
- local built-in section with draft version
- global linked section
- page containing mixed local and global sections
- page containing unsupported custom/composed section
- page reorder with filters absent
- save draft after token edits
- publish after token edits
- back navigation to current form editor

## Exact Parity Checks

For at least one page per major section mix:

1. open current form editor
2. inspect current published output
3. make the same token change in visual editor
4. save draft
5. publish
6. compare frontend result

The published frontend must remain identical in semantics because the persisted payload and renderer are unchanged.

## Build and Runtime Gates

Required commands before release:

- dependency install cleanly resolves Craft.js package versions
- `npm run build`
- targeted test run for visual editor test files
- manual admin smoke test in browser

If any Craft-related hydration or runtime error appears:

- stop rollout
- pin or replace the dependency
- do not ship "mostly working"

## Logging and Diagnostics

Add lightweight console-safe diagnostics during initial rollout:

- route load failure
- failed preview projection
- save adapter failure
- publish adapter failure
- reorder persistence failure

Do not spam logs. Emit actionable structured signals.

## Rollout Strategy

Recommended rollout:

1. ship behind admin feature flag
2. enable only for internal admin use
3. validate on representative pages
4. keep current form editor as default route
5. graduate visual editor only after parity confidence is real

Do not make the visual editor the default page editor in the first release.

## Rollback Strategy

Rollback path must stay one-step simple:

- disable feature flag
- leave old route and old editor untouched

No DB rollback should be required for v1 because no schema changes are needed.

## Exit Criteria

Do not call the feature releasable until all are true:

- no public renderer changes were required
- no schema changes were required
- current page editor behavior is unchanged
- local built-in section edits save and publish safely
- global sections are protected
- unsupported states are explicit
- build passes
- new test suite passes
- manual parity matrix passes
