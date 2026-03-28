# 06 Library Rationale and Future Options

This file records the library decision so the coding agent does not reopen the same debate mid-implementation.

## v2 Recommendation

Use `dnd-kit`. Do not force `Craft.js`.

## Why `dnd-kit` Fits This Release

The current visual editor only needs:

- sortable sections
- keyboard and pointer drag
- drag overlays
- insertion indicators
- strong accessibility and performance

`dnd-kit` is designed for exactly that class of interaction and is already present in the repo.

This keeps v2 focused on:

- section ordering
- section selection
- section inspection
- truthful preview

## Why `Craft.js` Does Not Fit This Release

`Craft.js` is built for page-editor frameworks where the editor itself manages a component tree and node system.

That is not this app’s current persistence model.

Using it in v2 would create pressure to:

- map sections into editor nodes
- maintain a second authoring abstraction
- eventually decide whether Craft state matters to persistence

That is unnecessary for a corrective release whose safe scope is section-level visual editing.

Also, the official repository still shows React 19 issue history, which is enough reason not to force it into a dirty production codebase unless it solves a problem `dnd-kit` cannot solve.

## Why `Puck` Is Not The v2 Recommendation

`Puck` is more credible than Craft for some modern React editing workflows, but it is still a config-driven component editor.

That means it is better suited when the product wants:

- a stronger component registry
- nested content/layout config
- longer-term schema-backed editor investment

That is future-platform work, not the fastest safe fix for the current implementation.

## Decision Tree

### Use `dnd-kit` now if:

- editing remains section-based
- persistence remains section-version based
- visual editing remains limited to existing design variables

### Reconsider `Puck` later if:

- the roadmap shifts to nested component composition
- the team is willing to define a strong component-config layer
- the CMS contract is intentionally expanded

### Only reconsider `Craft.js` later if:

- React/Next compatibility is clearly stable in the official project
- the product truly needs editor-node authoring semantics
- the team accepts the cost of a second abstraction layer

## Official Sources

- `dnd-kit`: [https://dndkit.com](https://dndkit.com)
- `Craft.js`: [https://github.com/prevwong/craft.js](https://github.com/prevwong/craft.js)
- `Puck`: [https://puckeditor.com](https://puckeditor.com)

## Final Instruction To The Coding Agent

Do not chase frameworks.

Fix correctness first, then upgrade the current `dnd-kit` implementation into a premium section editor that is honest about what it edits and safe about what it saves.
