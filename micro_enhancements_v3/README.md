# Micro Enhancements v3

## Scope

Implement a minimalist, compliant, theme-aware cookie consent system for the marketing site.

In scope:
- jurisdiction-aware consent requirement for Europe/UK and conservative fallbacks
- server-readable consent cookie with no database dependency
- consent-gated Google Analytics loading
- minimalist consent banner and preferences UI that inherits the live site theme
- persistent user ability to reopen cookie settings
- rendered proof for banner visibility, consent parsing, and analytics gating

Out of scope:
- admin/CMS controls for cookie policy content
- database persistence or consent audit tables
- any adtech vendor framework such as IAB TCF
- any non-cookie privacy program work beyond frontend consent gating
- third-party CMP integration

## Hard Rules

- Do not load Google Analytics before analytics consent is granted in a consent-required jurisdiction.
- Do not require a database migration.
- Use a first-party consent cookie as the canonical persistence layer.
- Keep the UI aligned to existing site theme variables. Do not introduce hardcoded theme colors.
- `Reject all` must be as easy to reach as `Accept all`.
- `Necessary` must be always on and non-editable.
- Default to requiring consent if region detection is unavailable or uncertain.
- Do not block site functionality that relies only on strictly necessary cookies.
- Keep the implementation minimal. Do not add vendor lists, purpose catalogs, or CMP-style complexity.

## Execution Order

1. Read `00-coding-agent-prompt.md`
2. Read `01-current-state-and-target-architecture.md`
3. Execute Sprint 1 in `02-sprint-1-consent-foundation-and-script-gating.md`
4. Stop and verify Sprint 1 gate
5. Execute Sprint 2 in `03-sprint-2-theme-aware-banner-and-preferences-ui.md`
6. Stop and verify Sprint 2 gate
7. Execute Sprint 3 in `04-sprint-3-persistent-settings-entry-and-proof.md`
8. Stop and verify final QA in `05-qa-and-stop-gates.md`

## Phase Gates

- Sprint 1 gate:
  - marketing layout no longer mounts GA unconditionally
  - server can parse consent cookie and jurisdiction requirement deterministically
  - no DB work introduced

- Sprint 2 gate:
  - banner and preferences UI render from existing theme tokens
  - accept/reject/manage paths all work
  - analytics remains blocked until consent

- Sprint 3 gate:
  - user can reopen settings after initial choice
  - full tests/build pass
  - no regression of marketing rendering

## Required Output From The Coding Agent

- exact files changed
- exact consent cookie shape implemented
- exact jurisdiction list implemented
- exact tests added
- exact commands run
- explicit statement that no DB migration was added

## Definition Of Done

This batch is complete only when:
- EU/UK users are prompted before GA loads
- non-consent jurisdictions either skip the banner intentionally or follow the chosen fallback exactly as specified
- the consent UI matches the live frontend theme system
- a user can later reopen cookie settings and change their choice
- all persistence is cookie-based with no schema change
- `npm test` passes
- `npm run build` passes
