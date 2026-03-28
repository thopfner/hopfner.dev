# Phase 1.1 Audit Gaps

## Gap 1: Deep-Route Context Is Still Too Weak

Current shell title logic still resolves to the top-level nav item:

- [components/admin-shell.tsx](/var/www/html/hopfner.dev-main/components/admin-shell.tsx#L107)
- [components/admin-shell.tsx](/var/www/html/hopfner.dev-main/components/admin-shell.tsx#L321)

That means:

- `/admin/pages/[pageId]` reads as `Pages`
- `/admin/pages/[pageId]/visual` also reads as `Pages`

This is not enough context for serious workspace routes.

## Gap 2: Route Class Is Not Used Meaningfully

`getRouteClass(...)` exists in:

- [components/admin-shell.tsx](/var/www/html/hopfner.dev-main/components/admin-shell.tsx#L80)

But it is only attached here:

- [components/admin-shell.tsx](/var/www/html/hopfner.dev-main/components/admin-shell.tsx#L383)

There is no actual layout or visual behavior driven by it.

## Gap 3: WorkspaceHeader Sticky Offset Is Unsafe

`WorkspaceHeader` currently uses:

- [components/admin/ui.tsx](/var/www/html/hopfner.dev-main/components/admin/ui.tsx#L167)

with `top: 0`, while the shell uses a fixed 56px app bar:

- [components/admin-shell.tsx](/var/www/html/hopfner.dev-main/components/admin-shell.tsx#L252)

If adopted as-is, the header can pin under the global app bar.

## Gap 4: Foundation Proof Is Missing

The current phase added primitives, but there is no focused proof for:

1. route-meta resolution
2. route-class resolution
3. safe workspace-header offset

That is too thin for a foundation batch.
