#!/usr/bin/env bash
# ==============================================================================
# zLinebot MASTER META ORCHESTRATOR – FINAL RELEASE (v2026.04.03)
# Full integration: Secure .env + Kafka KRaft + Cloudflare Named Tunnel + Domain zlinebot.zeaz.dev
# ==============================================================================
set -euo pipefail

MODE="${1:-docker-full}"
DOMAIN="${2:-zlinebot.zeaz.dev}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

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
    log "✅ Secure .env validated"
  fi
}

main() {
  case "${MODE}" in
    docker-full|full-e2e)
      validate_secrets
      setup_cloudflare_tunnel

      log "=== Starting zLinebot Full Stack for ${DOMAIN} ==="
      docker compose down --remove-orphans || true
      docker compose up -d --build

      log "✅ Final release deployed on https://${DOMAIN}"
      log "Monitor: docker compose logs -f app worker cloudflared"
      ;;
    *)
      log "Unsupported mode: ${MODE}. Use docker-full or full-e2e."
      exit 1
      ;;
  esac
}

main "$@"
