#!/usr/bin/env bash
set -euo pipefail

CONFIG_FILE="${1:-infra/cloudflare_dns.yaml}"
DRY_RUN="${DRY_RUN:-false}"

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "ERROR: required environment variable ${name} is not set" >&2
    exit 1
  fi
}

require_env CF_API_TOKEN
require_env CF_ZONE_ID

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "ERROR: config file not found: $CONFIG_FILE" >&2
  exit 1
fi

readarray -t RECORD_ROWS < <(python3 - "$CONFIG_FILE" <<'PY'
import re
import sys
from pathlib import Path

cfg = Path(sys.argv[1]).read_text().splitlines()
records = []
current = {}
in_records = False

for raw in cfg:
    line = raw.rstrip()
    if not line or line.strip().startswith("#"):
        continue
    if line.strip() == "records:":
        in_records = True
        continue
    if not in_records:
        continue

    m = re.match(r"^\s*-\s+name:\s*(.+)$", line)
    if m:
        if current:
            records.append(current)
            current = {}
        current["name"] = m.group(1).strip().strip('"').strip("'")
        continue

    m = re.match(r"^\s+(type|value):\s*(.+)$", line)
    if m:
        current[m.group(1)] = m.group(2).strip().strip('"').strip("'")
        continue

    m = re.match(r"^\s+proxied:\s*(.+)$", line)
    if m:
        current["proxied"] = m.group(1).strip().lower()
        continue

if current:
    records.append(current)

for rec in records:
    if not {"name", "type", "value"}.issubset(rec):
        continue
    proxied = rec.get("proxied", "false")
    if proxied not in {"true", "false"}:
        proxied = "false"
    print(f"{rec['name']}\t{rec['type']}\t{rec['value']}\t{proxied}")
PY
)

if [[ ${#RECORD_ROWS[@]} -eq 0 ]]; then
  echo "No DNS records found in ${CONFIG_FILE}. Nothing to do."
  exit 0
fi

api_base="https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records"
auth_header="Authorization: Bearer ${CF_API_TOKEN}"
json_header="Content-Type: application/json"

upsert_record() {
  local name="$1"
  local type="$2"
  local value="$3"
  local proxied="$4"

  local existing
  existing="$(curl -sS -G "${api_base}" \
    -H "${auth_header}" \
    --data-urlencode "type=${type}" \
    --data-urlencode "name=${name}")"

  local id
  id="$(python3 - <<'PY' "$existing"
import json
import sys

payload = json.loads(sys.argv[1])
result = payload.get("result", [])
print(result[0]["id"] if result else "")
PY
)"

  local body
  body="$(python3 - <<'PY' "$name" "$type" "$value" "$proxied"
import json
import sys
name, rtype, value, proxied = sys.argv[1:5]
print(json.dumps({
    "type": rtype,
    "name": name,
    "content": value,
    "proxied": proxied == "true"
}))
PY
)"

  if [[ "$DRY_RUN" == "true" ]]; then
    if [[ -n "$id" ]]; then
      echo "[DRY_RUN] update ${type} ${name} -> ${value} (proxied=${proxied})"
    else
      echo "[DRY_RUN] create ${type} ${name} -> ${value} (proxied=${proxied})"
    fi
    return 0
  fi

  local resp
  if [[ -n "$id" ]]; then
    resp="$(curl -sS -X PUT "${api_base}/${id}" -H "${auth_header}" -H "${json_header}" --data "$body")"
    echo "Updated ${type} ${name}"
  else
    resp="$(curl -sS -X POST "${api_base}" -H "${auth_header}" -H "${json_header}" --data "$body")"
    echo "Created ${type} ${name}"
  fi

  python3 - <<'PY' "$resp"
import json
import sys
payload = json.loads(sys.argv[1])
if not payload.get("success"):
    print("Cloudflare API error:", payload, file=sys.stderr)
    sys.exit(1)
PY
}

for row in "${RECORD_ROWS[@]}"; do
  IFS=$'\t' read -r name type value proxied <<<"$row"
  upsert_record "$name" "$type" "$value" "$proxied"
done

echo "Cloudflare DNS automation complete (${CONFIG_FILE})"
