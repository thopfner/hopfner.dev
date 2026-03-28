# Enhancements v13

Files in this handoff:

- `backend-frontend-linkage-qa-audit.md`
  - current-state audit of live homepage rendering and CMS linkage
  - identifies where content is truly CMS-driven vs seeded vs hardcoded in public renderers

- `new-sections-follow-up-plan.md`
  - roadmap for adding new AI/SaaS-relevant content sections
  - includes pricing/comparison tables, bento grids, scroll progress, floating CTA, and accent variants

Recommended order:

1. read `backend-frontend-linkage-qa-audit.md`
2. fix the truthfulness issues in the public renderers
3. then execute `new-sections-follow-up-plan.md`

Do not start new section work before the current renderer fallback leakage is understood.
