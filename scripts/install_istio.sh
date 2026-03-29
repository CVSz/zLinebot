#!/usr/bin/env bash
set -euo pipefail
curl -L https://istio.io/downloadIstio | sh -
cd istio-*
export PATH="$PWD/bin:$PATH"
istioctl install --set profile=demo -y
kubectl label namespace zlinebot istio-injection=enabled --overwrite
