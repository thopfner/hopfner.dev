#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="$(basename "$APP_DIR")"
LOCK_FILE="/tmp/${APP_NAME}.deploy.lock"

cd "$APP_DIR"

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "[$(date -u +%FT%TZ)] deploy lock busy: another deployment is in progress"
  exit 1
fi

echo "[$(date -u +%FT%TZ)] starting Docker deploy for ${APP_NAME}"

git pull --ff-only

docker compose build
docker compose up -d

echo "[$(date -u +%FT%TZ)] waiting for container to start..."
sleep 5

ADMIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3010/admin/login || true)

if [[ "$ADMIN_CODE" != "200" && "$ADMIN_CODE" != "307" ]]; then
  echo "[$(date -u +%FT%TZ)] healthcheck failed: /admin/login returned ${ADMIN_CODE}"
  echo "[$(date -u +%FT%TZ)] container logs:"
  docker compose logs --tail=30 app
  exit 1
fi

echo "[$(date -u +%FT%TZ)] Docker deploy complete: /admin/login -> ${ADMIN_CODE}"
