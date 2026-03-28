#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env.local}"
WORKER_ENTRY="${WORKER_ENTRY:-$APP_DIR/.worker-dist/scripts/agent-worker.js}"
ALIAS_REGISTER="${ALIAS_REGISTER:-$APP_DIR/scripts/register-worker-aliases.cjs}"

if [ ! -r "$ENV_FILE" ]; then
  echo "ERROR: missing readable worker env file: $ENV_FILE" >&2
  exit 1
fi

if [ ! -f "$WORKER_ENTRY" ]; then
  echo "ERROR: missing worker build artifact: $WORKER_ENTRY" >&2
  exit 1
fi

if [ ! -f "$ALIAS_REGISTER" ]; then
  echo "ERROR: missing worker alias loader: $ALIAS_REGISTER" >&2
  exit 1
fi

cd "$APP_DIR"
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a
export NODE_ENV="${NODE_ENV:-production}"

exec node -r "$ALIAS_REGISTER" "$WORKER_ENTRY" "$@"
