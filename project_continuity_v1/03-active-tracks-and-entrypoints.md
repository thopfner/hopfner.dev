# Active Tracks And Entry Points

## Current Active Track

### Cookie Consent Frontend Polish

Next handoff to execute:
- `/var/www/html/hopfner.dev-main/micro_enhancements_v5/README.md`

Why this exists:
- The consent UI currently renders from `/var/www/html/hopfner.dev-main/app/(marketing)/layout.tsx`
- The active marketing theme tokens are applied inside `/var/www/html/hopfner.dev-main/app/(marketing)/[slug]/page.tsx`
- Because the consent UI is outside that page-scoped theme wrapper, it can look like the default app/backend theme instead of the live page theme
- The current floating `Cookies` trigger from `/var/www/html/hopfner.dev-main/components/marketing/consent/cookie-settings-trigger.tsx` is not acceptable as a premium frontend pattern
- The correct reopen location is the footer legal area in `/var/www/html/hopfner.dev-main/components/landing/footer-grid-section.tsx`

What `micro_enhancements_v5` tells Opus to do:
- keep consent logic and GA gating unchanged
- move consent surface rendering into the themed marketing page scope
- replace the floating badge with a footer legal-area settings entry
- use a fallback only if a page truly has no footer

## Secondary Reference Tracks

These are stable context, not current active work:

### Visual Editor
- latest hero parity handoff referenced during prior work:
  - `/var/www/html/hopfner.dev-main/visual-editor_v23/README.md`

### Admin Backend
- latest admin premiumization cleanup:
  - `/var/www/html/hopfner.dev-main/admin_enhancements_v11/README.md`

### Cookie Consent Production Hardening
- already QA-cleared:
  - `/var/www/html/hopfner.dev-main/micro_enhancements_v4/README.md`

## How A Fresh Session Should Start

If the user asks for QA:
1. SSH into `root@thapi.cc`
2. `cd /var/www/html/hopfner.dev-main`
3. inspect changed files
4. run targeted tests
5. run full tests/build if needed
6. report findings first

If the user asks for a plan:
1. inspect the current remote code first
2. confirm root cause
3. create the next numbered handoff folder
4. SCP it to the VPS
5. verify the remote `README.md`
