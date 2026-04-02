#!/usr/bin/env bash
set -euo pipefail

echo "📊 Installing monitoring stack..."

kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts >/dev/null 2>&1 || true
helm repo update

helm upgrade --install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring

echo "⏳ Waiting for monitoring pods..."
kubectl wait --namespace monitoring --for=condition=Ready pods --all --timeout=300s

kubectl get pods -n monitoring

echo "✅ Monitoring stack installed"
echo "ℹ️ Grafana password: kubectl get secret -n monitoring monitoring-grafana -o jsonpath='{.data.admin-password}' | base64 --decode"
