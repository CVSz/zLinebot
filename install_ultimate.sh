#!/usr/bin/env bash
set -euo pipefail

echo "🚀 ZLINEBOT ULTIMATE ENTERPRISE INSTALL"

sudo apt update
sudo apt install -y docker.io docker-compose git curl nodejs npm python3-pip

sudo systemctl enable docker
sudo systemctl start docker

# clone repo
if [ ! -d zLinebot ]; then
  git clone https://github.com/CVSz/zLinebot.git
fi

cd zLinebot

if [ -f .env.example ] && [ ! -f .env ]; then
  cp .env.example .env
fi

# deps
npm install
python3 -m pip install torch shap Pyfhel scikit-learn

# start
docker compose up -d --build

# docs
node scripts/gen-docs.ts

echo "✅ READY"
