# 06 Phase 5 Post-v1 Expansion

This file is intentionally separate from the release plan. These items are valuable, but they should not be pulled into v1 unless the earlier phases land cleanly.

## Objective

Define the next expansion steps once the parallel visual editor is stable and trusted.

## Expansion Order

### 1. Dedicated Global Visual Editor

Recommended route:

- `app/admin/(protected)/global-sections/visual/page.tsx`

Goal:

- edit global sections visually in their own scoped route
- preserve current impact-preview semantics
- preserve current attach/detach semantics

Why later:

- global content has broader blast radius
- mistakes here affect multiple pages

### 2. Truthful Custom / Composed Section Support

Goal:

- render composed/custom sections in the visual editor using current `composer_schema` and `ComposedSection`
- expose only controls that map to existing composed content and current design variables

Why later:

- current custom/composed model is schema-driven and more complex than built-ins
- rushing it into v1 would expand risk far beyond formatting/token editing

### 3. Controlled Content Editing In Canvas

Goal:

- allow selected content primitives to be edited inline

Allowed future candidates:

- section title
- section subtitle
- CTA labels and hrefs
- eyebrow text

Later-only candidates:

- array content editors
- rich text
- booking configuration
- custom composer blocks

Why later:

- content editing multiplies synchronization, validation, and dirty-state complexity

### 4. Visual Preset Diffing

Goal:

- show what a preset applies vs what the section overrides
- surface inherited vs explicit token values in the inspector

This would make the system feel more premium and reduce editor confusion.

### 5. Multi-Section Workflow Enhancements

Possible later features:

- duplicate section from canvas
- add section palette from canvas
- enable/disable section from canvas
- bulk publish indicators
- cross-page duplication launch points

These are good candidates only after the selected-section save model is stable.

### 6. Theme-Aware Visual Editing

Goal:

- deeper integration of current site theme context in the canvas
- theme previews against existing `design_theme_presets`

Important boundary:

- still no new theme schema
- still no divergence from `site_formatting_settings.settings.tokens`

## Future Refactor Candidates

Only after v1 is stable:

- extract truly shared loader logic from `page-editor.tsx`
- extract shared section mutation adapters from current editor hooks
- consolidate admin preview and public renderer helper duplication carefully

Do not do these as part of v1.

## Success Criteria For Starting Phase 5

Begin expansion only if:

- v1 visual editor is in active use
- no parity regressions have been found
- the team trusts the selected-section save model
- test coverage exists for current visual-editor adapter layers

If those conditions are not true, keep investing in stability, not scope.
