# System Overview

## Stack

From [/var/www/html/hopfner.dev-main/package.json](/var/www/html/hopfner.dev-main/package.json):

- `Next.js 16.1.6`
- `React 19.2.3`
- `TypeScript`
- `Supabase`
- `MUI`
- `Mantine` still present in dependencies
- `TipTap`
- `dnd-kit`
- `Vitest`

This is a single Next.js app with both public marketing routes and protected admin routes.

## Route Structure

Main app directories:

- [/var/www/html/hopfner.dev-main/app/(marketing)](/var/www/html/hopfner.dev-main/app/(marketing))
- [/var/www/html/hopfner.dev-main/app/admin](/var/www/html/hopfner.dev-main/app/admin)
- [/var/www/html/hopfner.dev-main/app/api](/var/www/html/hopfner.dev-main/app/api)
- [/var/www/html/hopfner.dev-main/app/admin/api](/var/www/html/hopfner.dev-main/app/admin/api)

High-level route groups:

- public marketing pages
- public blog pages
- public booking endpoint/integrations
- protected admin backend
- protected admin APIs

## Component Structure

Key component areas:

- [/var/www/html/hopfner.dev-main/components/landing](/var/www/html/hopfner.dev-main/components/landing)
- [/var/www/html/hopfner.dev-main/components/admin](/var/www/html/hopfner.dev-main/components/admin)
- [/var/www/html/hopfner.dev-main/components/admin/section-editor](/var/www/html/hopfner.dev-main/components/admin/section-editor)
- [/var/www/html/hopfner.dev-main/components/admin/visual-editor](/var/www/html/hopfner.dev-main/components/admin/visual-editor)
- [/var/www/html/hopfner.dev-main/components/blog](/var/www/html/hopfner.dev-main/components/blog)
- [/var/www/html/hopfner.dev-main/components/marketing/consent](/var/www/html/hopfner.dev-main/components/marketing/consent)
- [/var/www/html/hopfner.dev-main/components/ui](/var/www/html/hopfner.dev-main/components/ui)

## Library Structure

Core libraries:

- [/var/www/html/hopfner.dev-main/lib/cms](/var/www/html/hopfner.dev-main/lib/cms)
- [/var/www/html/hopfner.dev-main/lib/admin](/var/www/html/hopfner.dev-main/lib/admin)
- [/var/www/html/hopfner.dev-main/lib/admin/visual-editor](/var/www/html/hopfner.dev-main/lib/admin/visual-editor)
- [/var/www/html/hopfner.dev-main/lib/design-system](/var/www/html/hopfner.dev-main/lib/design-system)
- [/var/www/html/hopfner.dev-main/lib/media](/var/www/html/hopfner.dev-main/lib/media)
- [/var/www/html/hopfner.dev-main/lib/privacy](/var/www/html/hopfner.dev-main/lib/privacy)
- [/var/www/html/hopfner.dev-main/lib/theme](/var/www/html/hopfner.dev-main/lib/theme)

## Product Surfaces

The app is best understood as these product surfaces:

1. public CMS-rendered website
2. admin collection pages
3. admin workspace pages
4. page form editor
5. page visual editor
6. section library and global sections management
7. media library
8. blog and email template management
9. booking intake review
10. privacy/consent layer

## Current Technical Character

The app is no longer a rough prototype. It has:

- a meaningful test suite
- strong CMS infrastructure
- a productized admin shell
- a mature visual editor compared to where it started

But it still has some signs of layered evolution:

- both `MUI` and `Mantine` are still in dependencies
- some routes are cleaner than others
- many planning artifacts exist at repo root from the QA/brief workflow

