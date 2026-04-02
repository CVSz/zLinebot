#!/usr/bin/env bash
# ==============================================================================
# zLinebot DEPLOY.SH – FINAL UPGRADED VERSION (03 April 2026)
# Full SaaS deployment for zlinebot.zeaz.dev with Docker guard,
# secure secret generation, and post-deploy checks.
# ==============================================================================
set -euo pipefail

DOMAIN="${1:-zlinebot.zeaz.dev}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

check_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    log "❌ Docker not found. Installing Docker Engine + Compose plugin..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
      | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker "$USER"
    sudo systemctl enable --now docker
    log "✅ Docker installed. Run 'newgrp docker' (or relogin) and rerun deployment."
    exit 0
  fi

  if ! docker compose version >/dev/null 2>&1; then
    log "❌ Docker Compose plugin missing. Install docker-compose-plugin and retry."
    exit 1
  fi

  log "✅ Docker + Compose ready"
}

main() {
  check_docker

  log "🔐 Generating secure .env for ${DOMAIN}"
  bash scripts/generate-secrets.sh "${DOMAIN}" .env

  log "🚀 Starting full deployment for ${DOMAIN}"
  docker compose down --remove-orphans || true
  docker compose up -d --build

  log "🔍 Running post-deploy checks..."
  sleep 5
  docker compose ps
  docker compose logs app --tail=50 | grep -E "ML|queue|webhook" || true

  log "✅ DEPLOYMENT COMPLETE"
  log "Main: https://${DOMAIN}"
  log "Admin: https://admin.${DOMAIN}"
  log "Monitor: docker compose logs -f app cloudflared"
  log "Next: Run ./zlinebot-master-orchestrator.sh if needed"
}

main "$@"
