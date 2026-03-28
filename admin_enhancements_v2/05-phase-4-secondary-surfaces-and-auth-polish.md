# Phase 4: Secondary Surfaces And Auth Polish

## Goal

Finish the lower-scope surfaces and align the front door of the admin with the rest of the system.

## In Scope

1. `/admin/login`
2. `/admin/setup`
3. any leftover route-level status or shell inconsistencies discovered in earlier phases

## Files To Change, In Order

1. `app/admin/login/login-form.tsx`
2. `app/admin/setup/setup-client.tsx`
3. any minimal shared admin state or scaffold components needed to close consistency gaps

## Required Work

### 1. Align Auth Surfaces To The Product

Keep login and setup simple, but ensure they feel like the same admin product:

1. same typography logic
2. same surface language
3. same input/button treatment
4. same trust and clarity level

### 2. Clean Up Leftover Inconsistencies

Use this phase only for small finish work discovered during the earlier migrations:

- state presentation mismatches
- spacing mismatches
- inconsistent action placement
- inconsistent empty/loading/error states

Do not reopen large route redesign work here.

## Hard Gate

This phase is complete only when:

1. auth surfaces visually belong to the same admin
2. there are no obvious one-off route styling leftovers
3. tests and build pass
