#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="hopf.thapi.cc"
LOCK_FILE="/tmp/${APP_NAME}.deploy.lock"

cd "$APP_DIR"

# Source port from .env.local, default to 3010
PORT="${PORT:-3010}"
if [ -f .env.local ]; then
  _port=$(grep -E '^PORT=' .env.local | tail -1 | cut -d= -f2 | tr -d '"' | tr -d "'" || true)
  [ -n "$_port" ] && PORT="$_port"
fi

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "[$(date -u +%FT%TZ)] deploy lock busy: another deployment is in progress"
  exit 1
fi

echo "[$(date -u +%FT%TZ)] starting safe deploy for ${APP_NAME}"

# Preflight: ensure node_modules matches the current lockfile.
# Prevents "module not found" failures after git pull changes dependencies.
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  echo "[$(date -u +%FT%TZ)] node_modules stale or missing — running npm ci"
  npm ci
fi

rm -rf .next
npm run build
systemctl restart "${APP_NAME}.service"

sleep 2
PUBLIC_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}/" || true)
ADMIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}/admin/login" || true)

if [[ "$PUBLIC_CODE" != "200" && "$PUBLIC_CODE" != "307" ]]; then
  echo "[$(date -u +%FT%TZ)] healthcheck failed: / returned ${PUBLIC_CODE}"
  exit 1
fi

if [[ "$ADMIN_CODE" != "200" && "$ADMIN_CODE" != "307" ]]; then
  echo "[$(date -u +%FT%TZ)] healthcheck failed: /admin/login returned ${ADMIN_CODE}"
  exit 1
fi

echo "[$(date -u +%FT%TZ)] safe deploy complete: / -> ${PUBLIC_CODE}, /admin/login -> ${ADMIN_CODE}"
