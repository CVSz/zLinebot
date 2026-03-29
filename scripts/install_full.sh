#!/usr/bin/env bash
set -euo pipefail

echo "🚀 INSTALL FULL FEATURE MODE"

SUDO=""
if command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
fi

$SUDO apt update
$SUDO apt install -y docker.io docker-compose-plugin curl git nodejs npm python3-pip

if ! command -v k3s >/dev/null 2>&1; then
  curl -sfL https://get.k3s.io | sh -
fi

export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

if [ ! -d zLinebot ]; then
  git clone https://github.com/CVSz/zLinebot.git
fi

cd zLinebot
cp .env.example .env 2>/dev/null || true

npm install --prefix app
pip install torch shap Pyfhel scikit-learn

kubectl apply -f k8s/core.yaml
kubectl apply -f k8s/redpanda.yaml
kubectl apply -f k8s/observability.yaml

docker compose -f docker/compose.full.yml up -d qdrant

echo "✅ FULL FEATURE READY"
