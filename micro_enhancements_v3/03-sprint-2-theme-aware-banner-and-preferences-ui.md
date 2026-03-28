# Sprint 2: Theme-Aware Banner And Preferences UI

## Goal

Implement a minimalist banner and preferences surface that feels native to the site and writes the consent cookie cleanly.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/components/marketing/consent/cookie-consent-banner.tsx` (new)
2. `/var/www/html/hopfner.dev-main/components/marketing/consent/cookie-preferences-dialog.tsx` (new)
3. `/var/www/html/hopfner.dev-main/components/marketing/consent/cookie-consent-client.tsx` (new)
4. `/var/www/html/hopfner.dev-main/app/globals.css`
5. `/var/www/html/hopfner.dev-main/app/(marketing)/layout.tsx`

## Source Workflows / Files To Reuse

Visual tone should be taken from:
- `/var/www/html/hopfner.dev-main/components/ui/button.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/site-header.tsx`
- `/var/www/html/hopfner.dev-main/app/globals.css`

Do not create an admin-style panel. This must feel like the public site.

## Step-By-Step Implementation

### Step 1

Create `cookie-consent-client.tsx` as the client-side controller.

Responsibilities:
- receive initial `requireConsent` and initial parsed consent state from the server
- decide whether the banner is open
- write the consent cookie on accept/reject/preferences save
- trigger a refresh or reload after consent changes so server-side analytics gating updates cleanly

Prefer a single explicit reload after consent change over clever partial client rehydration. Simplicity is better here.

### Step 2

Create `cookie-consent-banner.tsx`.

Required content:
- short message
- `Accept all`
- `Reject all`
- `Manage`

Required design:
- compact bottom banner on desktop
- stacked bottom sheet style on mobile
- use existing theme variables only
- visually sit above page content without looking like a generic third-party CMP

Required behavior:
- `Accept all` writes analytics true
- `Reject all` writes analytics false
- `Manage` opens preferences UI

### Step 3

Create `cookie-preferences-dialog.tsx`.

Required controls:
- `Necessary` shown as always on and disabled
- `Analytics` shown as a real toggle
- save/cancel actions

No extra categories in this batch.

### Step 4

Add minimal consent UI utility styles to `app/globals.css` only if they cannot be expressed cleanly with existing utilities.

If you add styles:
- derive from current CSS variables
- keep them small and local in purpose
- do not add a separate consent theme

### Step 5

Mount `cookie-consent-client.tsx` from `app/(marketing)/layout.tsx`.

Required server props:
- `requireConsent`
- initial parsed consent state

## Required Behavior

- In consent-required jurisdictions with no consent cookie, the banner appears.
- `Reject all` is first-layer and immediate.
- `Manage` opens preferences.
- `Accept all` and `Reject all` persist choice and update the page state.
- Banner styling follows the active site theme because it relies on the same tokens.

## What Must Not Change In This Sprint

- no footer link yet
- no admin/CMS control surface
- no new tracking integrations

## Required Tests For This Sprint

Add rendered tests for:
- banner appears when consent is required and unset
- banner does not appear when consent is already stored
- `Accept all` writes analytics consent
- `Reject all` writes analytics denial
- preferences dialog shows necessary locked on and analytics toggle

## Gate For Moving Forward

Do not proceed until:
- the banner works end-to-end in rendered tests
- analytics remains blocked until consent in the tested flow
