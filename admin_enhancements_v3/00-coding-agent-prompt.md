# Coding Agent Prompt

You are fixing the incomplete parts of the admin foundation layer before any route migrations continue.

## Objective

Finish Phase 1 properly.

Do not start Phase 2 work.
Do not touch route pages unless absolutely required for a test harness.

## Exact Problems To Fix

1. deep admin routes still collapse to weak top-level labels like `Pages`
2. `routeClass` is computed but not meaningfully used
3. `WorkspaceHeader` is not safe relative to the fixed top app bar
4. there is no real proof for shell/scaffold behavior

## Required Outcome

After this batch:

1. the shell must expose meaningful route context for:
   - `/admin/pages/[pageId]`
   - `/admin/pages/[pageId]/visual`
   - `/admin/section-library`
   - `/admin/global-sections`
   - `/admin/email-templates`
2. route class must visibly affect the shell or workspace framing
3. `WorkspaceHeader` must be safe to adopt in Phase 3 without pinning under the app bar
4. tests must prove the route-meta and scaffold behavior

## Hard Rules

1. do not migrate route pages in this batch
2. do not change route URLs
3. do not change editor behavior
4. do not add cosmetic-only wrappers
5. do not mark complete if `routeClass` is still only a `data-*` attribute
