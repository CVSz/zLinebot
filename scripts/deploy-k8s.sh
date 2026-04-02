#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-zlinebot.zeaz.dev}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

check_command() {
  local cmd="$1"
  local msg="$2"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    log "❌ ${msg}"
    exit 1
  fi
}

main() {
  check_command docker "Docker is required for image build/deployment flow."
  check_command kubectl "kubectl is required for Kubernetes deployment."
  check_command terraform "terraform is required for infra apply."

  log "🔐 Generating secure .env for ${DOMAIN}"
  bash scripts/generate-secrets.sh "${DOMAIN}" .env

  log "🚀 Kubernetes secure deployment for ${DOMAIN}"
  terraform -chdir=infra apply -auto-approve
  kubectl apply -f k8s/

  log "✅ K8s deployed with domain ${DOMAIN}"
}

main "$@"
