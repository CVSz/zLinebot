#!/usr/bin/env bash
set -euo pipefail

echo "🚀 INSTALL FULL FEATURE MODE"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

resolve_repo_root() {
  if git rev-parse --show-toplevel >/dev/null 2>&1; then
    git rev-parse --show-toplevel
    return 0
  fi
  if [ -d zLinebot ]; then
    echo "$(pwd)/zLinebot"
    return 0
  fi
  echo ""
}

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

REPO_ROOT="$(resolve_repo_root)"
if [ -z "${REPO_ROOT}" ]; then
  git clone https://github.com/CVSz/zLinebot.git
  REPO_ROOT="$(pwd)/zLinebot"
fi

cd "${REPO_ROOT}"
cp .env.example .env 2>/dev/null || true

run_npm_install_autoheal() {
  local package_dir="$1"
  local install_mode="${2:-standard}"

  if [ ! -f "${package_dir}/package.json" ]; then
    log "⏭️  Skipping ${package_dir} (no package.json)"
    return 0
  fi

  log "📦 npm install (${install_mode}) in ${package_dir}"
  if [ "${install_mode}" = "safe" ]; then
    (cd "${package_dir}" && ONNXRUNTIME_NODE_INSTALL=skip NODE_OPTIONS="--dns-result-order=ipv4first" npm install --ignore-scripts --no-audit --no-fund)
    return 0
  fi

  if (cd "${package_dir}" && npm install --no-audit --no-fund); then
    return 0
  fi

  log "⚠️ npm install failed in ${package_dir}, running auto-heal retry"
  (
    cd "${package_dir}"
    if ! npm cache verify; then
      log "⚠️ npm cache verify failed in ${package_dir}, continuing auto-heal fallback"
    fi
  )
  (cd "${package_dir}" && ONNXRUNTIME_NODE_INSTALL=skip NODE_OPTIONS="--dns-result-order=ipv4first" npm install --ignore-scripts --no-audit --no-fund)
}

configure_cloudflare_zero_trust_autoheal() {
  if [ "${ENABLE_CLOUDFLARE_AUTOHEAL:-true}" != "true" ]; then
    log "⏭️  Cloudflare auto-heal disabled (ENABLE_CLOUDFLARE_AUTOHEAL=false)"
    return 0
  fi

  if [ -n "${CLOUDFLARE_API_TOKEN:-}" ] && [ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ] && [ -n "${CLOUDFLARE_ZONE_ID:-}" ] && [ -n "${CLOUDFLARE_TUNNEL_ID:-}" ]; then
    log "☁️  Running Cloudflare Zero Trust auto-heal before install"
    bash scripts/configure_cloudflare_zero_trust_full.sh
  else
    log "⚠️  Cloudflare credentials not set. Skipping Zero Trust auto-heal preinstall."
  fi
}

configure_cloudflare_zero_trust_autoheal
run_npm_install_autoheal app safe
run_npm_install_autoheal admin standard
run_npm_install_autoheal apps/api standard
run_npm_install_autoheal apps/admin standard
run_npm_install_autoheal apps/worker standard

pip install torch shap Pyfhel scikit-learn

kubectl apply -f k8s/core.yaml
kubectl apply -f k8s/redpanda.yaml
kubectl apply -f k8s/observability.yaml

docker compose -f docker/compose.full.yml up -d qdrant

echo "✅ FULL FEATURE READY"
