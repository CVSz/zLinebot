#!/usr/bin/env bash
set -euo pipefail

echo "🚀 INSTALL NO-COST MODE"

SUDO=""
if command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
fi

$SUDO apt update
$SUDO apt install -y docker.io docker-compose-plugin curl git wget

if ! command -v k3s >/dev/null 2>&1; then
  curl -sfL https://get.k3s.io | sh -
fi

export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

if [ ! -d zLinebot ]; then
  git clone https://github.com/CVSz/zLinebot.git
fi

cd zLinebot
cp .env.example .env 2>/dev/null || true

docker compose -f docker/compose.no-cost.yml up -d --build

wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -O /tmp/cloudflared-linux-amd64.deb
$SUDO dpkg -i /tmp/cloudflared-linux-amd64.deb

echo "⚠️ Run manually:"
echo "cloudflared tunnel login"
echo "cloudflared tunnel create zlinebot"
echo "✅ NO-COST READY"
