# Coding Agent Prompt

## Role

You are implementing a minimal, compliant cookie consent system for the marketing frontend.

This is a design-sensitive infrastructure task. Treat it as script-gating and themed UI integration, not as a generic “cookie banner.”

## Execution Rules

- Execute sprints in order.
- Stop if a sprint gate fails.
- Reuse the current marketing theme/token system.
- Keep the implementation server-readable so scripts can be gated before render.
- Keep the system minimal and local to the marketing app.

## Anti-Drift Rules

- Do not add a database migration.
- Do not introduce a third-party CMP.
- Do not add IAB TCF, GPP, vendor catalogs, or purpose registries.
- Do not hardcode one visual theme for the consent UI.
- Do not mount GA conditionally in multiple places. There must be one canonical gating path.
- Do not scatter consent logic across unrelated section components.
- Do not put this behind the admin/CMS in this batch.

## Required Quality Bar

- The banner must feel native to the site.
- The user must see `Accept all`, `Reject all`, and `Manage`.
- `Reject all` must be first-layer and equivalent in effort to `Accept all`.
- Analytics must not load before consent where consent is required.
- Unknown region must fail safe to requiring consent.
- The settings re-open path must be obvious and persistent enough to satisfy “withdraw/change consent later” expectations, but still minimal.

## Required Reporting

Your completion report must include:
- files changed
- exact consent cookie shape
- exact jurisdiction behavior
- exact UI entry points added
- test/build command output
- confirmation that GA no longer loads before consent in consent-required regions
