# Hopfner Project Overview

This folder is the clean handoff pack for a fresh Codex session.

It is intentionally project-level, not task-level.

Use this pack when a new session needs to understand what `hopfner.dev-main` is, how it is structured, and how to work in it safely without being distracted by the last implementation batch.

## Project

- App name: `hopfner.dev`
- Server repo: `/var/www/html/hopfner.dev-main`
- Stack: `Next.js 16`, `React 19`, `TypeScript`, `Supabase`, `Tailwind 4`, `Vitest`

## What This App Is

This is a CMS-driven marketing website plus a custom admin backend.

The product has four major layers:

1. marketing-site rendering
2. admin backend / CMS operations
3. form editor + visual editor for pages and sections
4. shared CMS/theme/media infrastructure

The website is not a static-code-only site. Pages and sections are composed from database-backed CMS records and rendered through a shared section system.

## Read Order

1. `01-system-overview.md`
2. `02-cms-and-rendering-model.md`
3. `03-admin-and-editor-surfaces.md`
4. `04-working-notes-for-new-sessions.md`

## Important Orientation Notes

- The repo contains many untracked planning folders such as `visual-editor_v*`, `admin_enhancements_v*`, `micro_enhancements_v*`, and `project_continuity_v1/`.
- Those folders are planning artifacts, not runtime app code.
- New sessions should not treat those folders as implementation changes unless the user explicitly asks to use them.
- The actual app code lives in the normal app/component/lib paths.

## Main Runtime Entrypoints

- Marketing app: [/var/www/html/hopfner.dev-main/app/(marketing)](/var/www/html/hopfner.dev-main/app/(marketing))
- Admin app: [/var/www/html/hopfner.dev-main/app/admin](/var/www/html/hopfner.dev-main/app/admin)
- Shared landing sections: [/var/www/html/hopfner.dev-main/components/landing](/var/www/html/hopfner.dev-main/components/landing)
- Admin shared UI: [/var/www/html/hopfner.dev-main/components/admin](/var/www/html/hopfner.dev-main/components/admin)
- Visual editor: [/var/www/html/hopfner.dev-main/components/admin/visual-editor](/var/www/html/hopfner.dev-main/components/admin/visual-editor)
- CMS/data libs: [/var/www/html/hopfner.dev-main/lib/cms](/var/www/html/hopfner.dev-main/lib/cms)
