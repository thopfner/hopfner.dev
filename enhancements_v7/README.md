# Hopfner Design System Tokenization Pack (v7)

Start with:

- `design-system-tokenization-implementation-brief.md`

Then use:

- `sql-migration-and-rollout-plan.md`
- `qa-acceptance-matrix.md`

## Purpose

This pack moves the project from:

- partially wired formatting controls
- section-specific styling logic
- inconsistent renderer behavior

to:

- a tokenized design system
- one shared styling contract across all sections
- consistent backend-to-frontend application of UI controls

## Strategic direction

The goal is no longer just “fix the current broken controls.”

The goal is:

- formalize the design language
- make it dynamically controllable from the CMS
- ensure all supported formatting options resolve through one shared token system
- make section rendering consistent and predictable across the site

## Implementation posture

- do not add more one-off styling branches
- do not let sections interpret formatting enums differently
- do not hardcode premium styling only into homepage-specific components
- do not expose any admin control without a deterministic token-to-render path

## Proof case

Use `Service Snapshot` as the first validation section.

It currently proves the core architecture problem:

- the CMS stores formatting values correctly
- the frontend renders too little difference
- some controls are still dead or too weak

When v7 is complete, that section should visibly differentiate from the other `card_grid` section using the same shared token system that every other section also uses.

