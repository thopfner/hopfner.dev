# Safety Snapshot — 2026-02-19 14:20 UTC

Before implementation:

- Repo path: `/var/www/html/hopfner.dev-admin`
- Git metadata: **missing** (`.git` directory not present)
- Existing admin/CMS model: Supabase-backed pages/sections/section_versions with client-side CRUD + RPC publish/restore
- Existing API routes: bootstrap + media only
- Existing server admin client supports service-role workflows (`lib/supabase/server-admin.ts`)
- Content blueprint source to apply: `/var/www/html/claw.hopfner.dev/data/openclaw-workspace/public/hopfner-dev-website-blueprint.md`

Risk controls planned:

1. Add migration-based snapshot table for rollback safety.
2. Add admin-only backend API endpoints for blueprint plan/apply/rollback.
3. Validate and normalize payload contract before writes.
4. Keep section model and CRUD compatibility (reuse existing section types).
5. Run lint/build after changes.
