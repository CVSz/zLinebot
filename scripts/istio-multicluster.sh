#!/usr/bin/env bash
set -euo pipefail
istioctl install --set profile=default -y
kubectl create namespace istio-system --dry-run=client -o yaml | kubectl apply -f -
kubectl label namespace zlinebot istio-injection=enabled --overwrite
