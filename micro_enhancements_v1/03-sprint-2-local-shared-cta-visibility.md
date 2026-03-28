# Sprint 2: Local Shared CTA Visibility

## Goal

Add explicit show/hide control for local shared editorial CTAs, with parity between:

- frontend renderer
- admin form editor
- admin visual editor
- admin preview

This sprint covers only local shared CTA surfaces.

Included section types for this sprint:

- `hero_cta`
- `cta_block`
- `proof_cluster`
- `case_study_split`

Explicitly excluded from this sprint:

- `nav_links` because it uses the global-section special path
- `footer_grid` because its CTA buttons are nested card content, not shared meta CTAs
- `booking_scheduler` because the primary button is operational submit, not an optional editorial CTA

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/cms/cta-visibility.ts` (new)
2. `/var/www/html/hopfner.dev-main/components/admin/section-editor/common-fields-panel.tsx`
3. `/var/www/html/hopfner.dev-main/components/admin/section-editor/section-editor-drawer-shell.tsx`
4. `/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-inspector.tsx`
5. `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`
6. `/var/www/html/hopfner.dev-main/components/admin/section-preview.tsx`
7. `/var/www/html/hopfner.dev-main/components/landing/hero-section.tsx`
8. `/var/www/html/hopfner.dev-main/components/landing/final-cta-section.tsx`
9. `/var/www/html/hopfner.dev-main/components/landing/proof-cluster-section.tsx`
10. `/var/www/html/hopfner.dev-main/components/landing/case-study-split-section.tsx`
11. add focused tests for shared CTA visibility behavior

## Source Workflows / Files To Reuse

- shared CTA form editor fields:
  - `/var/www/html/hopfner.dev-main/components/admin/section-editor/common-fields-panel.tsx`
- shared CTA visual inspector fields:
  - `/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-inspector.tsx`
- public/local preview truth:
  - `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`
  - `/var/www/html/hopfner.dev-main/components/admin/section-preview.tsx`

## Step-By-Step Implementation

1. Create `/var/www/html/hopfner.dev-main/lib/cms/cta-visibility.ts`.
2. In that helper, implement:
   - `getSharedCtaEnabled(content, key)`
   - `setSharedCtaEnabled(content, key, enabled)`
   - `isSharedCtaToggleSupported(sectionType, key)`
3. Use these exact content paths for shared CTA visibility:
   - `content.ctaPrimaryEnabled`
   - `content.ctaSecondaryEnabled`
4. Default rule:
   - if the flag is missing, treat the CTA as enabled
5. In the helper, explicitly exclude `booking_scheduler` from shared CTA toggle support.
6. Update the form editor actions panel so each eligible CTA group has:
   - a show/hide toggle
   - preserved label/link values
   - label/link inputs visually muted or disabled when hidden
7. Update `section-editor-drawer-shell.tsx` only as needed to pass section type/context into the shared actions panel.
8. Update the visual editor inspector actions group with the same toggle behavior.
9. Do not add CTA show/hide controls to the inline text overlay.
10. Update frontend renderer wiring in `app/(marketing)/[slug]/page.tsx` so the relevant sections receive explicit show/hide booleans.
11. Update admin preview wiring in `section-preview.tsx` to use the same helper and the same default behavior.
12. Update the named section components so the CTA only renders when:
   - visibility flag is enabled
   - label/href still satisfy existing section requirements
13. Keep stored label/href values unchanged when a CTA is hidden.

## Required Behavior

- Hidden CTA must disappear from:
  - public frontend
  - admin preview
  - visual editor canvas preview
- Toggling off must not clear label/href.
- Toggling back on must restore the same label/href.
- Form editor and visual editor must show the same visibility state for the same section.
- `booking_scheduler` must not show a hide toggle in this sprint.

## What Must Not Change In This Sprint

- do not add SQL columns
- do not move shared CTA labels/hrefs out of their existing fields
- do not touch global-section CTA paths yet
- do not touch footer-grid card CTA paths yet
- do not touch composed/custom CTA paths yet

## Required Tests For This Sprint

- add shared helper tests for:
  - default enabled when flag missing
  - false when explicit flag false
  - booking scheduler excluded from toggle support
- add rendered behavior tests for at least one local shared CTA section proving:
  - toggle off hides CTA
  - toggle on shows CTA
  - values are preserved
- add admin editor tests for:
  - form editor toggle UI
  - visual editor inspector toggle UI

## Gate For Moving Forward

Do not proceed until all of the following are true:

- shared CTA visibility is fully working for the included local section types
- frontend preview and admin preview agree
- form editor and visual editor agree
- booking submit remains visible and functional
