# QA And Stop Gates

## Automated Checks

Run:

```bash
cd /var/www/html/hopfner.dev-main
npm test -- tests/privacy-consent.test.ts tests/privacy-consent-ui.test.tsx
npm test
npm run build
```

## Manual QA

### Theme inheritance

1. Open a light-themed page with no consent cookie.
2. Confirm banner/dialog inherit that page’s theme.
3. Open a dark-themed page with no consent cookie.
4. Confirm banner/dialog inherit that page’s theme.

### Footer placement

1. Grant or reject consent so the reopen control appears.
2. Scroll to the footer.
3. Confirm `Cookie settings` appears in the legal row, not as a floating badge.
4. Confirm it opens preferences correctly.

### Exceptional no-footer path

If any page has no footer:
1. Confirm only that page uses the fallback reopen control.
2. Confirm it is visually quieter than the old floating pill.

## Completion Report Required

The coding agent must report:
- files changed
- final owner of consent state
- where the consent surface now renders
- where the reopen trigger now renders
- whether any no-footer fallback exists
- exact tests/build results

## Final Stop Gate

Do not claim completion if:
- the consent UI still inherits root app styling instead of page styling
- the floating badge still appears on normal footer pages
- the footer reopen affordance feels like a button CTA instead of a legal/settings action
- tests/build are not green
