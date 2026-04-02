#!/usr/bin/env bash
set -euo pipefail

if ! command -v kubectl >/dev/null 2>&1; then
  echo "[ERROR] kubectl is required but not installed."
  exit 1
fi

curl -L https://istio.io/downloadIstio | sh -
ISTIO_DIR="$(find . -maxdepth 1 -type d -name 'istio-*' | sort | tail -n1)"
if [[ -z "${ISTIO_DIR}" ]]; then
  echo "[ERROR] Could not find extracted Istio directory."
  exit 1
fi

cd "${ISTIO_DIR}"
export PATH="$PWD/bin:$PATH"
istioctl install --set profile=demo -y
kubectl label namespace zlinebot istio-injection=enabled --overwrite
