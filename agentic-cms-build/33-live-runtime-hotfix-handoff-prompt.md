# Live Runtime Hotfix Handoff Prompt

## Status

There is a confirmed production runtime mismatch on `hopf.thapi.cc`.

The current issue is not a CMS database read outage.
The server-rendered public HTML still contains live published CMS data.

The real failure is:

- live HTML references stale Next.js chunk hashes
- those chunk URLs fail on the public site
- the active production process is still the older systemd `hopf.thapi.cc.service` on port `3010`
- the current repo `.next` build output contains newer chunk hashes than the ones referenced by the running process

Read this review first:

- `/var/www/html/hopfner.dev-main/agentic-cms-build/32-live-runtime-mismatch-review.md`

## Role

You are the coding/ops agent fixing the live runtime alignment issue for `hopfner.dev-main`.

This is a production deploy/runtime hotfix.
Do not treat it as a CMS feature bug.

You must stop for QA after the hotfix is applied and verified.

## Working Directory

- Repo: `/var/www/html/hopfner.dev-main`
- Roadmap folder: `/var/www/html/hopfner.dev-main/agentic-cms-build`

## Required Read Order

1. `/var/www/html/hopfner.dev-main/agentic-cms-build/32-live-runtime-mismatch-review.md`
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/31-phase-06-runtime-deploy-notes.md`
3. `/var/www/html/hopfner.dev-main/scripts/deploy-docker.sh`
4. `/etc/systemd/system/hopf.thapi.cc.service`

Before making changes:

1. run `git status --short`
2. inspect:
   - `/var/www/html/hopfner.dev-main/.next/build-manifest.json`
   - `/var/www/html/hopfner.dev-main/.next/static/chunks/`
   - live HTML chunk references from `https://hopf.thapi.cc/home`
   - `systemctl status hopf.thapi.cc.service`
3. stop and report if the live evidence differs materially from the review note

## Goal

Restore runtime/build alignment on the live site and make the active deploy path truthful.

## Hard Rules

- Do not change CMS data contracts.
- Do not rewrite public section renderers unless a true blocker proves it is necessary.
- Do not widen into agent-worker feature work.
- Do not migrate production traffic to Docker in this same batch unless explicitly approved.
- Keep this fix focused on the active runtime path now serving `hopf.thapi.cc`.

## Files To Change, In Order

1. `/var/www/html/hopfner.dev-main/scripts/`
   - add or update the real live deploy/restart verification script for the current systemd runtime
2. `/var/www/html/hopfner.dev-main/agentic-cms-build/31-phase-06-runtime-deploy-notes.md`
   - make current production runtime truth explicit
3. any small supporting docs or verification scripts under `/var/www/html/hopfner.dev-main/agentic-cms-build/`

Do not widen file touch beyond this unless you hit a real blocker.

## Required Implementation

### 1. Add a real live-runtime verification path

Implement a non-destructive verification script or deploy step that proves:

- the active service is `hopf.thapi.cc.service`
- the service restarts after a good build
- `https://hopf.thapi.cc/home` returns HTML whose referenced `/_next/static/` chunk URLs are reachable
- `https://hopf.thapi.cc/admin/login` also returns reachable chunk URLs

Do not only check that the route HTML returns `200`.
You must check referenced chunk assets.

### 2. Make the deploy truth explicit

Update runtime notes so they clearly distinguish:

- current live host path: systemd `hopf.thapi.cc.service`
- future/alternate local worker Docker path from Phase 6

The docs must stop implying that Docker is already the live traffic-serving runtime on this host.

### 3. Apply the hotfix on the actual live runtime

After verification and a confirmed good build:

- restart `hopf.thapi.cc.service`
- verify the service is healthy
- re-check `https://hopf.thapi.cc/home`
- re-check `https://hopf.thapi.cc/admin/login`
- confirm previously failing chunk URLs are no longer failing

### 4. Add a guard against recurrence

Add a reusable verification step or script so future deploys can fail fast when:

- live HTML references chunk hashes that do not resolve
- the build output and running systemd process are out of alignment

## Required Checks

- targeted lint only if you changed any linted script/doc-adjacent code
- `npm run build`
- service restart verification for `hopf.thapi.cc.service`
- live curl verification for:
  - `https://hopf.thapi.cc/home`
  - `https://hopf.thapi.cc/admin/login`
- verification that referenced chunk URLs from those pages return success, not `500`/`404`

## Required Reporting When You Stop

- exact files changed
- exact commands run
- exact service actions performed
- before/after proof for one failing chunk URL
- whether public page CMS content still renders after the fix
- whether `/admin/login` client assets now load cleanly
- explicit remaining risks

## Hard Stop

- stop here for QA
- do not widen into feature work
