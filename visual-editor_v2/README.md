# Visual Editor v2 Fix Plan

This bundle is the corrective implementation brief for the current admin visual editor.

It is written against the live codebase at `/var/www/html/hopfner.dev-main` and is based on:

- code review of the current visual editor implementation
- database and renderer contract review
- build and test verification
- library fit review using official sources

## Executive Decision

Do not force Craft.js into v2.

For this codebase, the better v2 path is:

- keep the visual editor as a parallel admin-only route
- keep the current section-based CMS data model
- keep the current frontend renderer as the only render truth
- harden the current `dnd-kit` implementation into an elite SaaS-grade editor shell
- fix the broken persistence and loader contracts before any polish work

## Why This Is The Right Call

The current CMS is not a generic block tree. It is a section/version system with:

- `sections`
- `section_versions`
- `global_sections`
- `global_section_versions`
- renderer-specific payload schemas
- semantic design tokens resolved by `resolveSectionUi`

That means the visual editor should project and manipulate the existing section model, not introduce a second component-tree abstraction.

`Craft.js` is not required to deliver elite drag and drop here. The current implementation already uses `dnd-kit`, and that is the better fit for page-level section ordering and selection in this app.

## What The Current Agent Got Right

- additive route under `/admin/pages/[pageId]/visual`
- current form editor preserved
- global sections treated as locked
- custom/composed sections not faked as fully supported
- visual-editor footprint mostly isolated from the rest of the admin

## What Must Be Fixed First

- publish action is broken because the visual editor omits `p_section_id` when calling `publish_section_version`
- loader queries do not match the real schema
- preview merge order does not match the public renderer
- `section.formatting_override` is not loaded or applied
- feature flag defaults to enabled instead of safe-disabled
- tests do not cover the real new code paths
- the implementation does not satisfy the original Craft.js requirement, so v2 must explicitly reset the architecture decision

## Recommended v2 Stack

### Primary

- `dnd-kit` for drag/drop and keyboard sorting
- existing admin preview renderer for truthful visual output
- typed local editor store
- existing payload helpers and existing publish/save semantics

### Not Recommended For v2

- `Craft.js`

Reason:

- unnecessary abstraction for a section-based CMS
- adds another mental model without solving the actual contract problems
- higher React/Next integration risk than the current requirement justifies

### Possible Future Exploration Only

- `Puck`

Reason:

- useful if the product later commits to a schema-driven component-config editor with nested layouts and a stronger component registry
- not the right tool for this corrective release because it still pushes the system toward a separate authoring abstraction

## Phase Index

- `01-v2-decision-and-target-state.md`
- `02-phase-0-lockdown-and-contract-hotfixes.md`
- `03-phase-1-truthful-preview-and-data-model-alignment.md`
- `04-phase-2-elite-drag-drop-and-shell-upgrade.md`
- `05-phase-3-persistence-hardening-and-regression-qa.md`
- `06-library-rationale-and-future-options.md`

## Official Source Notes

- `dnd-kit` markets itself as a modern, lightweight, performant, accessible drag-and-drop toolkit for React. Source: [dndkit.com](https://dndkit.com)
- `Craft.js` is a framework for building page editors, but the project still has open React 19 issue history in the official repository. Source: [github.com/prevwong/craft.js](https://github.com/prevwong/craft.js)
- `Puck` is an open-source visual editor for React with a config-driven component model and Next.js support. Source: [puckeditor.com](https://puckeditor.com)

## Release Standard

v2 is not a library migration project. It is a focused corrective release to make the current visual editor:

- truthful
- stable
- premium
- regression-safe

The coding agent should treat architectural restraint as a feature, not a compromise.
