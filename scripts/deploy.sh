#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-zlinebot.zeaz.dev}"

bash scripts/generate-secrets.sh "${DOMAIN}" .env
docker compose pull
docker compose up -d --build

echo "🚀 zLinebot deployed for ${DOMAIN}"
