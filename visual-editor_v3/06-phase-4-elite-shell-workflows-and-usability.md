# 06 Phase 4 Elite Shell Workflows and Usability

This phase upgrades the overall product quality around the editor so it feels replacement-grade.

## Phase Goal

Turn the editor from "capable" into "confident, fast, and premium."

## Required Workflow Quality

The visual editor should feel strong across:

- scan
- select
- edit
- reorder
- compare
- save
- publish
- recover from mistakes

## Shell Recommendations

### Top Bar

Add or improve:

- page identity and route context
- draft/published state summary
- save and publish actions with stronger state clarity
- viewport switcher
- command shortcuts hint
- optional compare-to-published entry point

### Structure Rail

Upgrade with:

- better section titling and icons
- visible ownership state for local vs global
- clear unpublished/dirty badges
- search or jump-to-section support for long pages
- stronger hover/selection sync with canvas

### Canvas

Upgrade with:

- cleaner selected/hover states
- non-intrusive labels
- better drop indicators and insertion affordances
- scroll-to-selected and reveal-in-structure behavior
- mobile and tablet preview states that are actually usable for editing

### Inspector

Upgrade with:

- clearer section hierarchy
- tabbed or grouped information architecture
- inherited vs explicit value visibility
- sticky save/publish actions
- concise locked-state messaging for global content
- direct links to advanced or fallback surfaces only for exceptional cases

## Must-Have Premium Behaviors

- undo/redo for local visual-editor state before save
- keyboard navigation between sections
- keyboard save/publish shortcuts where safe
- dirty-state summaries that are specific and trustworthy
- unsaved-change prompts that do not lose work
- reliable loading and empty states

## Global Section Handling

Global sections should remain visible in the page context, but the UX needs to be premium rather than merely blocked.

Recommended:

- clearly styled locked state
- preview remains accurate
- explain where to edit the source global section
- allow safe navigation to the global editing surface

## Content Density And Layout

Avoid the current risk of hiding too much behind a narrow inspector.

An elite editor should use space more intentionally:

- slightly roomier inspector where needed
- collapsible groups
- focus mode for inline text editing
- clear split between content and styling controls

## Performance Expectations

- low-latency section selection
- no visible flicker when switching between sections
- drag interactions remain smooth on longer pages
- inline editing does not cause excessive rerender churn

## Acceptance Criteria

- the editor feels coherent as a standalone product
- common workflows are faster than in the form editor
- undo/redo and navigation quality reduce editing friction
- global sections are understandable instead of merely disabled
- long pages remain manageable

## Anti-Pattern Warning

Do not mistake decorative polish for product quality.

The quality signal here is:

- faster authoring
- safer authoring
- clearer state
- lower cognitive load
