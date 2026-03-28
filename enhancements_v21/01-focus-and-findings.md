# Focus And Findings

Date: 2026-03-09

This revised v21 pack intentionally ignores content/copy quality and focuses only on code optimization plus the spacing-control gap identified in the latest QA pass.

## What is already working

The public frontend is visually in a good place and should not be reworked in this batch.

The current system already supports:
- semantic spacing through `sectionRhythm`
- coarse outer spacing through `outerSpacing`
- responsive layout behavior that is already working and should remain untouched

## Remaining issues to solve

### 1. Hidden renderer-backed spacing controls

The public renderer supports `spacingTop`, `spacingBottom`, and `outerSpacing` via:
- `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx#L170`
- `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx#L308`

The section drawer only exposes `outerSpacing` in:
- `/var/www/html/hopfner.dev-main/components/admin/formatting-controls.tsx#L379`

This means the frontend contract already has more section-spacing capability than the editor exposes.

### 2. Spacing controls are currently split across semantic and low-level layers without a clear structure

Today the editor exposes:
- semantic spacing via `sectionRhythm`
- low-level spacing via `outerSpacing`

But the renderer also honors:
- `spacingTop`
- `spacingBottom`

So the spacing model is partially hidden and therefore harder to reason about or use consistently.

### 3. Legacy static landing-content code is still present

The old static content object still exists in:
- `/var/www/html/hopfner.dev-main/lib/landing-content.ts#L72`

The object itself appears unused, while the type is still imported here:
- `/var/www/html/hopfner.dev-main/components/landing/contact-section.tsx#L6`

That is low-level source-of-truth drift and unnecessary code weight.

## Explicit exclusions for this pass

Do not treat these as v21 work items:
- placeholder copy
- proof metrics content
- CTA text
- dead `#` links
- publish validation
- background-treatment controls

Those can be reviewed later. This pass is only about spacing control parity and safe cleanup.
