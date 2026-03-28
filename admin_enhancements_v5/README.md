# Admin Enhancements v5

## Phase 2.2 Proof-Only Cleanup

This is a proof-quality cleanup for Phase 2.1.

Do not broaden scope.
Do not redesign any admin route.
Do not change collection-page runtime behavior unless a minimal non-behavioral testability export is absolutely required.

The goal is simple:

Phase 2.1 already fixed the Bookings and Blog behavior.
This batch upgrades the proof so Phase 2 can clear at near-A grade before Phase 3 starts.

## Scope

Only these items are in scope:

1. replace weak source-inspection tests for Bookings and Blog with rendered behavior tests
2. keep any remaining lightweight scaffold-presence tests only if they are clearly labeled as smoke tests
3. prove the exact Phase 2.1 outcomes in a way that would fail on regression

Out of scope:

1. any production UI redesign
2. any API or data-contract change
3. any route work outside Bookings and Blog
4. any Phase 3 workspace work

## Current Weakness To Fix

The current test file:

- `tests/admin-foundation/collection-pages.test.ts`

still relies on:

- `fs.readFileSync(...)`
- `source.toContain(...)`

for the exact Bookings and Blog fixes from Phase 2.1.

That is not strong enough proof.

## Required Result

When this batch is done, the codebase must have real rendered behavior tests proving:

1. Bookings renders a mobile card/list fallback on narrow screens
2. Bookings still renders a desktop table on wider screens
3. Bookings detail information can be revealed from both views
4. Blog renders `AdminLoadingState` while loading
5. Blog does not render the empty state while still loading
6. Blog transitions from loading to content correctly

## Files To Change

Primary:

1. `tests/admin-foundation/collection-pages.test.ts`
2. new focused test files for Bookings and Blog, if needed

Allowed only if absolutely required for testability:

3. `app/admin/(protected)/bookings/page-client.tsx`
4. `app/admin/(protected)/blog/page-client.tsx`

If you touch runtime files, the change must be non-behavioral and purely to expose stable test hooks or extract pure helpers. If that is not clearly true, stop and do not make the change.

## Exact Implementation Steps

### Step 1: Stop Using Source Inspection For The Phase 2.1 Fixes

In `tests/admin-foundation/collection-pages.test.ts`:

1. remove the Bookings-specific assertions that prove behavior by reading source strings
2. remove the Blog loading-state assertions that prove behavior by reading source strings
3. keep only minimal scaffold smoke coverage there if you want to retain route-level structural checks

Do not leave fake “behavior tests” that still inspect source text.

### Step 2: Add Real Bookings Behavior Tests

Create a focused rendered test file for the Bookings route.

Required test coverage:

1. while loading, `Loading submissions…` is shown inside the main panel
2. when no data returns, `No submissions yet` appears
3. on desktop, the route renders a real table structure:
   - table headers are present
   - summary row is visible
   - clicking the row reveals detail content
4. on mobile, the route renders card/list items instead of the desktop table
5. on mobile, tapping a card reveals the same detail content

Implementation guidance:

1. render `BookingsPageClient`
2. mock `fetch("/admin/api/bookings")`
3. control breakpoint behavior explicitly:
   - either mock `@mui/material/useMediaQuery`
   - or provide a stable `window.matchMedia` strategy
4. assert actual rendered output, not implementation strings

Do not try to prove “valid table markup” via source grep.
The rendered desktop branch proving rows inside one table is enough for this batch.

### Step 3: Add Real Blog Loading-State Tests

Create a focused rendered test file for the Blog route.

Required test coverage:

1. initial loading state shows `Loading articles…`
2. empty-state content is not shown during loading
3. after a successful response with rows, article content is rendered
4. after a successful response with no rows, the correct empty state is rendered

Implementation guidance:

1. render `BlogPageClient`
2. mock the list fetch for:
   - delayed loading
   - populated response
   - empty response
3. if the route performs extra fetches only when action buttons are used, do not broaden the test into those flows
4. keep the tests narrowly focused on the loading/content transition

### Step 4: Keep The Proof Narrow

Do not try to fully test every action menu, dialog, or mutation path in this batch.

This batch is complete when the specific Phase 2.1 corrections are proven by rendered behavior.

## Hard Rules

1. do not change Bookings or Blog route behavior just to make tests easier
2. do not replace this with more source-string assertions
3. do not move into Phase 3
4. do not change Pages or Media in this batch
5. do not change admin shell or shared scaffolds in this batch

## Required Validation

Run exactly:

```bash
npm test -- tests/admin-foundation tests/pages-list.create-modal.test.tsx
npm test -- tests/visual-editor
npm run build
```

If you add a new test directory such as `tests/admin-collection-pages`, include that in the first command or run it separately and report it explicitly.

## Acceptance Standard

This batch passes only if:

1. Bookings behavior is proven by rendered tests
2. Blog loading-state behavior is proven by rendered tests
3. weak source-inspection assertions for those specific behaviors are removed
4. existing Pages collection-page tests still pass
5. visual-editor regression suite still passes
6. build passes

## Completion Report Format

Return:

1. files changed
2. which source-inspection tests were removed or downgraded to smoke checks
3. which rendered behavior tests were added for Bookings
4. which rendered behavior tests were added for Blog
5. exact command output counts

Do not claim “behavior tests” if they still read source files from disk.
