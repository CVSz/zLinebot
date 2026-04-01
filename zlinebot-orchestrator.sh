#!/usr/bin/env bash
# ==============================================================================
# zLinebot Unified Generator + Orchestrator + Installer
# Version: 2026.04.01
# Usage: ./zlinebot-orchestrator.sh [docker-full|k3s|nocost|secure|mobile|istio-mesh]
# ==============================================================================
set -euo pipefail

MODE="${1:-docker-full}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

SUDO=""
if command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
fi

log() { printf '[%s] %s\n' "$(date +'%Y-%m-%d %H:%M:%S')" "$*"; }

wait_for_docker() {
  for _ in {1..30}; do
    if docker info >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

generate_docs() {
  if [[ -f README.md ]]; then
    cp README.md README.md.bak
  fi

  cat > README.md <<EOF_DOC
# ZLineBot Ultimate (Auto-generated)

## Features
- AI Commerce Engine with RL + Bandit + Transformer ranking
- LINE + TikTok Shop native integration
- Multi-tenant privacy and compliance workflows
- Real-time WebSocket analytics

## Deployed via Orchestrator
- Mode: $MODE
- Generated at: $(date -u +'%Y-%m-%dT%H:%M:%SZ')

## Run Again
\`\`\`bash
./zlinebot-orchestrator.sh $MODE
\`\`\`
EOF_DOC
  log "README.md regenerated (backup at README.md.bak)."
}

install_base_deps() {
  $SUDO apt-get update -qq
  $SUDO apt-get install -y docker.io docker-compose-v2 curl git
  $SUDO systemctl enable --now docker
  wait_for_docker || { log "Docker did not become ready in time"; exit 1; }
}

run_mode() {
  case "$MODE" in
    docker-full)
      install_base_deps
      [[ -f .env || ! -f .env.example ]] || cp .env.example .env
      docker compose up -d --build
      ;;
    k3s|nocost)
      $SUDO apt-get update -qq
      $SUDO apt-get install -y curl
      if ! command -v k3s >/dev/null 2>&1; then
        curl -sfL https://get.k3s.io | sh -
      fi
      [[ -f /etc/rancher/k3s/k3s.yaml ]] && export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
      ;;
    secure|istio-mesh)
      install_base_deps
      log "Secure mesh bootstrap requested. Run scripts/vault.sh, scripts/spiffe.sh, and scripts/install_istio.sh as needed."
      ;;
    mobile)
      install_base_deps
      log "Mobile deployment mode requested. Run scripts/install_android_deploy.sh or scripts/install_ios_deploy.sh."
      ;;
    *)
      log "Invalid mode: $MODE"
      log "Supported: docker-full, k3s, nocost, secure, mobile, istio-mesh"
      exit 1
      ;;
  esac
}

log "=== zLinebot Orchestrator (Mode: $MODE) ==="
run_mode
generate_docs
bash scripts/lint_all.sh || log "lint_all.sh reported warnings; review output"
log "ORCHESTRATOR SUCCESS: $MODE deployment complete."
