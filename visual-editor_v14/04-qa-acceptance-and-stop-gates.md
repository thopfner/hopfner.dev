# QA Acceptance And Stop Gates

## Automated Checks

Run all of the following:

1. `npm test -- tests/visual-editor`
2. `npm run build`

Do not claim completion if either command fails.

## Manual QA

Run all of the following in the visual editor:

1. click a small text field such as eyebrow, small body label, or CTA label and verify it opens the same overlay editing system used by larger text
2. click a large display title and verify the overlay is still readable, starts at the top of the content, and feels intentionally sized
3. click into a plain-text field and blur without changing the value; verify no unsaved-change prompt is created
4. change a plain-text field, navigate away, and verify the unsaved-change prompt still appears
5. edit a page-level visual setting and verify the preview updates before save
6. save the page-level change and verify it persists through reload
7. open a composed section that uses link fields and verify page, anchor, and custom-link flows work
8. open a composed section that uses image/media fields and verify real media-library selection works
9. click a CTA or linked element in the preview and verify no navigation occurs
10. keyboard-activate a CTA or linked element in the preview and verify no navigation occurs

## Required Test Additions

The completion report must identify the new or upgraded behavior tests for:

1. unified overlay editing for small text
2. unified overlay editing for large text
3. no-op focus/blur dirty-state protection
4. page preview truth before save
5. composed-section real link resources
6. composed-section real media flow
7. click-safe preview links
8. keyboard-safe preview links

## Completion Report Required From The Coding Agent

The completion report must include:

1. exact files changed
2. the removed inline text-edit path and where it previously lived
3. the exact page-preview draft values now feeding the canvas
4. the exact link/media resource helpers reused for composed sections
5. the exact keyboard events now blocked at the preview boundary
6. exact automated command output summaries
7. exact manual QA results for each scenario above

## Explicit Non-Goals

Do not claim completion for any of the following:

1. general shell polish
2. rich-text redesign beyond compatibility work
3. new global-section workflow features
4. custom schema redesign

## Final Stop Gate

Stop and report instead of claiming success if any of the following is true:

1. a plain-text field still uses an inline editing path while other plain-text fields use an overlay
2. page-level settings still require save before the preview changes
3. composed-section link/media behavior is still stubbed or URL-only
4. preview links remain navigable by any supported interaction path
5. the only proof for any touched behavior is a source-string or import-only test
