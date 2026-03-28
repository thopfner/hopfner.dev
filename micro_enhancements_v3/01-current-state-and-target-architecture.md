# Current State And Target Architecture

## Current State

### Google Analytics is unconditional today

The marketing layout currently mounts GA directly in:
- `/var/www/html/hopfner.dev-main/app/(marketing)/layout.tsx`

It uses:
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `next/script`
- `afterInteractive`

There is no consent gate in front of it today.

### Theme system is already strong

The marketing site already exposes theme variables through:
- `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`
- `/var/www/html/hopfner.dev-main/app/globals.css`

Relevant tokens already exist:
- `--background`
- `--foreground`
- `--card`
- `--card-foreground`
- `--border`
- `--accent`
- `--accent-foreground`
- `--muted`
- `--muted-foreground`
- `--radius`

Use these. Do not invent a separate visual language.

### Existing frontend reference surfaces

Current frontend components that define the product’s tone:
- `/var/www/html/hopfner.dev-main/components/ui/button.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/site-header.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/footer-grid-section.tsx`

The consent UI should feel like it belongs next to these surfaces.

## Required Architecture

### Consent persistence

Use one first-party cookie as the canonical consent store.

Required shape:

```ts
type ConsentState = {
  version: 1
  necessary: true
  analytics: boolean
  timestamp: string
  source: "accept_all" | "reject_all" | "preferences"
}
```

Store it as URL-encoded JSON in a cookie.

Do not use the database.

### Jurisdiction detection

Create one server-side helper that:
- checks deployment headers in a defined order
- returns `requireConsent: boolean`
- returns the normalized country code when available

Header check order:
1. `x-vercel-ip-country`
2. `cf-ipcountry`
3. `cloudfront-viewer-country`
4. `x-country-code`

Consent-required jurisdictions for this batch:
- EEA
- UK
- Switzerland

If no trusted header is available, return `requireConsent = true`.

### Script gating

There must be one canonical analytics gating path in the marketing layout.

Required behavior:
- if `GA_ID` is absent: render nothing
- if `requireConsent` is false: render GA normally
- if `requireConsent` is true and consent cookie allows analytics: render GA normally
- if `requireConsent` is true and consent cookie is absent or analytics is false: do not render GA at all

### UI model

Required UI pieces:
- banner
- preferences dialog or sheet
- persistent “Cookie settings” reopen control

Minimal UI contract:
- first layer: `Accept all`, `Reject all`, `Manage`
- second layer: `Necessary` (locked on), `Analytics` (toggle)

Do not add a `Marketing` category in this batch because the current live stack only loads GA.

## Files Expected To Change

- `/var/www/html/hopfner.dev-main/app/(marketing)/layout.tsx`
- `/var/www/html/hopfner.dev-main/app/globals.css`
- `/var/www/html/hopfner.dev-main/components/ui/button.tsx` only if a tiny size/variant extension is strictly necessary
- new privacy/consent helpers under `/var/www/html/hopfner.dev-main/lib`
- new marketing consent components under `/var/www/html/hopfner.dev-main/components`
- tests under `/var/www/html/hopfner.dev-main/tests`

## Stop Condition If Assumptions Break

Stop and report if any of these is false:
- GA is still loaded only from `app/(marketing)/layout.tsx`
- the site can safely use a first-party cookie for consent state
- no other hidden analytics loaders exist elsewhere in the marketing tree
