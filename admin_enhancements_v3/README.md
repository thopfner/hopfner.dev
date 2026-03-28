# Admin Enhancements v3

## Purpose

This is `Phase 1.1`.

It is a corrective foundation batch that must land before Phase 2.

It fixes the remaining gaps from `admin_enhancements_v2` Phase 1:

1. weak deep-route context in the shell
2. unused route-class distinction
3. unsafe `WorkspaceHeader` sticky offset relative to the fixed admin app bar
4. missing proof for the new shell/scaffold layer

## Scope

Only the shared foundation layer is in scope:

- `components/admin-shell.tsx`
- `components/admin/ui.tsx`
- `components/app-theme-provider.tsx` only if strictly needed
- small new admin shell helper/test files if needed

No route page migrations.
No behavior changes to editors or CRUD flows.

## Execution Order

1. [00-coding-agent-prompt.md](./00-coding-agent-prompt.md)
2. [01-phase-1-1-audit-gaps.md](./01-phase-1-1-audit-gaps.md)
3. [02-phase-1-1-exact-fix-steps.md](./02-phase-1-1-exact-fix-steps.md)
4. [03-phase-1-1-qa-gates.md](./03-phase-1-1-qa-gates.md)

## Stop Rule

Do not proceed to Phase 2 until this batch is complete and verified.
