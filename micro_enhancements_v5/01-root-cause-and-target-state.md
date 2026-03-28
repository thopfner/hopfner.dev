# Root Cause And Target State

## Issue 1: Wrong theme inheritance

The current consent UI is mounted in:
- `/var/www/html/hopfner.dev-main/app/(marketing)/layout.tsx`

The active marketing theme tokens are applied inside the page-scoped wrapper in:
- `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`

Specifically:
- the themed wrapper starts at the root page `<div ... style={rootStyle}>` in that file
- `CookieConsentClient` currently renders after `{children}` in the layout, outside that wrapper

Result:
- consent UI inherits the root app tokens from `/var/www/html/hopfner.dev-main/app/globals.css`
- that visual language is much closer to the generic/default app theme than the page’s actual selected theme

This is why the consent prompt feels like the backend rather than the frontend.

## Issue 2: Bad reopen affordance

The current persistent reopen control is:
- `/var/www/html/hopfner.dev-main/components/marketing/consent/cookie-settings-trigger.tsx`

It is fixed at bottom-left on all pages.

This is not an elite frontend pattern for this site. It reads like a utility badge.

The existing footer legal area is already the correct product surface for this type of action:
- `/var/www/html/hopfner.dev-main/components/landing/footer-grid-section.tsx`

The footer legal links row already holds policy/utility affordances and should own cookie settings.

## Target State

1. Consent UI state remains layout-owned or provider-owned, but the rendered surfaces appear inside the themed marketing page scope.
2. The persistent reopen action moves into the footer legal row as a text-level legal/settings affordance.
3. The floating trigger is removed from normal pages.
4. Only if a page truly has no footer may a minimal fallback trigger exist.

## Files That Should Be In Play

- `/var/www/html/hopfner.dev-main/app/(marketing)/layout.tsx`
- `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/footer-grid-section.tsx`
- `/var/www/html/hopfner.dev-main/components/marketing/consent/cookie-consent-client.tsx`
- `/var/www/html/hopfner.dev-main/components/marketing/consent/cookie-consent-banner.tsx`
- `/var/www/html/hopfner.dev-main/components/marketing/consent/cookie-preferences-dialog.tsx`
- `/var/www/html/hopfner.dev-main/components/marketing/consent/cookie-settings-trigger.tsx`
- consent tests under `/var/www/html/hopfner.dev-main/tests`

## Required Direction

- separate consent state ownership from consent surface placement
- render the surface from inside the themed page tree
- integrate the reopen control into the footer legal row using existing frontend typography and spacing

## Stop And Report If

- you discover marketing pages that can render without any footer and the fallback cannot be implemented cleanly
- the current footer legal data path makes the insertion ambiguous in a way that would require CMS schema work
