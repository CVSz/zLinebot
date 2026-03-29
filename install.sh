#!/usr/bin/env bash
set -euo pipefail

echo "🚀 ZLINEBOT FULL INSTALL (Ubuntu 24.04)"

# --- system deps ---
sudo apt update
sudo apt install -y docker.io docker-compose git curl

sudo systemctl enable docker
sudo systemctl start docker

# --- cloudflared ---
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cf.deb
sudo dpkg -i cf.deb

# --- clone ---
if [ ! -d zLinebot ]; then
  git clone https://github.com/CVSz/zLinebot.git
fi

cd zLinebot

# --- env ---
if [ -f .env.example ] && [ ! -f .env ]; then
  cp .env.example .env
fi

# --- ollama ---
docker run -d --name ollama -p 11434:11434 ollama/ollama || true
docker exec ollama ollama pull mistral || true

# --- run stack ---
docker compose up -d --build

echo "✅ DONE"
echo "👉 Configure cloudflared:"
echo "cloudflared tunnel login"
echo "cloudflared tunnel create zlinebot"
echo "cloudflared tunnel run zlinebot"
