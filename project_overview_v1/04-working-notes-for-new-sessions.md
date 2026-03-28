# Working Notes For New Sessions

## How To Approach This Repo

Start with the real repo on the server:

- host: `root@thapi.cc`
- repo: `/var/www/html/hopfner.dev-main`

Before making claims about the app:

1. inspect the live repo
2. check whether the worktree is dirty
3. identify whether the task is QA, planning, or direct implementation
4. ignore root-level planning folders unless the user explicitly references them

## Important Non-App Noise In The Repo

The server repo contains many untracked planning artifacts:

- `visual-editor_v*`
- `admin_enhancements_v*`
- `micro_enhancements_v*`
- `project_continuity_v1/`

These are documentation/handoff bundles and should not be mistaken for app runtime files.

## Current Quality Level

At a high level:

- the marketing renderer is CMS-native
- the admin backend is now coherent and productized
- the visual editor is materially more mature than before
- the codebase has real tests and disciplined QA history

But new sessions should still watch for:

- uneven quality between routes
- mixed dependency history (`MUI` plus remaining `Mantine`)
- old workflow logic that still lives in the form editor and should be reused rather than rewritten

## Useful First Files For Orientation

If a new session has only a few minutes, start here:

1. [/var/www/html/hopfner.dev-main/package.json](/var/www/html/hopfner.dev-main/package.json)
2. [/var/www/html/hopfner.dev-main/lib/cms/types.ts](/var/www/html/hopfner.dev-main/lib/cms/types.ts)
3. [/var/www/html/hopfner.dev-main/lib/cms/get-published-page.ts](/var/www/html/hopfner.dev-main/lib/cms/get-published-page.ts)
4. [/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx](/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx)
5. [/var/www/html/hopfner.dev-main/components/landing](/var/www/html/hopfner.dev-main/components/landing)
6. [/var/www/html/hopfner.dev-main/components/admin-shell.tsx](/var/www/html/hopfner.dev-main/components/admin-shell.tsx)
7. [/var/www/html/hopfner.dev-main/components/admin/ui.tsx](/var/www/html/hopfner.dev-main/components/admin/ui.tsx)
8. [/var/www/html/hopfner.dev-main/components/admin/visual-editor](/var/www/html/hopfner.dev-main/components/admin/visual-editor)
9. [/var/www/html/hopfner.dev-main/components/admin/section-editor](/var/www/html/hopfner.dev-main/components/admin/section-editor)
10. [/var/www/html/hopfner.dev-main/app/admin/api](/var/www/html/hopfner.dev-main/app/admin/api)

## What A Fresh Session Should Understand

This app is already close to being an agent-operable CMS platform, but it is not yet exposed that way.

The key architectural fact is:

- the CMS model is already structured enough for agent-native operations
- the missing piece is a deliberate API/service layer for safe creation, editing, styling, publishing, and media generation workflows

That is a future design/programming task.

This overview file is only here to make sure a new session starts with the actual app model, not the recent implementation thread.

