#!/usr/bin/env bash
set -euo pipefail

APP_NAME="hopfner.dev-admin"
APP_DIR="/var/www/html/hopfner.dev-admin"
LOCK_FILE="/tmp/${APP_NAME}.deploy.lock"

cd "$APP_DIR"

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "[$(date -u +%FT%TZ)] deploy lock busy: another deployment is in progress"
  exit 1
fi

echo "[$(date -u +%FT%TZ)] starting safe deploy for ${APP_NAME}"

pm2 stop "$APP_NAME" >/dev/null || true
rm -rf .next
npm run build
pm2 restart "$APP_NAME" --update-env >/dev/null

sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3011/admin/login || true)
if [[ "$HTTP_CODE" != "200" && "$HTTP_CODE" != "307" ]]; then
  echo "[$(date -u +%FT%TZ)] healthcheck failed: /admin/login returned ${HTTP_CODE}"
  exit 1
fi

echo "[$(date -u +%FT%TZ)] safe deploy complete: /admin/login -> ${HTTP_CODE}"
