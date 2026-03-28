#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="${SERVICE_NAME:-hopf.thapi.cc.service}"
BASE_URL="${BASE_URL:-https://hopf.thapi.cc}"
PAGES=("/home" "/admin/login")

if ! systemctl is-active --quiet "$SERVICE_NAME"; then
  echo "ERROR: systemd service is not active: $SERVICE_NAME"
  exit 1
fi

echo "Verifying active runtime: $SERVICE_NAME"

for page in "${PAGES[@]}"; do
  html_file="$(mktemp)"
  curl -fsSL "${BASE_URL}${page}" -o "$html_file"

  mapfile -t asset_paths < <(grep -oE '/_next/static/[^" ]+' "$html_file" | sed 's/\\$//' | sort -u)

  if [ ${#asset_paths[@]} -eq 0 ]; then
    echo "ERROR: no Next.js assets found in ${BASE_URL}${page}"
    rm -f "$html_file"
    exit 1
  fi

  echo "Verified HTML for ${BASE_URL}${page}; checking ${#asset_paths[@]} referenced assets"

  for asset_path in "${asset_paths[@]}"; do
    status_code="$(curl -sS -o /dev/null -w '%{http_code}' "${BASE_URL}${asset_path}")"
    case "$status_code" in
      200|204|301|302|304|307|308) ;;
      *)
        echo "ERROR: asset check failed for ${BASE_URL}${asset_path} -> ${status_code}"
        rm -f "$html_file"
        exit 1
        ;;
    esac
  done

  rm -f "$html_file"
done

echo "Live runtime verification passed for ${SERVICE_NAME}"
