# Micro Enhancements v5

## Scope

This sprint fixes the remaining product-quality issues in the live cookie consent experience:
- the consent UI currently inherits the wrong theme scope
- the persistent `Cookies` trigger is currently a floating badge that does not fit the product

In scope:
- make the consent banner/dialog inherit the live marketing page theme
- remove the always-floating cookie settings badge
- move the cookie settings entrypoint into the footer legal area
- add a constrained fallback only for pages that truly do not render a footer
- proof for the exact theme-scope and trigger-placement behavior

Out of scope:
- any new consent categories
- any changes to consent logic, jurisdiction logic, or analytics gating
- any admin/CMS controls
- any redesign of footer content beyond inserting the cookie settings entry cleanly

## Hard Rules

- Keep the current consent architecture and cookie contract from `micro_enhancements_v4`.
- Do not change the analytics gate.
- Do not change consent copy unless a tiny wording tweak is required for footer placement.
- Do not keep a permanent floating cookie button on pages that have a footer.
- Do not hardcode a consent theme. The UI must inherit the live page theme tokens.
- Reuse existing frontend design primitives where possible. Do not style this like the admin backend.
- If a page has no footer, use the smallest possible fallback trigger and only on those pages.

## Execution Order

1. Read `00-coding-agent-prompt.md`
2. Read `01-root-cause-and-target-state.md`
3. Execute `02-single-sprint-themed-surface-and-footer-entrypoint.md`
4. Stop and verify `03-qa-and-stop-gates.md`

## Definition Of Done

This sprint is complete only when:
- the consent banner/dialog inherit the active marketing page theme rather than the root app theme
- the floating `Cookies` badge is gone on normal pages with a footer
- the user can reopen cookie settings from the footer legal area
- any fallback trigger appears only on pages without a footer
- tests prove the new placement and theme-scoped render path
- `npm test` passes
- `npm run build` passes
