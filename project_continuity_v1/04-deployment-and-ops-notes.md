# Deployment And Ops Notes

## Current Live Service

The site runs under:
- `hopf.thapi.cc.service`

Observed service notes:
- systemd starts the app with `next start`
- there was a warning in logs that standalone output should be started with `node .next/standalone/server.js`

This is relevant if future deployment work touches startup behavior.

## Cookie Consent / GA Deployment Note

Important operational detail discovered during QA:
- `NEXT_PUBLIC_*` values are build-time values in Next.js
- if `NEXT_PUBLIC_GA_MEASUREMENT_ID` is not present during build, the consent UI and GA path will not behave as expected in production

This mattered during the consent rollout:
- missing GA env at build time made it look like the Netherlands consent logic was broken
- the actual issue was deployment configuration

## QA Command Pattern

Common verification commands used for this project:

```bash
cd /var/www/html/hopfner.dev-main
npm test
npm run build
```

Targeted suites are often used first, then full verification.

## When Starting A Fresh Session

Useful first commands:

```bash
ssh root@thapi.cc
cd /var/www/html/hopfner.dev-main
git status --short
```

Then inspect the currently active handoff folder and the touched feature files.
