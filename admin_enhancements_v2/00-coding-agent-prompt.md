# Coding Agent Prompt

You are upgrading the admin backend into a coherent elite SaaS product surface without changing its underlying behavior.

## Mission

Improve `/admin` layout, organization, hierarchy, and styling while preserving every existing workflow.

This is a design-system and productization batch.
It is not a backend feature batch.

## What Success Looks Like

1. the admin feels like one product, not several tools
2. route scaffolds are consistent
3. collection pages share one hierarchy
4. workspace pages share one hierarchy
5. actions appear where users expect them
6. loading/error/empty states feel consistent
7. the visual editor remains the most immersive workspace, but no longer feels disconnected from the rest of the admin

## Hard Rules

1. Do not change route URLs.
2. Do not change API contracts.
3. Do not change database schema.
4. Do not change save/publish semantics.
5. Do not silently redesign domain-specific workflows beyond layout and presentation.
6. Do not rewrite everything at once. Follow the phases exactly.

## Reuse Rules

Prefer extending or formalizing existing admin primitives instead of creating parallel ones:

- `components/admin-shell.tsx`
- `components/admin/ui.tsx`
- `components/app-theme-provider.tsx`

Where route pages currently bypass those primitives, migrate them onto the shared system instead of inventing a new route-specific shell.

## Output Expectation

At the end of each phase, report:

1. exact files changed
2. exact routes affected
3. what behavior was intentionally preserved
4. test/build result
5. any blockers

If a phase gate fails, stop and report. Do not continue.
