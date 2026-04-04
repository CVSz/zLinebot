#!/bin/bash
# ============================================================
# zLinebot Codex Master Full Meta Final Release
# Unified installer & orchestrator for all environments
# ============================================================

set -euo pipefail

MODE="${1:-}"
LOGFILE="codex_release.log"

if [[ -z "$MODE" ]]; then
  echo "Usage: codex.sh {basic|full|ultimate|orchestrator|selfheal|watchdog|release|audit|scan-full|scan-incremental|scan-distributed|hyperscale|bootstrap|monitoring}"
  exit 1
fi

# --- Environment Validation ---
echo "[Codex] Validating environment..." | tee -a "$LOGFILE"
command -v docker >/dev/null 2>&1 || { echo >&2 "Docker not installed. Aborting."; exit 1; }
command -v node >/dev/null 2>&1 || { echo >&2 "Node.js not installed. Aborting."; exit 1; }
command -v kubectl >/dev/null 2>&1 || echo "[Codex] Warning: Kubernetes not found, skipping cluster orchestration." | tee -a "$LOGFILE"

# --- Mode Selection ---
case "$MODE" in
  basic)
    echo "[Codex] Running Basic Installation..." | tee -a "$LOGFILE"
    bash install.sh | tee -a "$LOGFILE"
    ;;
  full)
    echo "[Codex] Running Full-stack Installation..." | tee -a "$LOGFILE"
    bash install_full.sh | tee -a "$LOGFILE"
    ;;
  ultimate)
    echo "[Codex] Running Ultimate Deployment..." | tee -a "$LOGFILE"
    bash install_ultimate.sh | tee -a "$LOGFILE"
    ;;
  orchestrator)
    echo "[Codex] Running Master Orchestrator..." | tee -a "$LOGFILE"
    bash zlinebot-master-orchestrator.sh | tee -a "$LOGFILE"
    ;;
  selfheal)
    echo "[Codex] Running Self-healing Deployment..." | tee -a "$LOGFILE"
    bash zlinebot-master-selfheal.sh | tee -a "$LOGFILE"
    ;;
  watchdog)
    echo "[Codex] Starting Watchdog (background)..." | tee -a "$LOGFILE"
    nohup bash watchdog.sh >> "$LOGFILE" 2>&1 &
    echo "[Codex] Watchdog started in background." | tee -a "$LOGFILE"
    ;;
  release)
    echo "[Codex] Executing Final Release Workflow..." | tee -a "$LOGFILE"
    bash install_ultimate.sh | tee -a "$LOGFILE"
    bash zlinebot-master-orchestrator.sh | tee -a "$LOGFILE"
    echo "[Codex] Release build complete. Artifacts logged in $LOGFILE" | tee -a "$LOGFILE"
    ;;
  audit)
    echo "[Codex] Running Master Meta Deep Impact Dive Audit + Full Project Scan..." | tee -a "$LOGFILE"
    bash scripts/master_meta_deep_impact_dive_audit_scan.sh --full | tee -a "$LOGFILE"
    ;;
  scan-full)
    echo "[Codex] Running Codex Analysis Engine (full scan)..." | tee -a "$LOGFILE"
    python3 -m tools.codex_engine.cli --mode full | tee -a "$LOGFILE"
    ;;
  scan-incremental)
    echo "[Codex] Running Codex Analysis Engine (incremental scan)..." | tee -a "$LOGFILE"
    python3 -m tools.codex_engine.cli --mode incremental | tee -a "$LOGFILE"
    ;;
  scan-distributed)
    echo "[Codex] Running Codex Analysis Engine (distributed mode orchestration target)..." | tee -a "$LOGFILE"
    python3 -m tools.codex_engine.cli --mode distributed | tee -a "$LOGFILE"
    ;;
  hyperscale)
    echo "[Codex] Executing Hyperscale Kubernetes Deployment..." | tee -a "$LOGFILE"
    bash deploy-k8s.sh | tee -a "$LOGFILE"
    ;;
  bootstrap)
    echo "[Codex] Running full server bootstrap (k3s + TLS + deploy)..." | tee -a "$LOGFILE"
    bash bootstrap.sh | tee -a "$LOGFILE"
    ;;
  monitoring)
    echo "[Codex] Installing monitoring stack..." | tee -a "$LOGFILE"
    bash install-monitoring.sh | tee -a "$LOGFILE"
    ;;
  *)
    echo "Usage: codex.sh {basic|full|ultimate|orchestrator|selfheal|watchdog|release|audit|scan-full|scan-incremental|scan-distributed|hyperscale|bootstrap|monitoring}"
    exit 1
    ;;
esac

echo "[Codex] Process finished successfully." | tee -a "$LOGFILE"
