#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICE_NAME="${SERVICE_NAME:-hopf.thapi.cc.service}"

cd "$APP_DIR"

echo "Building Next.js app for live systemd runtime..."
npm run build

echo "Restarting ${SERVICE_NAME}..."
sudo systemctl restart "$SERVICE_NAME"
sudo systemctl is-active --quiet "$SERVICE_NAME"

echo "Running live chunk verification..."
for attempt in 1 2 3 4 5; do
  if sudo bash "$APP_DIR/scripts/verify-live-systemd-runtime.sh"; then
    echo "Live runtime verification succeeded on attempt ${attempt}."
    break
  fi

  if [ "$attempt" -eq 5 ]; then
    echo "Live runtime verification failed after ${attempt} attempts."
    exit 1
  fi

  echo "Live runtime verification retry ${attempt}/5 after restart warmup..."
  sleep 2
done

echo "Live runtime restart and verification complete for ${SERVICE_NAME}"
