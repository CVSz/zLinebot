#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Installing tracing + logging stack..."

kubectl create namespace observability --dry-run=client -o yaml | kubectl apply -f -

helm repo add grafana https://grafana.github.io/helm-charts >/dev/null 2>&1 || true
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts >/dev/null 2>&1 || true
helm repo update

helm upgrade --install loki grafana/loki-stack \
  --namespace observability \
  --set promtail.enabled=true

helm upgrade --install jaeger jaegertracing/jaeger \
  --namespace observability

echo "⏳ Waiting for observability pods..."
kubectl wait --namespace observability --for=condition=Ready pods --all --timeout=300s

kubectl get pods -n observability

echo "✅ Observability stack installed"
