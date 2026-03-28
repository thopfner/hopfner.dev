# Sprint 1: Secondary CTA Contrast

## Goal

Fix secondary CTA contrast through the shared button contract so that secondary CTA labels remain legible across theme/token combinations without adding per-section color hacks.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/components/ui/button.tsx`
2. add a focused test file for the shared button contract

## Source Workflows / Files To Reuse

- theme variable injection:
  - `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`
  - `/var/www/html/hopfner.dev-main/lib/cms/section-container-props.ts`
  - `/var/www/html/hopfner.dev-main/components/admin/section-preview.tsx`

These files prove that `--background` and `--foreground` are the canonical theme pair. Reuse that assumption. Do not invent CTA-specific hardcoded text colors in section components.

## Step-By-Step Implementation

1. Update the shared `outline` button variant in `/var/www/html/hopfner.dev-main/components/ui/button.tsx`.
2. Add an explicit resting text color that uses the theme foreground token.
3. Keep the existing hover behavior:
   - hover background remains accent-driven
   - hover text remains `accent-foreground`
4. Do not modify:
   - `hero-section.tsx`
   - `final-cta-section.tsx`
   - `footer-grid-section.tsx`
   - `site-header.tsx`
   for color in this sprint.
5. Add a focused test that proves the `outline` variant includes an explicit foreground class instead of inheriting text color from its parent.

## Required Behavior

- Secondary CTA buttons must render with a stable, explicit resting text color.
- Resting text color must follow the active theme foreground token.
- Hover state must still flip to accent/`accent-foreground`.
- Existing gradient/primary CTA buttons must remain unchanged.

## What Must Not Change In This Sprint

- no CTA visibility work yet
- no editor UI changes yet
- no per-section button color overrides
- no schema changes

## Required Tests For This Sprint

- add a button-variant test that asserts the `outline` variant includes explicit foreground styling
- run the relevant test file plus the full existing frontend/admin suite that already protects the project baseline

## Gate For Moving Forward

Do not proceed until all of the following are true:

- the shared button test passes
- secondary CTA text is visually legible in at least:
  - hero
  - final CTA
  - footer card secondary CTA
  - site header mobile menu outline button remains acceptable
- no section component was patched with a hardcoded text color to achieve the result
