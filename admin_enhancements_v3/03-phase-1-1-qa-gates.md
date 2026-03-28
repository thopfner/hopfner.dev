# Phase 1.1 QA Gates

## Required Validation

### Shell Context

Verify the shell title/context for:

1. `/admin`
2. `/admin/pages/[pageId]`
3. `/admin/pages/[pageId]/visual`
4. `/admin/section-library`
5. `/admin/global-sections`
6. `/admin/email-templates`

### Route-Class Behavior

Verify there is an actual user-visible distinction between:

1. collection routes
2. workspace routes
3. immersive routes

### WorkspaceHeader Safety

Verify the shared workspace header contract does not sit under the fixed global app bar.

## Required Commands

Run:

```bash
npm test -- tests/visual-editor
npm run build
```

Add any new admin-foundation tests to the standard test run if appropriate.

## Required Completion Report

The report must include:

1. exact files changed
2. exact shared helper introduced
3. route-title outcomes for the required admin paths
4. the user-visible behavior driven by `routeClass`
5. test/build results

## Acceptance Standard

Phase 1.1 is complete only if:

1. deep-route context is meaningfully improved
2. route-class affects actual presentation
3. `WorkspaceHeader` is safe for Phase 3 adoption
4. tests pass
5. build passes
