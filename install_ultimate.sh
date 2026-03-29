#!/usr/bin/env bash
set -e

echo "🚀 ZLINEBOT ULTIMATE ENTERPRISE INSTALL"

apt update
apt install -y docker.io docker-compose git curl nodejs npm python3-pip

systemctl enable docker
systemctl start docker

# clone repo
if [ ! -d zLinebot ]; then
  git clone https://github.com/CVSz/zLinebot.git
fi

cd zLinebot

cp .env.example .env || true

# deps
npm install
pip install torch shap Pyfhel scikit-learn

# start
docker compose up -d --build

# docs
node scripts/gen-docs.ts

echo "✅ READY"
