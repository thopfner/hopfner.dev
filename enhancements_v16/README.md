# Hopfner Homepage Next Enhancements

Audit date: 2026-03-08
Live target audited: `https://hopfner.dev/` -> `https://hopfner.dev/home`
Repo target: `/var/www/html/hopfner.dev-main`

This pack is for the coding agent that will implement the next homepage upgrade. The work is not just visual polish. The homepage currently has a backend/frontend truth problem, seeded demo content leaking into public proof sections, and repeated renderer semantics that break accessibility when the same section component is used more than once.

## Read This First

1. Read `01-findings.md`.
2. Execute `02-capability-truth-plan.md` first.
3. Then execute `03-elite-ui-upgrade-plan.md`.
4. Use `04-coding-agent-prompts.md` as the implementation prompt source.
5. Use `05-acceptance-checklist.md` before shipping.

## Strategic Direction

The site already has a useful dark operator-grade baseline. The goal is to turn that into an elite AI/automation consultancy experience:

- precise, credible, institutional
- clearly outcome-driven
- strongly art-directed below the hero, not just above the fold
- CMS-truthful: the admin only exposes controls that the public renderer actually honors
- zero fake proof on the public site

## Highest-Priority Workstreams

1. Capability truth repair.
   The DB-backed capability registry is lagging behind the live renderers and published section data. Fix this before any redesign.
2. Accessibility semantics repair.
   Repeated static heading IDs are causing incorrect region labels on the live page.
3. Proof stack cleanup.
   The homepage is still showing seeded proof/demo content and a renderer-level media placeholder.
4. Elite trust/proof redesign.
   Social proof, proof cluster, case study, and footer need a materially stronger premium system.
5. Global section elevation.
   Header and footer currently feel generic and underpowered relative to the ambition of the hero.

## Non-Negotiables

- Do not render placeholder/demo content on the public site.
- Do not expose controls in admin that do not change the public renderer.
- Do not add every control to every section. Use controlled parity.
- If a proof section lacks real assets or verified content, hide it or render a neutral null-state that is clearly not fake proof.
- Preserve the CMS-driven model. This should not become hardcoded marketing content.
