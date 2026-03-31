#!/usr/bin/env bash
# ==============================================================================
# zLinebot Full Install Script (Ubuntu 24.04)
# Version: 2026.04.01 (Fixed)
# ==============================================================================
set -euo pipefail

echo "=== zLinebot Full Install (Ubuntu 24.04) ==="

# System dependencies
sudo apt-get update -qq
sudo apt-get install -y docker.io docker-compose-v2 git curl

sudo systemctl enable --now docker

# Cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb \
  -o /tmp/cloudflared.deb
sudo dpkg -i /tmp/cloudflared.deb

# Clone repository (if not present)
if [[ ! -d zLinebot ]]; then
  git clone https://github.com/CVSz/zLinebot.git
fi
cd zLinebot

# Environment file
if [[ -f .env.example && ! -f .env ]]; then
  cp .env.example .env
  echo "[INFO] .env created from template – please edit before running docker compose"
fi

# Optional: Pull Ollama model (non-blocking)
docker run -d --name ollama -p 11434:11434 ollama/ollama || true
docker exec ollama ollama pull mistral || true

# Start full stack
docker compose up -d --build

echo "============================================================================"
echo "SUCCESS: zLinebot is now running."
echo "Next steps:"
echo "   1. Edit .env with your keys and tenant settings"
echo "   2. cloudflared tunnel login"
echo "   3. cloudflared tunnel create zlinebot"
echo "   4. cloudflared tunnel run zlinebot"
echo "============================================================================"
