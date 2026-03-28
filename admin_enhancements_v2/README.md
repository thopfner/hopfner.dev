# Admin Enhancements v2

## Purpose

This package converts the admin audit into a strict phased implementation runbook for Opus.

It is focused on:

- layout
- organization
- styling
- hierarchy
- consistency

It is not a functionality expansion brief.

## Non-Negotiable Constraint

No regressions in existing admin behavior.

That means:

- no changes to auth flow semantics
- no changes to save/publish semantics
- no changes to Supabase data contracts
- no hidden changes to page/section/editor behavior
- no route removals or renames

## Product Goal

Turn `/admin` from a collection of capable internal tools into a coherent elite SaaS backend by standardizing:

1. route scaffolds
2. navigation semantics
3. page hierarchy
4. action placement
5. surface styling
6. state handling

## Execution Order

1. [00-coding-agent-prompt.md](./00-coding-agent-prompt.md)
2. [01-target-state-and-non-negotiables.md](./01-target-state-and-non-negotiables.md)
3. [02-phase-1-foundation-shell-and-shared-scaffolds.md](./02-phase-1-foundation-shell-and-shared-scaffolds.md)
4. [03-phase-2-collection-pages-unification.md](./03-phase-2-collection-pages-unification.md)
5. [04-phase-3-workspace-pages-unification.md](./04-phase-3-workspace-pages-unification.md)
6. [05-phase-4-secondary-surfaces-and-auth-polish.md](./05-phase-4-secondary-surfaces-and-auth-polish.md)
7. [06-qa-acceptance-and-stop-gates.md](./06-qa-acceptance-and-stop-gates.md)

## Route Classes

### Collection Pages

- `/admin`
- `/admin/blog`
- `/admin/media`
- `/admin/bookings`

### Workspace Pages

- `/admin/pages/[pageId]`
- `/admin/pages/[pageId]/visual`
- `/admin/section-library`
- `/admin/global-sections`
- `/admin/email-templates`

### Auth / Utility

- `/admin/login`
- `/admin/setup`

## Scope Lock

This runbook is about productization of the current admin, not capability expansion.

If a phase uncovers a true workflow bug, fix it only if required to preserve current behavior after the layout refactor.
