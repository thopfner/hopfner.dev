# QA And Stop Gates

## Automated Checks

Run, at minimum:

```bash
cd /var/www/html/hopfner.dev-main
npm test
npm run build
```

If the repo already contains targeted privacy tests, run them explicitly in addition to the full suite.

## Manual QA

### Scenario 1: Consent-required region, first visit

1. Simulate or mock a consent-required country header.
2. Visit a marketing page with no consent cookie.
3. Confirm:
   - banner appears
   - GA does not load before consent
   - `Accept all`, `Reject all`, and `Manage` are all visible

### Scenario 2: Accept all

1. Click `Accept all`.
2. Confirm consent cookie is written.
3. Refresh.
4. Confirm GA now loads.
5. Confirm the persistent settings trigger is visible.

### Scenario 3: Reject all

1. Clear consent cookie.
2. Click `Reject all`.
3. Refresh.
4. Confirm GA still does not load.
5. Confirm settings trigger is visible.

### Scenario 4: Preferences reopen

1. Open settings from the persistent trigger.
2. Toggle analytics on/off.
3. Save.
4. Refresh.
5. Confirm GA load behavior follows the saved preference.

### Scenario 5: Theme integrity

1. Check at least one light-theme page and one dark-theme page.
2. Confirm the banner/dialog surface inherits the page theme and does not use hardcoded alien colors.

## Required Test Additions

- consent parser tests
- jurisdiction helper tests
- rendered banner visibility tests
- rendered preference save/reopen tests
- analytics gating tests

## Completion Report Required From The Coding Agent

The completion report must include:
- files changed
- exact consent cookie schema
- exact country header order
- exact consent-required jurisdiction list
- tests added
- command output summary
- explicit statement that no DB migration was added

## Explicit Non-Goals

- no admin backend controls
- no policy-page CMS authoring
- no third-party CMP
- no marketing-vendor expansion beyond GA gating

## Final Stop Gate

Do not call this complete if any of the following is true:
- GA can still load before consent in a consent-required jurisdiction
- `Reject all` is absent or buried behind `Manage`
- the UI uses hardcoded colors instead of the site theme
- there is no persistent way to reopen settings
- any DB migration is introduced
