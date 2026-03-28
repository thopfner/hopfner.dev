# QA Acceptance And Stop Gates

## Automated Checks

Run all of the following:

1. `npm test -- tests/visual-editor`
2. `npm run build`

Do not claim completion if either command fails.

## Manual QA

Run all of the following in the live visual editor:

1. open or select a schema-backed composed section and verify there is no misleading unsupported canvas state
2. open or select an unsupported composed section and verify the fallback remains truthful
3. deselect all sections and verify the page-workspace footer remains visible in a clean state
4. make a page-setting change and verify the footer switches clearly to a dirty state
5. scan a long page in the structure rail and verify title readability is improved
6. verify global locked sections communicate both “global” and “locked”

## Required Test Additions

The completion report must identify the new or upgraded tests for:

1. shared composed-support classification
2. clean and dirty page-panel footer states
3. structure-rail row semantics and global/locked meaning

## Completion Report Required From The Coding Agent

The completion report must include:

1. exact files changed
2. the shared composed-support helper or decision path introduced
3. the page-panel footer behavior in clean and dirty states
4. the exact rail readability and lock/global semantics changes
5. exact automated command output summaries
6. exact manual QA results for each scenario above

## Explicit Non-Goals

Do not claim completion for any of the following:

1. new editor features
2. broad shell redesign
3. schema redesign
4. public frontend changes

## Final Stop Gate

Stop and report instead of claiming success if any of the following are true:

1. canvas and inspector still use different composed-support standards
2. the page-workspace footer still disappears in the clean state
3. global locked sections are still ambiguous in the rail
4. the only proof for any touched behavior is a source-string or import-only test
