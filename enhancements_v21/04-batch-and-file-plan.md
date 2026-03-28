# Batch And File Plan

## Batch 1: Spacing contract alignment

Files to inspect and update:
- `/var/www/html/hopfner.dev-main/components/admin/formatting-controls.tsx`
- `/var/www/html/hopfner.dev-main/components/admin/section-editor/payload.ts`
- `/var/www/html/hopfner.dev-main/lib/cms/types.ts`
- `/var/www/html/hopfner.dev-main/components/admin/section-preview.tsx`
- `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`

Concrete work:
1. Extend the section formatting type shape with `spacingTop` and `spacingBottom`.
2. Extend normalization and JSON serialization.
3. Create a dedicated `Advanced spacing` group in the formatting UI.
4. Keep `sectionRhythm` in the semantic/default layer.
5. Verify preview and live render stay aligned.

Suggested commit boundary:
- `editor: expose advanced section spacing controls`

## Batch 2: Code cleanup and source-of-truth simplification

Files to inspect and update:
- `/var/www/html/hopfner.dev-main/lib/landing-content.ts`
- `/var/www/html/hopfner.dev-main/components/landing/contact-section.tsx`
- any file importing `LandingContent`

Concrete work:
1. Move shared types out of the legacy content file.
2. Remove or archive the unused static content object.
3. Search for accidental runtime dependencies before deleting anything.

Suggested commit boundary:
- `cleanup: remove legacy static landing content object`

## Verification pass

Minimum verification:
- `npm run build`
- confirm the section drawer can save and reload `spacingTop` and `spacingBottom`
- verify preview/live parity for section spacing
- verify untouched sections render exactly as before
- confirm no public copy behavior changed in this batch
