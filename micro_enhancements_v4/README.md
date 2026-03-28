# Micro Enhancements v4

## Title

Cookie Consent Production Hardening

## Scope

This sprint closes the remaining rollout blockers from `micro_enhancements_v3`.

In scope:
- secure consent cookie writing for production HTTPS usage
- suppressing the consent UI when no optional tracking is configured
- tightening consent parser validation for stored `source`
- proof for the exact hardening behavior above

Out of scope:
- any redesign of the consent UI
- any new consent categories
- any admin/CMS controls
- any new analytics vendors
- any database persistence

## Hard Rules

- Keep the existing consent architecture from `micro_enhancements_v3`.
- Do not change the consent cookie shape.
- Do not rework jurisdiction detection.
- Do not change the visual design unless a tiny non-functional adjustment is required for testability.
- Do not introduce a DB migration.
- Do not proceed if the new hardening breaks existing consent tests.

## Exact Fix Steps

### 1. Harden consent cookie attributes

File to change:
- `/var/www/html/hopfner.dev-main/components/marketing/consent/cookie-consent-client.tsx`

Required change:
- update the consent cookie write path so it includes `Secure` in production contexts
- keep `path=/`, `max-age`, and `SameSite=Lax`

Implementation rule:
- do not blindly force `Secure` in all contexts if that would break local non-HTTPS development
- use a deterministic environment-aware check suitable for Next.js frontend runtime

Required behavior:
- production over HTTPS writes a secure consent cookie
- local development remains workable

### 2. Suppress banner/settings UI when there is nothing optional to consent to

Files to change:
- `/var/www/html/hopfner.dev-main/app/(marketing)/layout.tsx`
- `/var/www/html/hopfner.dev-main/components/marketing/consent/cookie-consent-client.tsx`

Required change:
- introduce one explicit boolean representing whether optional tracking exists for the current build
- for this batch, derive that only from `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- if no optional tracking is configured, do not render the consent client at all

Required behavior:
- if `GA_ID` is missing, no consent banner or settings trigger appears
- if `GA_ID` exists, current consent-required logic remains in force

Do not scatter this check across multiple components. The layout must remain the canonical place that decides whether the consent system is relevant.

### 3. Tighten parser validation

File to change:
- `/var/www/html/hopfner.dev-main/lib/privacy/consent.ts`

Required change:
- validate `source` against the allowed union:
  - `accept_all`
  - `reject_all`
  - `preferences`

Required behavior:
- malformed or unknown `source` values parse as invalid and return `null`

### 4. Proof

Files to change:
- `/var/www/html/hopfner.dev-main/tests/privacy-consent.test.ts`
- `/var/www/html/hopfner.dev-main/tests/privacy-consent-ui.test.tsx`

Required tests:
- cookie write path includes secure behavior under production conditions
- cookie write path remains usable under development conditions
- consent UI does not render when no optional tracking is configured
- consent UI still renders when optional tracking exists and consent is required
- parser rejects unknown `source`

These tests must target the actual new behavior, not source-string inspection.

## What Must Not Change

- no change to the banner copy
- no change to the preferences structure
- no change to jurisdiction list
- no change to analytics gating rules beyond suppressing the UI when there is nothing optional to gate

## Required Commands

```bash
cd /var/www/html/hopfner.dev-main
npm test -- tests/privacy-consent.test.ts tests/privacy-consent-ui.test.tsx
npm test
npm run build
```

## Completion Gate

Do not claim this sprint complete until all of the following are true:
- consent cookie is securely written in production contexts
- no banner/settings UI renders when no optional tracking is configured
- parser rejects invalid `source`
- all consent tests pass
- full test suite passes
- build passes
