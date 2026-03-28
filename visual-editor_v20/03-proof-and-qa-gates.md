# Proof And QA Gates

## Required Commands

Run from `/var/www/html/hopfner.dev-main`:

```bash
npm test -- tests/visual-editor
npm run build
```

If either fails, stop.

## Required Rendered Proof

The proof for this batch must include at least:

1. one rendered test for the embedded preview surface anchor
2. one rendered test for the node chrome placement model
3. one assertion that the old boundary-straddling layout is no longer the active implementation

Pure resolver tests may remain, but they are not sufficient.

## Required Manual QA

On a real visual-editor page:

1. select `Card Grid`
2. select `Social Proof Strip`
3. select `Title/Body List`
4. confirm there is no visible fake row or fake gap above the section
5. confirm the chip is fully perceived as overlay chrome
6. confirm the top-right actions are also overlay chrome

## Stop Conditions

Stop and report immediately if:

1. the fix is only a changed offset on the old anchor model
2. the preview host still paints the dark top band
3. the chip still reads as a separate row
4. a real selected section still looks wrong in manual QA
5. tests or build fail

## Completion Report Requirements

The completion report must include:

1. exact files changed
2. exact old anchor model
3. exact new surface anchor model
4. whether the embedded preview host background changed and why
5. exact rendered tests added
6. exact manual QA observations for the three required section types
