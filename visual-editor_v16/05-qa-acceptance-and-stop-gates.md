# QA Acceptance And Stop Gates

## Automated Checks

Run all of the following:

1. `npm test -- tests/visual-editor`
2. `npm run build`

Do not claim completion if either command fails.

## Manual QA

Run all of the following in the live visual editor:

1. select several sections and verify the section chrome feels lighter and less noisy than before
2. confirm the selected section remains clearly identifiable without overusing chips or badges
3. scan a long page in the structure rail and verify titles/statuses are easier to parse
4. verify long section titles degrade gracefully in the rail
5. deselect everything and verify the page settings panel feels intentional and premium
6. verify primary actions remain obvious at common laptop viewport widths
7. if a schema-backed composed section is available, verify it is not visually blocked on canvas
8. if an unsupported composed section is available, verify the fallback remains truthful

## Required Test Additions

The completion report must identify the new or upgraded tests for:

1. section-node chrome/state logic if any helper is extracted
2. structure-rail status/summary logic if any helper is extracted
3. page-panel or toolbar hierarchy logic if any helper is extracted
4. composed-section canvas truthfulness

## Completion Report Required From The Coding Agent

The completion report must include:

1. exact files changed
2. the exact canvas chrome elements reduced, consolidated, or restyled
3. the exact structure-rail improvements shipped
4. the exact page-panel and action-visibility improvements shipped
5. the exact composed-section canvas contradiction removed or narrowed
6. exact automated command output summaries
7. exact manual QA results for each scenario above

## Explicit Non-Goals

Do not claim completion for any of the following:

1. broad editor redesign
2. new content-editing capabilities
3. new collaboration systems
4. schema redesign

## Final Stop Gate

Stop and report instead of claiming success if any of the following is true:

1. the editor becomes busier instead of calmer
2. action discoverability gets worse at common laptop sizes
3. composed sections are still telling contradictory stories between canvas and inspector
4. the only proof for any touched behavior is a source-string or import-only test
