#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="$(basename "$APP_DIR")"
LOCK_FILE="/tmp/${APP_NAME}.deploy.lock"
BUILD_LOG="/tmp/${APP_NAME}.docker-build.log"

cd "$APP_DIR"

# Source port from .env.local, default to 3010
PORT="${PORT:-3010}"
if [ -f .env.local ]; then
  _port=$(grep -E '^PORT=' .env.local | tail -1 | cut -d= -f2 | tr -d '"' | tr -d "'")
  [ -n "$_port" ] && PORT="$_port"
fi

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "[$(date -u +%FT%TZ)] deploy lock busy: another deployment is in progress"
  exit 1
fi

echo "[$(date -u +%FT%TZ)] starting Docker deploy for ${APP_NAME}"

git pull --ff-only

# Preflight: ensure .env.local exists (required for NEXT_PUBLIC_* inlining)
if [ ! -f .env.local ]; then
  echo "[$(date -u +%FT%TZ)] ERROR: .env.local not found — Docker build requires it for NEXT_PUBLIC_* vars"
  exit 1
fi

# Build with plain progress for readable CI logs; capture output for OOM detection.
echo "[$(date -u +%FT%TZ)] building Docker image (log: ${BUILD_LOG})..."
set +e
docker compose build --progress=plain 2>&1 | tee "$BUILD_LOG"
BUILD_EXIT=${PIPESTATUS[0]}
set -e

if [ $BUILD_EXIT -ne 0 ]; then
  echo ""
  if grep -qiE 'Killed|SIGKILL|signal: killed|exit code: 137|out of memory' "$BUILD_LOG"; then
    echo "================================================================"
    echo "[$(date -u +%FT%TZ)] BUILD KILLED — likely out of memory"
    echo "The Next.js build worker was killed by the kernel OOM killer."
    echo "This is an environment/resource issue, NOT a source-code error."
    echo ""
    echo "Fixes:"
    echo "  colima : colima stop && colima start --memory 6"
    echo "  Desktop: Settings > Resources > increase Memory"
    echo "  Or:      docker compose build --build-arg NODE_HEAP_MB=768"
    echo "================================================================"
  else
    echo "[$(date -u +%FT%TZ)] BUILD FAILED (exit $BUILD_EXIT) — review errors above"
  fi
  exit $BUILD_EXIT
fi

echo "[$(date -u +%FT%TZ)] starting container..."
docker compose up -d

echo "[$(date -u +%FT%TZ)] waiting for container to start..."
sleep 5

ADMIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}/admin/login" || true)

if [[ "$ADMIN_CODE" != "200" && "$ADMIN_CODE" != "307" ]]; then
  echo "[$(date -u +%FT%TZ)] healthcheck failed: /admin/login returned ${ADMIN_CODE}"
  echo "[$(date -u +%FT%TZ)] container logs:"
  docker compose logs --tail=30 app
  exit 1
fi

echo "[$(date -u +%FT%TZ)] Docker deploy complete: /admin/login -> ${ADMIN_CODE}"
