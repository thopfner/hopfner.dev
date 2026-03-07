# Remaining Fix Brief: Composed Section `widthMode` Control Is Still Misleading

## Summary

The urgent composed-section/editor-drawer fixes are in place and the build passes.

One remaining issue is still present:

- the custom section library exposes a composed-section `widthMode` control
- the frontend composed renderer does not use it

Current result:

- editors can select `Full width`
- the section still renders inside the normal constrained container
- the control is misleading and creates a CMS/frontend mismatch

This is not blocking the urgent drawer fix, but it should be resolved so the section system is internally consistent.

## QA Finding

Affected files:

- `/var/www/html/hopfner.dev-main/app/admin/(protected)/section-library/page-client.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/composed-section.tsx`

Current behavior:

- section library editor supports:
  - `widthMode: "content" | "full"`
  - `textAlign`
  - `spacingY`
- composed frontend currently applies:
  - `textAlign`
  - `spacingY`
- composed frontend does not apply:
  - `widthMode`

## Required Decision

Choose one of these and implement it fully:

### Option A: Implement `widthMode`

Recommended if full-width composed sections are part of the intended long-term system.

Expected behavior:

- `widthMode = "content"` keeps current constrained layout
- `widthMode = "full"` allows the composed section container to expand appropriately

Implementation guidance:

1. Update `/var/www/html/hopfner.dev-main/components/landing/composed-section.tsx`
2. Route the schema token into the layout shell
3. Either:
   - extend `SectionShell` to support a width mode, or
   - bypass its fixed container class when rendering composed sections
4. Preserve existing spacing and alignment behavior
5. Ensure full-width does not break row/column spacing or mobile layout

Recommended approach:

- keep the section wrapper API clean
- avoid one-off hacks inside individual row blocks
- if useful, add a reusable width-mode prop to:
  - `/var/www/html/hopfner.dev-main/components/landing/section-primitives.tsx`

## Option B: Remove the control

Recommended only if full-width composed sections are not actually needed.

Expected behavior:

- remove `widthMode` from the section library UI
- normalize schema defaults accordingly
- remove dead token handling from composed schema types if no longer used

Implementation guidance:

1. Update `/var/www/html/hopfner.dev-main/app/admin/(protected)/section-library/page-client.tsx`
2. Remove the `Content width / Full width` segmented control
3. Remove or simplify schema token typing/defaults if appropriate
4. Make sure no saved schemas depend on the removed field in a harmful way

## Recommendation

Prefer **Option A: implement `widthMode`**.

Reason:

- the control already exists
- the concept is valid
- full-width composed sections are useful for trust strips, logo strips, workflow visuals, and proof layouts
- implementing it is better than training editors to ignore visible options

## Acceptance Criteria

If implementing `widthMode`:

- `content` and `full` produce visibly different layout behavior
- the section library control accurately affects frontend rendering
- mobile layout remains intact
- existing composed sections still render correctly

If removing `widthMode`:

- no editor-visible dead control remains
- schema defaults and types no longer imply a feature that does not exist

## Verification

Run:

```bash
cd /var/www/html/hopfner.dev-main
npm run build
```

Then verify manually:

1. Open a custom composed section type in Section Library
2. Change the width setting if Option A is chosen
3. Save the schema
4. View a page using that section
5. Confirm the rendered layout matches the setting

## Non-Goals

- no redesign of existing composed blocks
- no editor-drawer rewrite
- no unrelated visual changes

This is a cleanup pass to eliminate the last known CMS/frontend mismatch from the composed section rollout.
