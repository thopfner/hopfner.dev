# Phase 6 Runtime And Deploy Notes

## Deployment Model

Current live host runtime on `hopf.thapi.cc`:
- production traffic is currently served by systemd service `hopf.thapi.cc.service`
- that unit runs `next start` from `/var/www/html/hopfner.dev-main` on port `3010`
- live runtime verification for that path now lives in `scripts/verify-live-systemd-runtime.sh`
- live rebuild + restart helper for that path now lives in `scripts/restart-live-systemd-runtime.sh`
- Phase 7 worker runtime is now intended to run through systemd service `hopfner-agent-worker.service`
- worker service install path lives in `scripts/install-live-agent-worker-service.sh`
- worker service verification lives in `scripts/verify-live-agent-worker-service.sh`

Alternate/local Docker path from Phase 6:
- the app and worker can run from the same Docker image
- both Docker services read the same `.env.local` file through `docker-compose.yml`
- the worker remains local-only and internal to the deployment. There is no public worker ingress in v1.

## Required Runtime Env

Required for app plus worker:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`

Worker tuning:
- `AGENT_WORKER_POLL_INTERVAL_MS`
- `AGENT_WORKER_STALE_AFTER_MS`
- `AGENT_WORKER_ID` is optional

Optional provider support:
- `GEMINI_API_KEY`
- `GEMINI_IMAGE_MODEL`

If `GEMINI_API_KEY` is missing, deploys can still succeed, but generated background images remain unavailable and the admin workspace will report that state.

## Deploy Verification

Systemd live-runtime path now performs these checks:
- `hopf.thapi.cc.service` must be active
- `https://hopf.thapi.cc/home` must return HTML with reachable `/_next/static/` assets
- `https://hopf.thapi.cc/admin/login` must return HTML with reachable `/_next/static/` assets
- future restarts should use `scripts/restart-live-systemd-runtime.sh` so build + restart + asset verification stay coupled

Docker path performs these checks:
- `.env.local` must exist
- required shared runtime envs must be present before build
- `docker compose config` must render successfully
- `/admin/login` must answer after `docker compose up -d`
- the worker container must be running
- `docker compose exec -T worker node .worker-dist/scripts/agent-worker.js --check` must pass

The worker `--check` path is non-destructive. It validates worker config, Supabase runtime env presence, and generated-image provider status without claiming jobs.

## V1 Non-Goals

Still out of scope:
- auto-publish
- custom section schema creation
- public worker ingress
- replacing the human publish workflow
