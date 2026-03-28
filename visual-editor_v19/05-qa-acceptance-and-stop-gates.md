# QA Acceptance And Stop Gates

## Required Commands

Run all of the following from `/var/www/html/hopfner.dev-main`:

```bash
npm test -- tests/visual-editor
npm run build
```

If either command fails, stop and report the exact failure.

## Manual QA Checklist

Use the visual editor on a real page and verify all of the following:

1. select a section such as `Card Grid`
2. confirm the section type chip does not appear to sit on its own row
3. confirm there is no false blank band above the section content
4. confirm the top-right actions also read as overlay chrome, not as layout content
5. confirm the chip still communicates global/locked and dirty state correctly where applicable
6. confirm the footer is visible when the page is clean
7. confirm the footer keeps the same slot structure after making a page-setting change
8. confirm saving returns the footer to the clean state without structural jump

## Stop Conditions

Stop and report immediately if any of the following occur:

1. the selected section still appears to have extra top spacing created by chrome
2. the chip is still rendered as part of a full-width top row
3. the footer still changes structural footprint between clean and dirty states
4. global/locked or dirty semantics become less clear while fixing placement
5. the proof still relies mainly on pure resolver tests
6. `npm test -- tests/visual-editor` fails
7. `npm run build` fails

## Completion Report Requirements

The completion report must include:

1. exact files changed
2. exact old and new node-chrome placement model
3. exact footer slot structure in clean and dirty states
4. exact rendered tests added or upgraded
5. exact manual QA performed against the screenshot regression
6. exact command output summaries for test and build
7. any blocker or compromise, with the exact reason
