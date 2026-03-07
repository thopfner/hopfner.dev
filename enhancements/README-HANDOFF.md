# Hopfner.dev Coding Handoff

Start here:
- `hopfner-section-system-implementation-brief.md`

Then use these supporting documents:
- `hopfner-existing-section-map.md`
- `hopfner-section-system-instructions.md`
- `hopfner-homepage-improvement-plan.md`
- `website-design-brief.md`

Execution intent:
- This folder is written for immediate implementation, not for further strategy discussion.
- Treat the documents as direct build instructions for the codebase in `/var/www/html/hopfner.dev-main`.

Primary objective:
- improve the CMS-driven homepage section system so the frontend can render a more professional, benchmark-aligned AI / automation consultancy site

Important constraints:
- preserve the CMS-first architecture
- account for frontend rendering, admin editor support, and SQL migration implications together
- prefer extending existing primitives where sensible
- use custom/composed section types where they reduce hardcoded admin complexity

Recommended order:
1. Read `hopfner-section-system-implementation-brief.md`
2. Inspect the mapped existing system in `hopfner-existing-section-map.md`
3. Use `hopfner-section-system-instructions.md` for the desired structural target
4. Use `hopfner-homepage-improvement-plan.md` for homepage-specific future-state intent
