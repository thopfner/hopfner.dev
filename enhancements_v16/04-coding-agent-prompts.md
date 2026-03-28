# Coding Agent Prompts

Use these prompts directly or adapt them lightly. They are written to keep the implementation grounded in CMS truthfulness and premium UI quality.

## Master Prompt

You are working in `/var/www/html/hopfner.dev-main`.

Upgrade the root homepage (`/home`) into an elite AI automation consultancy experience while preserving CMS truthfulness. Start by fixing the backend/frontend capability contract before redesigning visuals.

Non-negotiable constraints:

- the admin must not hide a semantic styling control that the public renderer truly uses
- the public site must not render placeholder/demo proof
- do not give every section every control; use controlled parity
- preserve the CMS-driven architecture
- keep the strongest visual ambition for the trust/proof/lower-page sections, not just the hero

Implementation order:

1. fix capability loading fallback behavior and backfill `section_control_capabilities`
2. fix repeated static heading IDs across permanent section renderers
3. remove public placeholder/null-state proof leakage
4. redesign `social_proof_strip`, `proof_cluster`, `case_study_split`, and the footer to feel top-tier and institutional
5. refine header/global chrome to match the upgraded homepage

Files to inspect first:

- `components/section-editor-drawer.tsx`
- `lib/design-system/loaders.ts`
- `lib/design-system/capabilities.ts`
- `app/(marketing)/[slug]/page.tsx`
- `components/landing/social-proof-strip-section.tsx`
- `components/landing/proof-cluster-section.tsx`
- `components/landing/case-study-split-section.tsx`
- `components/landing/what-i-deliver-section.tsx`
- `components/landing/tech-stack-section.tsx`
- `components/landing/how-it-works-section.tsx`
- `components/landing/final-cta-section.tsx`
- `components/landing/footer-grid-section.tsx`
- `components/landing/site-header.tsx`
- relevant migrations under `migrations/`

Acceptance criteria:

- homepage sections expose truthful admin styling controls
- repeated sections no longer reuse the same heading IDs
- no public placeholder proof remains
- proof stack visually feels elite and bespoke on desktop and mobile
- header/footer no longer feel like template defaults

## Batch 1 Prompt: Capability Truth + Semantics

Fix the homepage capability contract first.

Tasks:

- update capability loading so DB rows merge over code fallbacks instead of zeroing out missing section types
- add a migration to seed or update `section_control_capabilities` for homepage-relevant permanent sections
- align stale DB rows with renderer-truthful controls
- stop storing or honoring phantom semantic tokens for sections that do not really support them
- replace repeated static heading IDs with unique section-scoped IDs
- suppress public placeholder proof output, especially `Media placeholder` and template footer fallback copy

Do not start the visual redesign until this batch is done.

## Batch 2 Prompt: Proof Stack Redesign

Redesign the homepage trust/proof sequence so it feels like a top-tier AI automation consultancy rather than a starter SaaS template.

Targets:

- `social_proof_strip`
- `proof_cluster`
- `case_study_split`
- supporting spacing/surface hierarchy in adjacent sections

Design intent:

- darker institutional polish, not flashy startup gimmicks
- real evidence hierarchy
- asymmetry where it improves authority
- precise typography and spacing
- stronger contrast and role separation below the hero

Rules:

- if proof assets are missing, hide or neutralize the section rather than faking content
- only expose section-specific admin controls that produce meaningful visual differences
- preserve distinct section roles

## Batch 3 Prompt: Header + Footer Upgrade

Upgrade global sections so the page opens and closes with the same quality as the hero.

Header goals:

- stronger brand presence
- more premium sticky surface
- better active/CTA treatment

Footer goals:

- remove placeholder links and dead subscribe affordances
- turn the footer into a premium closing surface
- support a sharper brand/contact/booking close
- only add semantic/global controls if the renderer can actually honor them

## QA Prompt

Before shipping, verify all of the following:

- admin-visible controls match renderer-supported controls for homepage section types
- live DOM region labels are correct for repeated section components
- no placeholder proof strings appear on `/home`
- desktop and mobile screenshots of the proof stack and footer feel intentional, high-contrast, and non-template-like
