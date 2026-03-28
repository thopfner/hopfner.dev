# v9 QA Read And Priority

## Current Grade

Current coding-agent grade: `A-`

Why it improved:

- the editor is now clearly real, not exploratory
- the latest shell improvements are visible in the live admin window
- the core UX issues are being attacked in the right place
- build and test health remain strong

Why it is not A/A+ yet:

- the display-text edit experience is still not fully comfortable
- the false-dirty fix is implemented but not sufficiently protected by tests
- the last layer of product polish is still missing

## What Improved Materially

Visible or code-confirmed improvements:

- large text now uses an overlay editing path instead of pure in-flow replacement
- dirty-state logic now has field-level and draft-level guards
- structure rail shows section titles first
- structure rail has search
- top bar now has a page chooser

These are real upgrades.

## What v9 Must Focus On

1. make display-text editing feel comfortable, not just technically possible
2. make the dirty-state fix provably reliable
3. add only a small amount of high-signal product polish

Do not add broad new functionality before those are complete.
