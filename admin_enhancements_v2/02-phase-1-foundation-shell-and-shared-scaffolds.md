# Phase 1: Foundation, Shell, And Shared Scaffolds

## Goal

Build the shared admin scaffolds before changing route pages.

This phase must create the system that later phases consume.

## Files To Change, In Order

1. `components/app-theme-provider.tsx`
2. `components/admin/ui.tsx`
3. `components/admin-shell.tsx`
4. any small new admin scaffold components needed under `components/admin/`

## Required Work

### 1. Formalize Shared Page Scaffolds

Extend `components/admin/ui.tsx` so it supports two clear page modes:

1. collection-page scaffold pieces
2. workspace-page scaffold pieces

That may include components such as:

- page header
- summary strip
- filter/action bar
- primary content panel
- workspace header
- workspace section shell
- shared empty/loading/error states

Do not create decorative wrappers with no structural value.

### 2. Tighten Admin Theme Consistency

Use `components/app-theme-provider.tsx` as the one place to formalize:

- spacing rhythm
- panel elevation/border rules
- button/input rounding
- table density expectations
- typography weight hierarchy

Do not change the admin’s overall brand direction.
Only tighten it.

### 3. Productize The Main Shell

Upgrade `components/admin-shell.tsx` so it better supports deep work:

1. navigation should read more clearly
2. current route context should be clearer
3. shell should visually distinguish list pages from immersive workspaces
4. nav state and shell spacing should feel intentional, not incidental

Do not redesign navigation structure around new features.
Stay within current route set.

## Required Outcome

After Phase 1:

1. the admin has a stable shared scaffold system
2. the shell has cleaner navigation and route context
3. later route migrations can happen without inventing one-off layouts

## Hard Gate

Do not touch route pages until:

1. shared admin primitives are in place
2. theme changes are stable
3. the shell still works on desktop and mobile
4. build passes
