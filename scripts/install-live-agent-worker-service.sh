#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICE_NAME="${SERVICE_NAME:-hopfner-agent-worker.service}"
SERVICE_USER="${SERVICE_USER:-www-data}"
SERVICE_GROUP="${SERVICE_GROUP:-www-data}"
RUN_SCRIPT="${RUN_SCRIPT:-$APP_DIR/scripts/run-agent-worker-service.sh}"
UNIT_PATH="/etc/systemd/system/$SERVICE_NAME"

cd "$APP_DIR"

echo "Building worker artifact..."
npm run build:worker

echo "Checking worker runtime as ${SERVICE_USER}..."
sudo -u "$SERVICE_USER" bash "$RUN_SCRIPT" --check

temp_unit="$(mktemp)"
trap 'rm -f "$temp_unit"' EXIT

echo "Rendering systemd unit to $UNIT_PATH..."
APP_DIR="$APP_DIR" \
SERVICE_NAME="$SERVICE_NAME" \
SERVICE_USER="$SERVICE_USER" \
SERVICE_GROUP="$SERVICE_GROUP" \
RUN_SCRIPT="$RUN_SCRIPT" \
node "$APP_DIR/scripts/render-agent-worker-systemd-unit.cjs" > "$temp_unit"

sudo install -o root -g root -m 0644 "$temp_unit" "$UNIT_PATH"
sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME"
sudo systemctl is-active --quiet "$SERVICE_NAME"

echo "Verifying installed worker service..."
sudo bash "$APP_DIR/scripts/verify-live-agent-worker-service.sh"

echo "Worker service install complete: $SERVICE_NAME"
