# Root Cause: CTA Contrast And Visibility

## Issue List

1. Secondary CTA contrast is unstable across themes.
2. CTA visibility is not modeled explicitly anywhere in the CMS stack.
3. CTA render conditions are inconsistent across section types.
4. Global/footer/composed CTA editors do not all share the same code path.
5. One current CTA-like surface is actually an operational submit and must not be hideable.

## Why Each Issue Exists

### 1. Secondary CTA contrast is unstable

The shared `outline` button variant in:

- `/var/www/html/hopfner.dev-main/components/ui/button.tsx`

does not set an explicit resting text color. It sets:

- border
- background
- hover colors

but not a default text color.

At the same time, the marketing renderer injects theme/section variables in:

- `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`
- `/var/www/html/hopfner.dev-main/lib/cms/section-container-props.ts`
- `/var/www/html/hopfner.dev-main/components/admin/section-preview.tsx`

including:

- `--background`
- `--foreground`
- `--accent`
- `--card`

There is no CTA-specific secondary foreground/background pair. Because `outline` inherits text color from the surrounding context, the label can end up black, white, muted, or otherwise mismatched relative to the button surface.

### 2. CTA visibility is not modeled explicitly

Shared CTA fields are currently only:

- `ctaPrimaryLabel`
- `ctaPrimaryHref`
- `ctaSecondaryLabel`
- `ctaSecondaryHref`

in:

- `/var/www/html/hopfner.dev-main/components/admin/section-editor/types.ts`
- `/var/www/html/hopfner.dev-main/components/admin/section-editor/payload.ts`

There is no canonical visibility state.

### 3. CTA render conditions are inconsistent

Examples:

- `HeroSection` always renders the secondary CTA button:
  - `/var/www/html/hopfner.dev-main/components/landing/hero-section.tsx`
- `FinalCtaSection` hides secondary CTA when label is empty:
  - `/var/www/html/hopfner.dev-main/components/landing/final-cta-section.tsx`
- `ComposedSection` falls back to `"Primary"` even when primary label is empty:
  - `/var/www/html/hopfner.dev-main/components/landing/composed-section.tsx`

That means “hide by empty label” is not a safe or truthful feature path.

### 4. Global/footer/composed CTA editors do not share one path

Special-path files that must be handled explicitly:

- `/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-global-section-panel.tsx`
- `/var/www/html/hopfner.dev-main/components/admin/section-editor/editors/footer-card-row.tsx`
- `/var/www/html/hopfner.dev-main/components/admin/section-editor/editors/custom-block-editor.tsx`
- `/var/www/html/hopfner.dev-main/app/admin/(protected)/section-library/page-client.tsx`

`nav_links` and `footer_grid` do not rely only on the generic shared CTA inspector path in the visual editor.

### 5. Booking submit must remain visible

`booking_scheduler` uses the primary CTA label as the submit label in:

- `/var/www/html/hopfner.dev-main/components/landing/booking-scheduler-section.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/booking-scheduler-client.tsx`

This is not an optional editorial CTA. Hiding it would break the booking flow.

## Required Direction

### Storage direction

Do not add SQL columns in this batch.

Use additive JSON/content flags:

- shared section CTA visibility:
  - `content.ctaPrimaryEnabled`
  - `content.ctaSecondaryEnabled`
- footer card CTA visibility:
  - `content.cards[i].ctaPrimary.enabled`
  - `content.cards[i].ctaSecondary.enabled`
- composed/custom block CTA visibility:
  - `ctaPrimaryEnabled`
  - `ctaSecondaryEnabled`

Default behavior:

- if the visibility flag is absent, treat the CTA as enabled

### Contrast direction

Fix the defect in the shared button contract first.

Do not patch individual sections with hardcoded text colors.

### Editor direction

Local shared CTA sections:

- use the shared form-editor actions panel
- use the visual-editor inspector actions group

Global/footer/composed paths:

- update the actual special-path editors in those files
- do not assume the generic inspector will cover them

### Visual editor direction

For CTA visibility:

- use inspector/panel toggles only
- preview must update immediately
- when hidden, keep stored label/link values intact
- disable or visually mute the associated label/link fields while hidden instead of deleting values

## Files Expected To Change

Shared/system:

- `/var/www/html/hopfner.dev-main/components/ui/button.tsx`
- `/var/www/html/hopfner.dev-main/lib/cms/cta-visibility.ts` (new helper)

Local shared CTA surfaces:

- `/var/www/html/hopfner.dev-main/components/admin/section-editor/common-fields-panel.tsx`
- `/var/www/html/hopfner.dev-main/components/admin/section-editor/section-editor-drawer-shell.tsx`
- `/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-inspector.tsx`
- `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`
- `/var/www/html/hopfner.dev-main/components/admin/section-preview.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/hero-section.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/final-cta-section.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/proof-cluster-section.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/case-study-split-section.tsx`

Global/footer/composed CTA surfaces:

- `/var/www/html/hopfner.dev-main/components/landing/site-header.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/footer-grid-section.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/composed-section.tsx`
- `/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor-global-section-panel.tsx`
- `/var/www/html/hopfner.dev-main/components/admin/section-editor/editors/footer-card-row.tsx`
- `/var/www/html/hopfner.dev-main/components/admin/section-editor/editors/custom-block-editor.tsx`
- `/var/www/html/hopfner.dev-main/app/admin/(protected)/section-library/page-client.tsx`

Tests:

- add targeted component/behavior tests for contrast and visibility

## Stop Condition If Assumptions Break

Stop and report before broadening scope if any of the following is true:

- a CTA surface is not editorial and hiding it would break a workflow
- a named global/composed surface uses a different persistence path than documented here
- the shared button-system fix causes a regression in non-CTA outline buttons that cannot be corrected without a broader button-variant redesign
