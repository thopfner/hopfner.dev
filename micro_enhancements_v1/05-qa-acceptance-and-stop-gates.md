# QA Acceptance And Stop Gates

## Automated Checks

Run all relevant test slices plus the clean build before claiming completion.

Minimum required commands:

```bash
npm test
rm -rf .next && npm run build
```

If the full test suite is too slow during sprint work, you may run targeted slices during the sprint, but the final report must include the full commands above.

## Manual QA

### Sprint 1 manual QA

- Verify secondary CTA contrast on at least:
  - hero
  - final CTA
  - footer grid card CTA
  - any other marketing surface using `variant="outline"`
- Verify no section component gained a hardcoded black/white CTA text class to achieve the fix.

### Sprint 2 manual QA

For each included local shared CTA section type:

- toggle primary CTA off in form editor
- confirm preview hides CTA immediately
- save/publish
- confirm frontend hides CTA
- reopen editor
- confirm label/href are preserved
- repeat in visual editor inspector

Also verify:

- booking scheduler still shows and uses the submit button

### Sprint 3 manual QA

- toggle header CTA off for `nav_links`
- confirm frontend header CTA hides
- confirm visual editor global panel shows the same state
- toggle footer card primary and secondary CTA off/on
- confirm per-card frontend behavior matches
- toggle composed/custom CTA off/on
- confirm runtime/frontend and composer previews agree
- confirm section-library composer preserves the new flags after save/reload

## Required Test Additions

The new tests must prove behavior, not source strings.

Disallowed as primary proof:

- `fs.readFileSync(...)`
- `source.includes(...)`
- grep-style assertions against source text

Required proof style:

- render components
- exercise helper functions
- assert visible/not visible CTA behavior
- assert editor controls preserve labels/hrefs when toggled off

## Completion Report Required From The Coding Agent

Your final report must include:

- exact files changed
- exact tests run
- exact build command result
- any surface intentionally left unchanged
- confirmation that `booking_scheduler` submit was not made hideable

## Explicit Non-Goals

- no booking-flow disable feature
- no admin toolbar/button redesign
- no new CTA animation work
- no schema migration for CTA visibility

## Final Stop Gate

Do not claim completion until all of the following are true:

- secondary CTA contrast defect is fixed systemically
- local shared CTA visibility is working
- global/footer/composed CTA visibility is working
- frontend and admin previews are truthful
- labels and hrefs are preserved when hidden
- booking submit remains visible and functional
- full tests pass
- clean build passes
