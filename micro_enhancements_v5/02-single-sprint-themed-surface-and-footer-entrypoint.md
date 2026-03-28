# Single Sprint: Themed Consent Surface And Footer Entry Point

## Goal

Make the consent system feel native to the marketing frontend by:
- rendering the UI inside the themed page scope
- moving cookie settings into the footer legal area

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/components/marketing/consent/cookie-consent-client.tsx`
2. `/var/www/html/hopfner.dev-main/components/marketing/consent/cookie-settings-trigger.tsx`
3. `/var/www/html/hopfner.dev-main/app/(marketing)/layout.tsx`
4. `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`
5. `/var/www/html/hopfner.dev-main/components/landing/footer-grid-section.tsx`
6. `/var/www/html/hopfner.dev-main/tests/privacy-consent-ui.test.tsx`
7. any additional focused consent test file if needed

## Source Workflows / Files To Reuse

Reopen-entry visual tone:
- `/var/www/html/hopfner.dev-main/components/landing/footer-grid-section.tsx`

Current themed page scope:
- `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`

Current consent logic owner:
- `/var/www/html/hopfner.dev-main/components/marketing/consent/cookie-consent-client.tsx`

## Step-By-Step Implementation

### Step 1: Split ownership from placement

Refactor `cookie-consent-client.tsx` so it is no longer “layout-owned floating UI”.

Required result:
- one owner of consent state/actions
- separate render hooks/components for:
  - banner/dialog surface
  - reopen trigger

You may implement this as a small consent provider + hooks, or an equivalent minimal pattern.

Constraint:
- do not change consent logic
- do not change cookie writing behavior

### Step 2: Remove the current always-floating trigger from the primary path

The current `cookie-settings-trigger.tsx` fixed badge must stop being the default reopen affordance.

Required result:
- either repurpose this file into a low-noise inline legal-link style trigger
- or replace it with a new inline trigger component and retire this file from the main path

Do not leave the current floating pill in place for normal pages.

### Step 3: Move consent surface rendering into the themed page scope

In `/app/(marketing)/layout.tsx`:
- keep server-side consent parsing and jurisdiction detection
- keep GA gating there
- stop rendering the visible consent UI directly after `{children}`
- instead provide the consent state/actions downward

In `/app/(marketing)/[slug]/page.tsx`:
- render the consent banner/dialog surface from inside the root themed wrapper
- do this near the bottom of the wrapper so the fixed surface still inherits page-level CSS variables

Required behavior:
- banner/dialog must use the currently active page theme
- no visual regression to the rest of the page

### Step 4: Put the reopen control into the footer legal row

In `/components/landing/footer-grid-section.tsx`:
- add one optional prop for a legal-area auxiliary action, e.g. `legalAction` or equivalent
- render it alongside the legal links in the existing legal row
- style it like a calm textual legal/settings action, not a CTA button

In `/app/(marketing)/[slug]/page.tsx`:
- when rendering `FooterGridSection`, pass the consent settings reopen trigger into that legal area

Required behavior:
- the reopen control appears alongside legal links/copyright
- it feels like part of the footer’s legal affordances

### Step 5: Add a no-footer fallback only if necessary

If a page truly has no `footer_grid` section:
- render a minimal fallback reopen control from within the themed page wrapper
- this fallback must be smaller and quieter than the current floating badge

If all marketing pages already have a footer:
- do not keep any floating fallback

In either case, report which path was used.

## Required Behavior

- Banner/dialog inherit the page theme.
- Footer pages show cookie settings in the footer legal area.
- The always-floating cookie badge is removed from normal pages.
- Reopen behavior still works after consent has been given.

## What Must Not Change

- no changes to jurisdiction logic
- no changes to consent cookie semantics
- no changes to analytics gating
- no footer CMS schema changes
- no admin/editor work

## Required Tests

Add or update rendered tests to prove:
- consent surface can render through the themed page path instead of only the layout path
- footer legal row can host the cookie settings action
- floating trigger is not rendered on pages with a footer
- reopen flow still works

Source-inspection may be used only as a small supplement, not the primary proof.

## Gate

Do not call this complete until:
- the theme mismatch is gone
- the floating trigger is gone on standard footer pages
- the footer reopen path works
- tests and build pass
