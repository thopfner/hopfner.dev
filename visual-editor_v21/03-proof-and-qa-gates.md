# Proof And QA Gates

## Required Commands

Run from `/var/www/html/hopfner.dev-main`:

```bash
npm test -- tests/visual-editor
npm run build
```

## Required Rendered Proof

You must add rendered/component proof for:

1. `SectionPreview` embedded mode mounting `chromeSlot` inside the scaled preview surface
2. the node still providing the chrome slot
3. the old sibling pattern no longer existing

Pure resolver tests are not enough.

## Required Manual QA

In the live visual editor, verify at minimum:

1. `Card Grid`
2. `Social Proof Strip`
3. `Title/Body List`

For each:

1. the chip sits visually on the section itself
2. the top-right actions sit visually on the section itself
3. there is no fake row effect

## Stop Conditions

Stop and report immediately if:

1. `chromeSlot` is still outside the scaled preview surface
2. the fix is only offset tweaking
3. the chip still reads as a separate row after live QA
4. tests or build fail

## Completion Report Requirements

The completion report must include:

1. exact old mount point
2. exact new mount point
3. whether chrome now scales with the preview surface
4. exact tests added
5. exact live QA observations for the three required sections
