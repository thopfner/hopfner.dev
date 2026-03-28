# Root Cause And Blockers

## Issue List

1. CMS mutation logic is still client-owned across admin/editor surfaces.
2. There is no local worker runtime, job queue, or worker deployment wiring.
3. The current deployment image only packages the standalone Next app.
4. Validation foundations exist in the database, but they are not the canonical application write path.
5. Media upload and media metadata registration are split across server and client logic.
6. There is no admin workspace for prompt-driven site-build jobs.
7. There is no end-to-end orchestration layer for prompt -> draft -> rollback.
8. Test coverage is not yet centered on server-side command, worker, and orchestration behavior.

## Why Each Issue Exists

1. The CMS grew through UI-first admin/editor workflows, so persistence logic accumulated inside browser adapters.
2. The app was deployed as a Next.js site, not as a multi-process product.
3. The Docker build copies `.next/standalone` only, which does not establish a separate worker entrypoint by default.
4. Supabase RPCs and DB validation helpers were added as supporting infrastructure, but the application never consolidated around them.
5. Media was made to work for editors first, not for autonomous worker execution.
6. There was no previous product requirement for long-running agent jobs.
7. The existing blueprint flow proves batch CMS mutation is possible, but it is hardcoded and not generalized.
8. Existing tests emphasize UI fidelity and import/parity more than execution contracts.

## Required Direction

- Extract a shared server-side CMS command layer before building the worker.
- Add a local worker and job model before adding prompt execution.
- Generalize snapshot/apply/rollback after the worker exists.
- Add the admin workspace only after the worker and orchestration core are real.
- Add media generation only after draft orchestration is stable.
- Add hardening and ship-gate work only after all earlier surfaces exist.

## Files Expected To Change

High-probability existing touchpoints:
- `/var/www/html/hopfner.dev-main/components/admin/section-editor/payload.ts`
- `/var/www/html/hopfner.dev-main/components/admin/section-editor/use-section-editor-resources.ts`
- `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-page-composition-actions.ts`
- `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-visual-section-persistence.ts`
- `/var/www/html/hopfner.dev-main/app/admin/(protected)/pages-list.tsx`
- `/var/www/html/hopfner.dev-main/app/admin/(protected)/global-sections/page-client.tsx`
- `/var/www/html/hopfner.dev-main/app/admin/api/media/upload/route.ts`
- `/var/www/html/hopfner.dev-main/app/admin/api/media/route.ts`
- `/var/www/html/hopfner.dev-main/lib/cms/blueprint-apply.ts`
- `/var/www/html/hopfner.dev-main/lib/cms/get-published-page.ts`
- `/var/www/html/hopfner.dev-main/supabase/schema.sql`
- `/var/www/html/hopfner.dev-main/supabase/migrations/*`
- `/var/www/html/hopfner.dev-main/Dockerfile`
- `/var/www/html/hopfner.dev-main/docker-compose.yml`

Expected new areas:
- `lib/cms/commands/*`
- `lib/agent/*`
- `app/admin/api/agent/*`
- `app/admin/(protected)/agentic-cms/*`
- worker entrypoint under `scripts/` or equivalent packaged runtime path
- new tests for commands, jobs, orchestration, and media generation

## Stop Condition If Assumptions Break

- Stop and report if the live repo already contains an unfinished worker/job implementation.
- Stop and report if the deployment/runtime model is different from Docker + standalone Next.
- Stop and report if existing admin/editor behavior cannot be preserved while extracting shared command logic.
- Stop and report if current DB invariants or RLS rules make the command layer assumptions invalid.

