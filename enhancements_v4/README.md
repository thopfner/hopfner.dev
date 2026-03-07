# Hopfner Enhancements V4

Start with `elite-ui-system-implementation-brief.md`.

This package is an authoritative implementation handoff for the next visual upgrade phase.

It covers four UI priorities:

- stronger typography system
- stronger spacing hierarchy
- less repetitive card/section sameness
- a distinct brand signature

This is not a brainstorming memo.

The coding agent should implement the direction exactly as specified unless a code-level constraint makes part of it impossible. If a constraint exists, the fallback must preserve the same design intent and remain CMS-driven.

## Non-negotiable direction

Implement the site as a premium operator-grade AI / automation brand.

Design language:

- dark, controlled, technical, sharp
- restrained, not playful
- high-contrast, but not neon-heavy
- premium enterprise AI consultancy, not startup template

Chosen visual direction name:

- `Obsidian Operator`

Chosen typography direction:

- display: `Space Grotesk`
- body/UI: `IBM Plex Sans`
- mono/data/eyebrows/metrics: `IBM Plex Mono`

Do not leave font choice open to the agent.

## Required implementation philosophy

- all frontend visual changes must be controllable from backend/admin
- prefer semantic CMS controls over raw utility-class inputs
- reuse the existing `site_formatting_settings`, `section_type_defaults`, and section drawer architecture
- extend the system cleanly instead of hardcoding page-specific styling

## Files in this package

- `elite-ui-system-implementation-brief.md`
- `implementation-checklist.md`
