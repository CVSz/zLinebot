#!/usr/bin/env bash
# ==============================================================================
# zLinebot Full Install Script (Ubuntu 24.04+ / Debian)
# Version: 2026.04.01 (Hardened)
# ==============================================================================
set -euo pipefail

log() { printf '[%s] %s\n' "$(date +'%Y-%m-%d %H:%M:%S')" "$*"; }

log "=== zLinebot Full Install (Hardened) ==="

SUDO=""
if command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
fi

$SUDO apt-get update -qq
$SUDO apt-get install -y docker.io docker-compose-v2 git curl jq
$SUDO systemctl enable --now docker

ARCH="$(dpkg --print-architecture)"
case "$ARCH" in
  amd64) DEB_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb" ;;
  arm64) DEB_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb" ;;
  *)
    log "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

TMP_DEB="$(mktemp /tmp/cloudflared.XXXXXX.deb)"
trap 'rm -f "$TMP_DEB"' EXIT
curl -fsSL "$DEB_URL" -o "$TMP_DEB"
$SUDO dpkg -i "$TMP_DEB" || $SUDO apt-get install -f -y

if [[ ! -d zLinebot ]]; then
  git clone https://github.com/CVSz/zLinebot.git
fi

cd zLinebot || { log "Failed to enter repository directory"; exit 1; }

if [[ -f .env.example && ! -f .env ]]; then
  cp .env.example .env
  log ".env created from template – edit before starting services"
else
  log ".env already exists – skipping template copy"
fi

if ! docker ps --format '{{.Names}}' | grep -qx ollama; then
  docker run -d --name ollama -p 11434:11434 --restart unless-stopped ollama/ollama >/dev/null
fi

for _ in {1..30}; do
  if docker exec ollama ollama list >/dev/null 2>&1; then
    docker exec ollama ollama pull mistral >/dev/null 2>&1 || true
    break
  fi
  sleep 2
done

docker compose up -d --build

log "============================================================================"
log "SUCCESS: zLinebot is now running."
log "Next steps:"
log "  1. Edit .env with your keys and tenant settings"
log "  2. cloudflared tunnel login"
log "  3. cloudflared tunnel create zlinebot"
log "  4. cloudflared tunnel run zlinebot"
log "============================================================================"
