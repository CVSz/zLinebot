#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env}"

api_token="${CLOUDFLARE_API_TOKEN:-${CF_API_TOKEN:-}}"
account_id="${CLOUDFLARE_ACCOUNT_ID:-${CF_ACCOUNT_ID:-}}"
tunnel_id="${CLOUDFLARE_TUNNEL_ID:-${CF_TUNNEL_ID:-}}"

if [[ -z "${api_token}" ]]; then
  echo "ERROR: set CLOUDFLARE_API_TOKEN (or legacy CF_API_TOKEN)" >&2
  exit 1
fi
if [[ -z "${account_id}" ]]; then
  echo "ERROR: set CLOUDFLARE_ACCOUNT_ID (or legacy CF_ACCOUNT_ID)" >&2
  exit 1
fi
if [[ -z "${tunnel_id}" ]]; then
  echo "ERROR: set CLOUDFLARE_TUNNEL_ID (or legacy CF_TUNNEL_ID)" >&2
  exit 1
fi

resp="$(curl -fsS "https://api.cloudflare.com/client/v4/accounts/${account_id}/cfd_tunnel/${tunnel_id}/token" \
  --request GET \
  --header "Authorization: Bearer ${api_token}" \
  --header "Content-Type: application/json")"

token="$(python3 - <<'PY' "$resp"
import json
import sys
payload = json.loads(sys.argv[1])
if not payload.get("success"):
    print(payload, file=sys.stderr)
    raise SystemExit(1)
print(payload.get("result", ""))
PY
)"

if [[ -z "${token}" ]]; then
  echo "ERROR: Cloudflare API returned an empty tunnel token" >&2
  exit 1
fi

if [[ -f "${ENV_FILE}" ]]; then
  if grep -q '^CLOUDFLARE_TUNNEL_TOKEN=' "${ENV_FILE}"; then
    sed -i "s|^CLOUDFLARE_TUNNEL_TOKEN=.*|CLOUDFLARE_TUNNEL_TOKEN=${token}|" "${ENV_FILE}"
  else
    printf '\nCLOUDFLARE_TUNNEL_TOKEN=%s\n' "${token}" >> "${ENV_FILE}"
  fi
  echo "Updated ${ENV_FILE} with CLOUDFLARE_TUNNEL_TOKEN"
else
  echo "CLOUDFLARE_TUNNEL_TOKEN=${token}"
fi
