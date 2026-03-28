# Sprint 3: Global And Composed CTA Visibility

## Goal

Finish CTA visibility for the remaining editorial CTA paths that do not use the generic local shared editor flow.

This sprint covers:

- `nav_links` header CTA
- `footer_grid` card CTAs
- composed/custom block CTAs
- section-library composer authoring path

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/cms/cta-visibility.ts`
2. `/var/www/html/hopfner.dev-main/components/landing/site-header.tsx`
3. `/var/www/html/hopfner.dev-main/components/landing/footer-grid-section.tsx`
4. `/var/www/html/hopfner.dev-main/components/landing/composed-section.tsx`
5. `/var/www/html/hopfner.dev-main/components/admin/section-editor/editors/footer-card-row.tsx`
6. `/var/www/html/hopfner.dev-main/components/admin/section-editor/editors/custom-block-editor.tsx`
7. `/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-global-section-panel.tsx`
8. `/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-composed-section-panel.tsx` only if required for wiring, not for a second CTA implementation
9. `/var/www/html/hopfner.dev-main/app/admin/(protected)/section-library/page-client.tsx`
10. add focused tests for global/footer/composed CTA visibility behavior

## Source Workflows / Files To Reuse

- footer-grid form editor row behavior:
  - `/var/www/html/hopfner.dev-main/components/admin/section-editor/editors/footer-card-row.tsx`
- composed/custom CTA editing path:
  - `/var/www/html/hopfner.dev-main/components/admin/section-editor/editors/custom-block-editor.tsx`
- visual editor composed panel:
  - `/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-composed-section-panel.tsx`
- global visual panel special path:
  - `/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-global-section-panel.tsx`

## Step-By-Step Implementation

1. Extend `/var/www/html/hopfner.dev-main/lib/cms/cta-visibility.ts` with nested/global/composed helpers:
   - `getFooterCardCtaEnabled(card, key)`
   - `setFooterCardCtaEnabled(card, key, enabled)`
   - `getComposerBlockCtaEnabled(block, key)`
   - `setComposerBlockCtaEnabled(block, key, enabled)`
2. Use these exact nested paths:
   - footer card:
     - `content.cards[i].ctaPrimary.enabled`
     - `content.cards[i].ctaSecondary.enabled`
   - composed/custom block:
     - `ctaPrimaryEnabled`
     - `ctaSecondaryEnabled`
3. Update `footer-grid-section.tsx` so each card CTA only renders when:
   - enabled is not false
   - label exists
   - href exists
4. Update `composed-section.tsx` so composed CTA buttons do not fall back to `"Primary"` when explicitly hidden.
5. Update `footer-card-row.tsx` to add show/hide toggles for each card CTA group.
6. Update `custom-block-editor.tsx` to add show/hide toggles for each composed CTA group.
7. Update `page-visual-editor-global-section-panel.tsx` explicitly.

   Required work in this file:

   - for `nav_links`, add CTA show/hide + label/link controls for the shared header CTA
   - for `footer_grid`, add per-card CTA show/hide + label/link controls matching `FooterCardRow`
   - remove or replace any dead CTA group that does not map to the live frontend structure

8. Do not assume the generic visual editor inspector covers `nav_links` or `footer_grid`. It does not.
9. Update `section-library/page-client.tsx` so the custom-type composer authoring path also exposes composed CTA show/hide toggles. Do not leave section-library composer behind the runtime/frontend behavior.
10. If `page-visual-editor-composed-section-panel.tsx` already inherits the `CustomComposerEditor` path cleanly, keep changes there minimal. Reuse the form-editor block editor behavior instead of creating a second composed CTA UI.

## Required Behavior

- Header CTA (`nav_links`) can be hidden without clearing label/href.
- Footer card CTAs can be hidden per card and per CTA.
- Composed/custom CTA blocks can be hidden per block and per CTA.
- Visual editor special panels stay aligned with form-editor behavior.
- Section-library composer stays aligned with frontend/runtime behavior.

## What Must Not Change In This Sprint

- do not redesign global-section layout
- do not redesign section-library workflow
- do not change non-CTA footer subscribe behavior
- do not make the booking submit hideable
- do not add a second composed CTA state model

## Required Tests For This Sprint

- footer-grid CTA visibility renderer tests
- composed-section CTA visibility renderer tests
- form editor tests for footer/composed CTA toggles
- visual editor tests for:
  - `nav_links` global CTA toggle
  - `footer_grid` per-card CTA toggle
- section-library composer test proving composed CTA visibility is preserved

## Gate For Moving Forward

Do not proceed to completion until all of the following are true:

- nav header CTA visibility works
- footer card CTA visibility works
- composed/custom CTA visibility works
- visual editor special paths no longer lag behind the form editor
- section-library composer no longer lags behind the runtime/frontend behavior
