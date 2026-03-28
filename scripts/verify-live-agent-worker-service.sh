#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICE_NAME="${SERVICE_NAME:-hopfner-agent-worker.service}"
LIVENESS_FILE="${LIVENESS_FILE:-/var/tmp/hopfner-agent-worker-status.json}"
MAX_HEARTBEAT_AGE_MS="${MAX_HEARTBEAT_AGE_MS:-90000}"
RUN_SCRIPT="${RUN_SCRIPT:-$APP_DIR/scripts/run-agent-worker-service.sh}"
SERVICE_USER="${SERVICE_USER:-www-data}"

export LIVENESS_FILE
export MAX_HEARTBEAT_AGE_MS

if ! systemctl is-enabled --quiet "$SERVICE_NAME"; then
  echo "ERROR: systemd worker service is not enabled: $SERVICE_NAME" >&2
  exit 1
fi

if ! systemctl is-active --quiet "$SERVICE_NAME"; then
  echo "ERROR: systemd worker service is not active: $SERVICE_NAME" >&2
  exit 1
fi

sudo -u "$SERVICE_USER" bash "$RUN_SCRIPT" --check >/dev/null

node <<'NODE'
const fs = require("node:fs")

const filePath = process.env.LIVENESS_FILE
const maxHeartbeatAgeMs = Number(process.env.MAX_HEARTBEAT_AGE_MS || "90000")

if (!fs.existsSync(filePath)) {
  console.error(`ERROR: worker liveness file not found: ${filePath}`)
  process.exit(1)
}

const payload = JSON.parse(fs.readFileSync(filePath, "utf8"))
if (typeof payload.heartbeatAt !== "string") {
  console.error("ERROR: worker liveness file is missing heartbeatAt")
  process.exit(1)
}

const heartbeatMs = Date.parse(payload.heartbeatAt)
if (!Number.isFinite(heartbeatMs)) {
  console.error(`ERROR: worker heartbeatAt is invalid: ${payload.heartbeatAt}`)
  process.exit(1)
}

const ageMs = Date.now() - heartbeatMs
if (ageMs > maxHeartbeatAgeMs) {
  console.error(
    `ERROR: worker heartbeat is stale: age=${ageMs}ms threshold=${maxHeartbeatAgeMs}ms`
  )
  process.exit(1)
}

console.log(
  `Verified worker heartbeat: workerId=${payload.workerId || "unknown"} heartbeatAt=${payload.heartbeatAt} ageMs=${ageMs}`
)
NODE

echo "Verified worker service: $SERVICE_NAME"
