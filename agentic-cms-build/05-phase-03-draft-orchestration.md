# Phase 3: Prompt To Draft Orchestration

## Goal

Implement prompt-driven draft site generation using existing section types and existing theme controls only, with snapshot and rollback.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/lib/cms/blueprint-apply.ts`
2. new `lib/agent/planning/*`
3. new `lib/agent/execution/*`
4. new worker handlers in `lib/agent/jobs/*`
5. new tests for plan validation, apply, rollback, and idempotency
6. any admin API additions required for job detail inspection

## Source Workflows / Files To Reuse

- snapshot/apply/restore behavior from `/var/www/html/hopfner.dev-main/lib/cms/blueprint-apply.ts`
- blueprint routes from `/var/www/html/hopfner.dev-main/app/admin/api/content/blueprint/route.ts`
- rollback route from `/var/www/html/hopfner.dev-main/app/admin/api/content/blueprint/rollback/route.ts`
- shared CMS command layer from Phase 1
- published/render truth from `/var/www/html/hopfner.dev-main/lib/cms/get-published-page.ts`

## Step-By-Step Implementation

1. Define a constrained internal plan schema for:
   - pages
   - page titles/slugs
   - ordered sections
   - section content
   - section formatting within existing controls
   - site-level theme/token changes within existing controls
2. Reject any plan that attempts:
   - unknown section types
   - custom schema creation
   - auto-publish
3. Capture a snapshot before apply.
4. Execute the plan through the shared CMS command layer.
5. Record touched pages, touched sections, and rollback snapshot id on the job.
6. Add rollback support from the job detail surface.
7. Add idempotency protection so retries do not create duplicate drafts.

## Required Behavior

- A prompt-driven job can produce draft pages/sections/theme changes only.
- Output is visible in the existing visual editor and page overview.
- Existing publish flow remains unchanged.
- Rollback restores the pre-run snapshot.

## What Must Not Change In The Phase

- Do not create new section schemas.
- Do not publish anything automatically.
- Do not bypass the command layer.
- Do not attach generated media yet unless already provided through existing media assets.

## Required Tests For The Phase

- new tests for plan validation
- new tests for snapshot/apply/rollback behavior
- new tests for idempotent re-run behavior
- targeted tests that generated drafts load in existing page/visual-editor read paths
- `npm run test`
- `npm run build`

## Gate For Moving Forward

Do not proceed until:
- a seeded prompt can create a draft-only site slice
- touched pages can be opened and inspected in the visual editor
- rollback is proven on a real run
- coding agent reports sample input, sample plan summary, touched pages, and rollback proof

