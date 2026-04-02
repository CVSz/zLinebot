#!/bin/bash
# ============================================================
# zLinebot Codex Master Full Meta Final Release
# Unified installer & orchestrator for all environments
# ============================================================

set -euo pipefail

MODE="${1:-}"
LOGFILE="${CODEX_LOGFILE:-codex_release.log}"

log() {
  echo "$1" | tee -a "$LOGFILE"
}

run_step() {
  local script="$1"

  if [[ ! -f "$script" ]]; then
    log "[Codex] ERROR: Required script not found: $script"
    exit 1
  fi

  log "[Codex] Executing: $script"
  bash "$script" | tee -a "$LOGFILE"
}

show_usage() {
  cat <<USAGE
Usage: codex.sh {basic|full|ultimate|orchestrator|release}

Modes:
  basic         Runs install.sh
  full          Runs install_full.sh
  ultimate      Runs install_ultimate.sh
  orchestrator  Runs zlinebot-master-orchestrator.sh
  release       Runs install_ultimate.sh + zlinebot-master-orchestrator.sh
USAGE
}

log "[Codex] Validating environment..."
command -v docker >/dev/null 2>&1 || { echo >&2 "Docker not installed. Aborting."; exit 1; }
command -v node >/dev/null 2>&1 || { echo >&2 "Node.js not installed. Aborting."; exit 1; }
command -v kubectl >/dev/null 2>&1 || log "[Codex] Warning: Kubernetes not found, skipping cluster orchestration."

case "$MODE" in
basic)
  log "[Codex] Running Basic Installation..."
  run_step install.sh
  ;;
full)
  log "[Codex] Running Full-stack Installation..."
  run_step install_full.sh
  ;;
ultimate)
  log "[Codex] Running Ultimate Deployment..."
  run_step install_ultimate.sh
  ;;
orchestrator)
  log "[Codex] Running Master Orchestrator..."
  run_step zlinebot-master-orchestrator.sh
  ;;
release)
  log "[Codex] Executing Final Release Workflow..."
  run_step install_ultimate.sh
  run_step zlinebot-master-orchestrator.sh
  log "[Codex] Release build complete. Artifacts logged in $LOGFILE"
  ;;
""|-h|--help|help)
  show_usage
  exit 0
  ;;
*)
  show_usage
  exit 1
  ;;
esac

log "[Codex] Process finished successfully."
