# QA And Stop Gates

## Automated Checks

Run, at minimum:

```bash
cd /var/www/html/hopfner.dev-main
npm test -- tests/button-variants.test.ts tests/cta-visibility.test.ts
npm test -- tests/visual-editor
npm test
npm run build
```

If any command fails, stop and fix it before claiming completion.

## Manual QA

### Visual inspector

1. Open a section with shared CTA controls in the visual editor.
2. Turn off primary CTA.
3. Confirm:
   - primary label input is disabled
   - primary link input is disabled
   - current values remain visible
4. Turn primary CTA back on.
5. Confirm the same values are still present and editable.
6. Repeat for secondary CTA.

### Global header CTA

1. Open the global nav/header section in the visual editor.
2. Turn off the header CTA.
3. Confirm label/link fields are disabled but values remain.
4. Turn it back on and confirm values persist.

### Global footer CTA

1. Open a footer card with CTA buttons in the global visual panel.
2. Turn off CTA 1 and CTA 2 independently.
3. Confirm the corresponding fields disable independently and preserve values.
4. Turn them back on and confirm values persist.

### Footer subscribe truth

1. Open the global footer visual panel.
2. Confirm there is no top-level `Subscribe` block.
3. Confirm footer subscribe editing is only available in the truthful card-level editing path.

## Required Test Additions

- rendered test for visual inspector CTA disable-state
- rendered test for global header CTA disable-state
- rendered test for footer card CTA disable-state
- rendered test that the top-level footer subscribe block is absent

## Completion Report Required From The Coding Agent

The completion report must include:
- files changed
- exact hidden-field behaviors fixed
- exact tests added or rewritten
- command output summary
- explicit confirmation that CTA labels/links are preserved while hidden
- explicit confirmation that the top-level footer subscribe block no longer renders

## Explicit Non-Goals

- do not add CTA toggles to booking submit controls
- do not redesign CTA layouts
- do not touch frontend copy
- do not change save/publish semantics

## Final Stop Gate

Do not call this batch complete if any of the following is still true:
- a hidden CTA field remains editable in either visual-editor surface
- toggling hide/show clears CTA values
- the global footer visual panel still shows top-level subscribe controls
- proof is still only helper-level or source-inspection for the new behaviors
