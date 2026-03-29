#!/usr/bin/env bash
set -euo pipefail

echo "🚀 ZLINEBOT ULTIMATE INSTALL"

# --- system ---
sudo apt update
sudo apt install -y docker.io docker-compose git curl python3-pip

sudo systemctl enable docker
sudo systemctl start docker

# --- clone ---
if [ ! -d zLinebot ]; then
  git clone https://github.com/CVSz/zLinebot.git
fi

cd zLinebot

if [ -f .env.example ] && [ ! -f .env ]; then
  cp .env.example .env
fi

# --- python deps ---
python3 -m pip install torch shap Pyfhel scikit-learn

# --- start infra ---
docker compose up -d --build

# --- init ollama ---
docker exec ollama ollama pull mistral || true

# --- kafka topics ---
docker exec kafka kafka-topics.sh --create --topic events --bootstrap-server localhost:9092 || true

# --- health ---
sleep 5
curl --fail http://localhost:3000/health

echo "✅ SYSTEM READY"
