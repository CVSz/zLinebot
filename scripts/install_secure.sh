#!/usr/bin/env bash
set -euo pipefail

gen_secret() {
  openssl rand -hex 32
}

read -rp "DB_PASSWORD (leave blank to auto): " DB_PASS
DB_PASS=${DB_PASS:-$(gen_secret)}

read -rp "JWT_SECRET (leave blank to auto): " JWT
JWT=${JWT:-$(gen_secret)}

read -rp "RUNPOD_API_KEY: " RUNPOD

cat > .env <<ENVEOF
DB_PASSWORD=$DB_PASS
JWT_SECRET=$JWT
RUNPOD_API_KEY=$RUNPOD
AI_MODE=hybrid
VECTOR_MODE=local
GPU_BURST=true
MAX_BUDGET=5
ENVEOF

chmod 600 .env
echo "🔐 Secrets generated and stored"
