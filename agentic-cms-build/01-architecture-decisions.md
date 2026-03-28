# Architecture Decisions

## Deployment Model

- Use a per-deployment local worker on each customer VPS.
- The worker is a separate runtime surface from the Next.js app.
- The worker is not publicly exposed.
- The worker is not a browser-driven shell bridge.

## Credential Ownership

- Customer-owned model/provider credentials live on the VPS in local deployment secrets.
- The worker reads raw provider secrets.
- The admin UI must only receive capability/config status, never raw keys.
- v1 must support local provider credentials without any external control plane dependency.

## Trust Boundaries

- Human admins authenticate through the existing admin session model.
- Worker execution uses server-local credentials and service-role access.
- Browser sessions must not be reused as worker identity.
- v1 does not expose a public agent API for third-party callers.

## Mutation Model

- Build a shared server-side CMS command layer.
- Route handlers, admin UI adapters, and the local worker must converge on the same command layer.
- Prompt text must never map directly to raw table writes.
- Preserve the existing truth of pages, sections, versions, globals, formatting settings, and publish RPCs.

## Draft / Publish Model

- Worker output is draft-only in v1.
- Visual editor and page overview remain the review surface.
- Existing publish controls remain the only publish surface.
- No auto-publish path is allowed in v1.

## Scope Limits For V1

- Existing section types only.
- Existing theme controls and tokens only.
- No `section_type_registry` mutation.
- No custom schema generation.
- No customer-facing shell or Codex CLI runtime in the admin panel.

## Snapshot / Rollback Model

- Every apply run must capture a rollback snapshot before mutations.
- Rollback must be job-linked and operator-visible.
- Reuse the existing blueprint snapshot/apply/rollback pattern as the starting point.

## Media Model

- Generated images must enter the system through the supported media pipeline.
- Storage upload and media metadata registration must be server-owned.
- Worker-side image generation must be provider-abstracted.
- Initial provider scope can start with Gemini, but the architecture must keep the provider boundary explicit.

## Runtime Packaging

- The current deployment ships a standalone Next app only.
- The roadmap must add explicit worker packaging and compose/runtime wiring.
- The worker must not depend on interactive shells or terminal sessions.

## Source Files To Reuse

Key existing implementation surfaces:
- `/var/www/html/hopfner.dev-main/lib/cms/get-published-page.ts`
- `/var/www/html/hopfner.dev-main/lib/cms/blueprint-apply.ts`
- `/var/www/html/hopfner.dev-main/app/admin/api/content/blueprint/route.ts`
- `/var/www/html/hopfner.dev-main/app/admin/api/content/blueprint/rollback/route.ts`
- `/var/www/html/hopfner.dev-main/components/admin/section-editor/payload.ts`
- `/var/www/html/hopfner.dev-main/components/admin/section-editor/use-section-editor-resources.ts`
- `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-page-composition-actions.ts`
- `/var/www/html/hopfner.dev-main/components/admin/visual-editor/use-visual-section-persistence.ts`
- `/var/www/html/hopfner.dev-main/app/admin/(protected)/global-sections/page-client.tsx`
- `/var/www/html/hopfner.dev-main/app/admin/api/media/upload/route.ts`
- `/var/www/html/hopfner.dev-main/app/admin/api/media/route.ts`
- `/var/www/html/hopfner.dev-main/supabase/schema.sql`
- `/var/www/html/hopfner.dev-main/Dockerfile`
- `/var/www/html/hopfner.dev-main/docker-compose.yml`

