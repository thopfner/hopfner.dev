# Admin Enhancements v4

## Phase 2.1 Correction Batch

This is a narrow cleanup pass for Phase 2.

It exists because Phase 2 is close, but not clean enough to approve for Phase 3.

## Scope

Only these issues are in scope:

1. invalid Bookings table markup
2. missing Bookings mobile fallback
3. missing Blog loading-state treatment
4. thin proof for the changed collection routes

Do not touch any other admin route in this batch.

## Files To Change, In Order

1. `app/admin/(protected)/bookings/page-client.tsx`
2. `app/admin/(protected)/blog/page-client.tsx`
3. targeted tests for Bookings and Blog

## Exact Problems

### 1. Bookings Uses Invalid Table Structure

Current implementation wraps each record in:

- `<Box component="tbody">`

inside an existing `<TableBody>`.

That is invalid HTML and must be removed.

The corrected structure must keep:

- clickable summary row
- expandable detail row
- identical information access

But it must render as valid table rows inside a single `<TableBody>`.

### 2. Bookings Still Lacks Mobile Parity

Pages and Blog have narrow-screen fallbacks.
Bookings does not.

Required fix:

1. add a mobile card/list fallback for Bookings
2. keep the same status, summary, and detail information
3. preserve row expansion behavior or replace it with an equally clear mobile detail pattern

Do not leave Bookings as table-only.

### 3. Blog Still Lacks Shared Loading-State Handling

Blog tracks `loading`, but the collection-page content area does not render a proper shared loading state in the main surface.

Required fix:

1. render `AdminLoadingState` inside the primary content surface while the list is loading
2. do not show an empty-state placeholder during loading
3. keep the existing content table/card behavior after data resolves

### 4. Proof Is Too Thin

Phase 2 currently has direct route-level proof only for Pages.

Required fix:

1. add at least one direct test for Bookings route rendering and/or mobile/detail behavior
2. add at least one direct test for Blog loading-state behavior

These do not need to be exhaustive.
They do need to prove the specific fixes in this batch.

## Hard Rules

1. do not redesign the collection-page scaffold
2. do not remove the Bookings detail view
3. do not change bookings data loading or API contracts
4. do not change blog action-menu behavior
5. do not broaden scope into Phase 3 workspace work

## Required Validation

Run:

```bash
npm test -- tests/pages-list.create-modal.test.tsx
npm test -- tests/admin-foundation
npm test -- tests/visual-editor
npm run build
```

Also run any new route tests you add for Blog or Bookings.

## Acceptance Standard

This correction batch is complete only if:

1. Bookings uses valid table markup
2. Bookings has a real mobile fallback
3. Blog shows `AdminLoadingState` during load
4. targeted tests for Blog and Bookings pass
5. build passes

## Stop Rule

Do not continue to Phase 3 until this batch is complete.
