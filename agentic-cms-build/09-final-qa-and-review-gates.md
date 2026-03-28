# Final QA And Review Gates

## Automated Checks

Required commands when the relevant surfaces exist:
- `npm run test`
- `npm run build`
- deployment/runtime verification for app + worker
- any targeted worker/job commands added during implementation

For later phases, also require:
- targeted tests for command-layer behavior
- targeted tests for job lifecycle behavior
- targeted tests for snapshot/apply/rollback behavior
- targeted tests for media generation and media registration behavior

## Manual QA

Phase-by-phase manual QA:

- Phase 1:
  - create a page through the existing admin UI
  - add/duplicate/reorder/save/publish a section through existing editor flows
  - apply a theme preset and confirm no regression

- Phase 2:
  - enqueue a no-op job
  - observe worker pickup, completion, restart recovery, and cancel path

- Phase 3:
  - submit a seeded prompt
  - confirm draft-only site changes
  - open touched pages in the visual editor
  - rollback and confirm restoration

- Phase 4:
  - create a job from the new workspace
  - inspect status/logs/touched pages
  - open a generated page in the visual editor
  - trigger rollback from the workspace

- Phase 5:
  - generate an image
  - confirm it appears in the media library
  - attach it to a draft section
  - verify failed generation leaves no orphan state

- Phase 6:
  - verify config error handling
  - verify retry/cancel behavior
  - verify multiple job submissions respect concurrency limits

## Required Test Additions

- command-layer tests
- job queue and worker lifecycle tests
- orchestration plan/apply/rollback tests
- admin workspace tests
- media generation and registration tests
- regression tests for preserved editor and publish behavior

## Completion Report Required From The Coding Agent

At the end of each phase, require:
- changed files
- tests run
- manual QA completed
- screenshots / browser evidence if UI changed
- unresolved risks
- explicit statement that the next phase was not started

## Explicit Non-Goals

- no auto-publish
- no custom section type generation
- no public worker ingress
- no browser-to-shell runtime
- no central control plane

## Final Stop Gate

Do not claim completion until:
- all phase gates have been individually passed
- the final regression suite passes
- the final manual QA pack passes
- the final completion report names no unreviewed drift from this roadmap
