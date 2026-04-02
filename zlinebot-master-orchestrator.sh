#!/usr/bin/env bash
# ==============================================================================
# zLinebot MASTER META ORCHESTRATOR – FINAL RELEASE (v2026.04.03)
# Full integration: deploy.sh + secure .env + Cloudflare Named Tunnel + domain
# ==============================================================================
set -euo pipefail

MODE="${1:-docker-full}"
DOMAIN="${2:-zlinebot.zeaz.dev}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

check_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    log "❌ Docker not found in PATH. Install Docker Engine + Compose plugin, then retry."
    exit 1
  fi

  if ! docker compose version >/dev/null 2>&1; then
    log "❌ Docker Compose v2 plugin not found. Install docker-compose-plugin, then retry."
    exit 1
  fi

  log "✅ Docker + Compose ready"
}

setup_cloudflare_tunnel() {
  log "🚀 Setting up Cloudflare Named Tunnel for ${DOMAIN}"
  mkdir -p cloudflared
  cat > cloudflared/config.yml <<EOT
 tunnel: zlinebot-${DOMAIN}
 credentials-file: /root/.cloudflared/zlinebot-${DOMAIN}.json
 ingress:
   - hostname: ${DOMAIN}
     service: http://app:3000
   - hostname: admin.${DOMAIN}
     service: http://admin:5173
   - service: http_status:404
EOT
  sed -i 's/^ //' cloudflared/config.yml
  log "✅ Tunnel config generated"
}

validate_secrets() {
  if [[ -f .env ]]; then
    # shellcheck disable=SC1091
    source .env
    [[ -n "${LINE_CHANNEL_SECRET:-}" && ${#LINE_CHANNEL_SECRET} -ge 32 ]] || { log "❌ Weak LINE secret"; exit 1; }
    [[ -n "${JWT_SECRET:-}" && ${#JWT_SECRET} -ge 64 ]] || { log "❌ Weak JWT secret"; exit 1; }
    [[ -n "${TIKTOK_WEBHOOK_SECRET:-}" && ${#TIKTOK_WEBHOOK_SECRET} -ge 32 ]] || { log "❌ Weak TikTok webhook secret"; exit 1; }
    log "✅ Secure .env validated"
  fi
}

main() {
  case "${MODE}" in
    docker-full|full-e2e)
      check_docker

      log "=== Running upgraded deploy pipeline for ${DOMAIN} ==="
      bash scripts/deploy.sh "${DOMAIN}"

      setup_cloudflare_tunnel
      validate_secrets

      log "✅ Final release deployed on https://${DOMAIN}"
      log "Monitor: docker compose logs -f app worker cloudflared"
      ;;
    k8s)
      bash scripts/deploy-k8s.sh "${DOMAIN}"
      ;;
    *)
      log "Unsupported mode: ${MODE}. Use docker-full, full-e2e, or k8s."
      exit 1
      ;;
  esac
}

main "$@"
