#!/usr/bin/env bash
set -euo pipefail

# Full Cloudflare Zero Trust bootstrap for zLinebot on zeaz.dev:
# - Configure tunnel ingress hostnames (zlinebot.zeaz.dev + *.zeaz.dev)
# - Upsert proxied DNS CNAME records to <tunnel-id>.cfargotunnel.com

DRY_RUN="${DRY_RUN:-false}"

api_token="${CLOUDFLARE_API_TOKEN:-${CF_API_TOKEN:-}}"
account_id="${CLOUDFLARE_ACCOUNT_ID:-${CF_ACCOUNT_ID:-}}"
zone_id="${CLOUDFLARE_ZONE_ID:-${CF_ZONE_ID:-}}"
tunnel_id="${CLOUDFLARE_TUNNEL_ID:-${CF_TUNNEL_ID:-}}"

base_domain="${CLOUDFLARE_BASE_DOMAIN:-zeaz.dev}"
primary_hostname="${CLOUDFLARE_PRIMARY_HOSTNAME:-zlinebot.${base_domain}}"
wildcard_hostname="${CLOUDFLARE_WILDCARD_HOSTNAME:-*.${base_domain}}"
service_url="${CLOUDFLARE_TUNNEL_SERVICE_URL:-http://app:3000}"

require_value() {
  local var_name="$1"
  local var_value="$2"
  if [[ -z "${var_value}" ]]; then
    echo "ERROR: missing ${var_name}" >&2
    exit 1
  fi
}

require_value "CLOUDFLARE_API_TOKEN (or CF_API_TOKEN)" "${api_token}"
require_value "CLOUDFLARE_ACCOUNT_ID (or CF_ACCOUNT_ID)" "${account_id}"
require_value "CLOUDFLARE_ZONE_ID (or CF_ZONE_ID)" "${zone_id}"
require_value "CLOUDFLARE_TUNNEL_ID (or CF_TUNNEL_ID)" "${tunnel_id}"

api_base="https://api.cloudflare.com/client/v4"
auth_header="Authorization: Bearer ${api_token}"
json_header="Content-Type: application/json"

tunnel_cname="${tunnel_id}.cfargotunnel.com"

cf_call() {
  local method="$1"
  local url="$2"
  local body="${3:-}"

  if [[ "${DRY_RUN}" == "true" ]]; then
    echo "[DRY_RUN] ${method} ${url}"
    if [[ -n "${body}" ]]; then
      echo "[DRY_RUN] body: ${body}"
    fi
    return 0
  fi

  local resp
  if [[ -n "${body}" ]]; then
    resp="$(curl -fsS -X "${method}" "${url}" -H "${auth_header}" -H "${json_header}" --data "${body}")"
  else
    resp="$(curl -fsS -X "${method}" "${url}" -H "${auth_header}" -H "${json_header}")"
  fi

  python3 - <<'PY' "$resp"
import json
import sys
payload = json.loads(sys.argv[1])
if not payload.get("success"):
    print("Cloudflare API error:", json.dumps(payload, indent=2), file=sys.stderr)
    raise SystemExit(1)
print(json.dumps(payload.get("result", {})))
PY
}

configure_tunnel_ingress() {
  local payload
  payload="$(python3 - <<'PY' "${primary_hostname}" "${wildcard_hostname}" "${service_url}"
import json
import sys
primary, wildcard, service = sys.argv[1:4]
print(json.dumps({
    "config": {
        "ingress": [
            {"hostname": primary, "service": service, "originRequest": {}},
            {"hostname": wildcard, "service": service, "originRequest": {}},
            {"service": "http_status:404"}
        ]
    }
}))
PY
)"

  echo "Configuring tunnel ingress for ${primary_hostname} and ${wildcard_hostname}"
  cf_call "PUT" "${api_base}/accounts/${account_id}/cfd_tunnel/${tunnel_id}/configurations" "${payload}" >/dev/null
}

find_dns_record_id() {
  local name="$1"
  local query_url="${api_base}/zones/${zone_id}/dns_records?type=CNAME&name=${name}"

  if [[ "${DRY_RUN}" == "true" ]]; then
    echo ""
    return 0
  fi

  local resp
  resp="$(curl -fsS -G "${api_base}/zones/${zone_id}/dns_records" -H "${auth_header}" \
    --data-urlencode "type=CNAME" --data-urlencode "name=${name}")"

  python3 - <<'PY' "$resp"
import json
import sys
payload = json.loads(sys.argv[1])
if not payload.get("success"):
    print("Cloudflare API error:", json.dumps(payload, indent=2), file=sys.stderr)
    raise SystemExit(1)
records = payload.get("result", [])
print(records[0]["id"] if records else "")
PY
}

upsert_dns_cname() {
  local name="$1"
  local payload
  payload="$(python3 - <<'PY' "$name" "${tunnel_cname}"
import json
import sys
name, content = sys.argv[1:3]
print(json.dumps({
    "type": "CNAME",
    "name": name,
    "content": content,
    "proxied": True
}))
PY
)"

  local id
  id="$(find_dns_record_id "${name}")"

  if [[ -n "${id}" ]]; then
    echo "Updating DNS CNAME ${name} -> ${tunnel_cname}"
    cf_call "PUT" "${api_base}/zones/${zone_id}/dns_records/${id}" "${payload}" >/dev/null
  else
    echo "Creating DNS CNAME ${name} -> ${tunnel_cname}"
    cf_call "POST" "${api_base}/zones/${zone_id}/dns_records" "${payload}" >/dev/null
  fi
}

configure_tunnel_ingress
upsert_dns_cname "${primary_hostname}"
upsert_dns_cname "${wildcard_hostname}"

echo "Cloudflare Zero Trust full configuration complete"
