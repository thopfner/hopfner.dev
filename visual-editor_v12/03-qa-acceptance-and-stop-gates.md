# QA, Acceptance, And Stop Gates

## Automated Checks

Run:

```bash
cd /var/www/html/hopfner.dev-main
npm test -- tests/visual-editor
npm run build
```

If either command fails, stop and fix the failure before claiming completion.

## Manual QA

In a logged-in admin visual-editor session:

1. select a section and inspect the top-left section-type chip
2. confirm the chip reads as overlay chrome, not page spacing
3. click a primary CTA button inside the preview
4. confirm no navigation occurs
5. click a secondary CTA button inside the preview if present
6. confirm no navigation occurs
7. click CTA label text and confirm inline editing still starts
8. click the CTA link-edit affordance and confirm the destination editor still opens
9. verify section selection still works after these interactions

## Required Test Additions

The completion report must identify the exact new or updated tests for:

1. preview anchor suppression
2. preserved link-edit affordances
3. section-label chrome contract

## Completion Report Required From The Coding Agent

The completion report must include:

1. exact files changed
2. exact strategy used to suppress preview navigation
3. whether any section renderer had to be touched
4. exact test results
5. manual QA results

## Explicit Non-Goals

This batch is not about:

1. general spacing polish
2. broader CTA redesign
3. shell redesign
4. link-model refactoring

## Final Stop Gate

Do not claim completion if any of these remain true:

1. the section-type chip still looks like a real layout row
2. any CTA can still navigate away from the visual editor
3. CTA editing affordances were degraded to achieve navigation safety
