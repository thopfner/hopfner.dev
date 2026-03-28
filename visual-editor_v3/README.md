# Visual Editor v3 Expansion Plan

This bundle is the prioritized implementation brief for the next visual-editor cycle in `/var/www/html/hopfner.dev-main`.

It is based on:

- code review of the current visual editor
- authenticated visual QA in the live admin
- comparison against the existing form editor
- review of how the CMS payloads map to the frontend renderer
- review of how formatting and design tokens are stored in Supabase

## Executive Decision

Do not force `Craft.js` into this release.

For this codebase, the better path is:

- keep the visual editor as a parallel admin route for now
- keep the existing CMS schema and frontend renderer as the only content/render truth
- continue using the current section-based model rather than inventing a second component-tree abstraction
- harden the current `dnd-kit` approach into a replacement-grade visual editor
- reach full form-editor parity, then exceed it with direct editing and premium manipulation patterns

## What "Elite SaaS Grade" Means Here

The target is not a prettier inspector. The target is an editor that can eventually stand alone.

That means v3 must move toward:

- full field parity with the form editor
- truthful preview using the exact same renderer contracts
- direct editing of text and CTA/link fields inside the visual workflow
- direct manipulation of spacing and sizing using existing token scales
- clear inheritance and override behavior for design tokens
- premium page-structure drag and drop
- robust save, publish, dirty-state, and rollback behavior
- zero regression to the current public rendering system

## Non-Negotiables

- No changes to the frontend rendering system contract.
- No schema redesign for the CMS payload model.
- No freeform style system that bypasses existing design variables.
- No release that hides missing coverage behind "use the form editor" for common tasks.
- No persistence path that diverges from current page, section, version, and publish semantics.

## Confirmed Source of Truth

The visual editor must keep reading and writing the same shapes already used by the app:

- `section_versions.payload` and `section_versions.formatting`
- `global_section_versions.payload` and `global_section_versions.formatting`
- `sections.formatting_override`
- `pages.formatting_override`
- `site_formatting_settings.settings` including token payloads
- `design_theme_presets.tokens`
- `section_presentation_presets.tokens`
- `component_family_presets.tokens`

These are JSON/JSONB-backed contracts. The editor is a UI on top of them, not a replacement for them.

## Current QA Findings That Drive v3

- form-editor control parity is incomplete
- CTA and background-media fields are not surfaced in the visual editor
- inline canvas text editing does not exist
- drag/slider spacing and sizing controls do not exist
- the current experience is still closer to "section reorder + inspector" than a true premium visual editor

## Recommended v3 Stack

- `dnd-kit` for structure drag/drop and keyboard sorting
- shared payload/formatting helpers extracted from current editor logic where safe
- visual-edit adapters that map on-canvas interactions back to existing payload paths
- controlled inline editors and anchored popovers for text/link editing
- token-snapped drag/slider controls for spacing and sizing

## Phase Index

- `01-v3-product-standard-and-architecture.md`
- `02-phase-0-parity-and-contract-audit.md`
- `03-phase-1-full-control-surface-parity.md`
- `04-phase-2-inline-text-and-link-editing.md`
- `05-phase-3-direct-manipulation-spacing-and-sizing.md`
- `06-phase-4-elite-shell-workflows-and-usability.md`
- `07-phase-5-regression-qa-rollout-and-replacement-readiness.md`

## Implementation Priority

1. Lock the contracts and build a parity matrix.
2. Reach full parity for existing controls and fields.
3. Add direct editing for text and CTA/link fields.
4. Add token-snapped direct manipulation for spacing and sizing.
5. Upgrade the shell and workflows to replacement-grade quality.
6. Prove regression safety with build, test, and authenticated QA gates.

## Standard For Approval

Do not approve this cycle because it "looks more visual."

Approve it only when:

- the visual editor can cover the common authoring path without bouncing admins back to the form editor
- the preview is renderer-truthful
- the persistence path is identical in meaning to the current editor
- the interaction quality is premium on desktop and tablet breakpoints
- the feature is safe behind a flag and can survive pilot usage without regressions
