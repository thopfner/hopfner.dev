# Section Editor Drawer Refactor

Target:

- repo: `/var/www/html/hopfner.dev-main`
- file under repair: `components/section-editor-drawer.tsx`

Observed state on 2026-03-08:

- `components/section-editor-drawer.tsx`: 5,047 lines
- extracted neighbors already exist:
  - `components/admin/formatting-controls.tsx`
  - `components/admin/section-preview.tsx`

This pack is the exact implementation plan for the structural refactor of the CMS drawer. It is intended for a coding agent that needs a safe but uncompromising path through a large change.

## Read Order

1. `01-exact-implementation-plan.md`
2. `02-target-architecture.md`
3. `03-phase-plan.md`
4. `04-claude-execution-prompt.md`
5. `05-acceptance-checklist.md`

## Core Goal

Convert the drawer from a monolithic, parent-owned, all-state/all-render component into a production-grade editor architecture with:

- isolated panel boundaries
- reducer-backed edit session state
- exact dirty tracking without full-form stringify on every keystroke
- deferred preview updates
- stable rich text editor instances
- section-type editors split into dedicated modules

## Non-Negotiable Constraints

- no payload contract change for save/publish/restore RPC flows
- no behavior regression for any built-in section type or custom composer type
- no superficial extraction-only refactor
- no introducing a state library unless absolutely necessary
- performance improvement must be structural, not cosmetic
