#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_DIR="$ROOT_DIR/reports"
REPORT_FILE="$REPORT_DIR/deep_impact_audit_report.md"
RUN_FULL_SCAN=false

if [[ "${1:-}" == "--full" ]]; then
  RUN_FULL_SCAN=true
fi

mkdir -p "$REPORT_DIR"
cd "$ROOT_DIR"

timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

DOMAINS=(app admin mobile ml db warehouse flink cloudflare k8s infra scripts docs)

count_files() {
  local dir="$1"
  [[ -d "$dir" ]] || { echo 0; return; }
  find "$dir" -type f | wc -l | tr -d ' '
}

count_loc() {
  local dir="$1"
  [[ -d "$dir" ]] || { echo 0; return; }
  find "$dir" -type f \
    -not -path '*/node_modules/*' \
    -not -path '*/dist/*' \
    -not -path '*/build/*' \
    -print0 | xargs -0 cat 2>/dev/null | wc -l | tr -d ' '
}

shellcheck_status="skipped (shellcheck not installed)"
secrets_status="skipped (ripgrep not installed)"
full_scan_status="not requested"
shellcheck_result=""
secrets_result=""
full_scan_result=""

if command -v shellcheck >/dev/null 2>&1; then
  shellcheck_result="$(find . -type f -name '*.sh' \
    -not -path './.git/*' \
    -not -path './admin/node_modules/*' \
    -not -path './app/node_modules/*' \
    -print0 | xargs -0 -r shellcheck 2>&1 || true)"
  if [[ -z "$shellcheck_result" ]]; then
    shellcheck_status="pass"
  else
    shellcheck_status="findings detected"
  fi
fi

if command -v rg >/dev/null 2>&1; then
  secrets_result="$(rg -n --hidden --glob '!.git' --glob '!**/node_modules/**' --glob '!**/*.lock' \
    '(AKIA[0-9A-Z]{16}|BEGIN[ ]+RSA[ ]+PRIVATE[ ]+KEY|xox[baprs]-|ghp_[A-Za-z0-9]{36}|AIza[0-9A-Za-z\-_]{35})' . || true)"
  if [[ -z "$secrets_result" ]]; then
    secrets_status="no high-signal secret patterns found"
  else
    secrets_status="potential secrets detected (manual verification required)"
  fi
fi

if [[ "$RUN_FULL_SCAN" == true ]]; then
  if [[ -x "scripts/lint_all.sh" ]]; then
    full_scan_result="$(bash scripts/lint_all.sh 2>&1 || true)"
    if [[ "$full_scan_result" == *"All lint checks completed."* ]]; then
      full_scan_status="pass"
    else
      full_scan_status="completed with findings/errors"
    fi
  else
    full_scan_status="skipped (scripts/lint_all.sh not executable)"
  fi
fi

{
  echo "# zLinebot Master Meta Deep Impact Dive Audit Scan"
  echo
  echo "- Generated (UTC): $timestamp"
  echo "- Repository root: $ROOT_DIR"
  echo "- Full project scan: $RUN_FULL_SCAN"
  echo
  echo "## Domain Footprint"
  echo
  echo "| Domain | Files | Estimated LOC |"
  echo "|---|---:|---:|"
  for domain in "${DOMAINS[@]}"; do
    echo "| ${domain}/ | $(count_files "$domain") | $(count_loc "$domain") |"
  done

  echo
  echo "## Quality & Security Checks"
  echo
  echo "### Shellcheck"
  echo "- Status: $shellcheck_status"
  if [[ -n "$shellcheck_result" ]]; then
    echo
    echo '```text'
    echo "$shellcheck_result"
    echo '```'
  fi

  echo
  echo "### Secrets pattern scan"
  echo "- Status: $secrets_status"
  if [[ -n "$secrets_result" ]]; then
    echo
    echo '```text'
    echo "$secrets_result"
    echo '```'
  fi

  echo
  echo "### Full project scan (scripts/lint_all.sh)"
  echo "- Status: $full_scan_status"
  if [[ -n "$full_scan_result" ]]; then
    echo
    echo '```text'
    echo "$full_scan_result"
    echo '```'
  fi

  echo
  echo "## Existing Deep Impact Documentation"
  if [[ -f "docs/FEATURE_DEEP_IMPACT_DIVE_2026-04.md" ]]; then
    echo "- Found: docs/FEATURE_DEEP_IMPACT_DIVE_2026-04.md"
  else
    echo "- Missing: docs/FEATURE_DEEP_IMPACT_DIVE_2026-04.md"
  fi
} > "$REPORT_FILE"

echo "[Audit] Report generated: $REPORT_FILE"
