# Sprint 1: Consent Foundation And Script Gating

## Goal

Create the server-readable consent model and move GA behind one canonical gate.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/privacy/consent.ts` (new)
2. `/var/www/html/hopfner.dev-main/lib/privacy/jurisdiction.ts` (new)
3. `/var/www/html/hopfner.dev-main/components/marketing/consent/analytics-scripts.tsx` (new)
4. `/var/www/html/hopfner.dev-main/app/(marketing)/layout.tsx`

## Source Workflows / Files To Reuse

Reuse the current GA implementation from:
- `/var/www/html/hopfner.dev-main/app/(marketing)/layout.tsx`

Reuse existing theme/script patterns from:
- `/var/www/html/hopfner.dev-main/app/layout.tsx`
- `/var/www/html/hopfner.dev-main/app/globals.css`

## Step-By-Step Implementation

### Step 1

Create `lib/privacy/consent.ts`.

It must contain:
- consent type definitions
- cookie name constant
- serializer
- parser
- helper to return default empty consent state

Required cookie contract:
- URL-encoded JSON
- readable on server and client
- versioned

### Step 2

Create `lib/privacy/jurisdiction.ts`.

It must:
- read request headers passed in from server components
- normalize a country code
- classify whether consent is required

Implement the exact country set in the root-cause file.

If the header value is missing or malformed, require consent.

### Step 3

Create `components/marketing/consent/analytics-scripts.tsx`.

This component must:
- accept `gaId`
- accept `shouldLoad`
- render the exact current GA script pair only when `shouldLoad` is true
- render nothing otherwise

Do not change the GA snippet contents beyond extracting them into this component.

### Step 4

Refactor `app/(marketing)/layout.tsx` to:
- read cookies on the server
- read headers on the server
- compute `requireConsent`
- compute `shouldLoadAnalytics`
- render `AnalyticsScripts` instead of unconditional GA `<Script>` tags

Keep behavior identical to today in non-consent jurisdictions.

## Required Behavior

- No unconditional GA scripts remain in the marketing layout.
- The layout can decide server-side whether analytics may load.
- No DB dependency is introduced.

## What Must Not Change In This Sprint

- no consent banner UI yet
- no footer/settings trigger yet
- no unrelated marketing-page render changes

## Required Tests For This Sprint

Add tests for:
- consent cookie parse/serialize
- jurisdiction helper classification
- analytics gating decision logic

These may be pure/unit tests in this sprint.

## Gate For Moving Forward

Do not proceed until:
- GA is fully gated behind the new layout decision path
- helper tests pass
