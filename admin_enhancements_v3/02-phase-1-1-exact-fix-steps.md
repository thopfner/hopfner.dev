# Phase 1.1 Exact Fix Steps

## Files To Change, In Order

1. new small route-meta helper under `components/admin/` or `lib/admin/`
2. `components/admin-shell.tsx`
3. `components/admin/ui.tsx`
4. `components/app-theme-provider.tsx` only if needed for shell-level CSS variables
5. targeted tests

## Step 1: Extract Shared Admin Route Meta

Create one shared helper that resolves admin route metadata from pathname.

It must return at least:

1. `routeClass`: `collection | workspace | immersive`
2. `title`
3. optional `section` or `group`
4. optional `parentLabel`

Minimum required route-title outcomes:

- `/admin` -> `Pages`
- `/admin/pages/[pageId]` -> `Page Editor`
- `/admin/pages/[pageId]/visual` -> `Visual Editor`
- `/admin/section-library` -> `Section Library`
- `/admin/global-sections` -> `Global Sections`
- `/admin/email-templates` -> `Email Templates`
- `/admin/blog` -> `Blog`
- `/admin/media` -> `Media`
- `/admin/bookings` -> `Bookings`

Do not keep title logic embedded ad hoc in `admin-shell.tsx`.

## Step 2: Make Route Class Actually Affect The Shell

Use the resolved `routeClass` to create a meaningful shell distinction.

Examples of acceptable behavior:

1. different main-content padding or chrome treatment for workspace/immersive routes
2. stronger full-bleed framing for immersive routes
3. stronger contextual header treatment for workspace routes

Requirements:

- collection routes still feel like admin list pages
- workspace routes feel more tool-like
- immersive routes feel intentionally more canvas-oriented

Do not leave this as metadata only.

## Step 3: Make WorkspaceHeader Safe

Fix `WorkspaceHeader` so it can be used later without colliding with the fixed global app bar.

Preferred implementation:

1. formalize a shared shell CSS variable for admin header height
2. use that variable in `WorkspaceHeader`
3. keep the offset tied to shell truth, not a duplicated magic number in multiple places

Do not leave `top: 0`.

## Step 4: Improve Visible Route Context In The Shell

Update the top app bar so deep routes communicate better context.

Required:

1. the current title must use the new route-meta helper
2. workspace routes must read as their actual workspace, not their parent collection

Optional, only if low risk:

1. small secondary context line or label for parent group

Do not add noisy breadcrumbs unless they are clearly helpful.

## Step 5: Add Real Foundation Tests

Add focused tests proving:

1. route-meta resolution for the key admin paths
2. route-class resolution for collection/workspace/immersive paths
3. `WorkspaceHeader` uses the shell offset contract rather than `top: 0`

These should not be source-string-only tests.
Prefer pure helper tests plus direct rendered assertions where practical.

## Stop Condition

Do not finish this batch if:

1. `/admin/pages/[pageId]/visual` still reads as `Pages`
2. `routeClass` still has no user-visible effect
3. `WorkspaceHeader` still pins at `top: 0`
