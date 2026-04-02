#!/usr/bin/env bash
# ============================================================
# zLinebot Self-Healing Deploy
# Retries transient failures, validates health, and auto-rolls back.
# ============================================================

set -euo pipefail

DOMAIN="${DOMAIN:-zlinebot.zeaz.dev}"
NAMESPACE="${NAMESPACE:-zlinebot}"
KUBECONFIG_PATH="${KUBECONFIG_PATH:-/etc/rancher/k3s/k3s.yaml}"
RETRY_MAX="${RETRY_MAX:-5}"
RETRY_DELAY="${RETRY_DELAY:-5}"
PODS_MIN_RUNNING="${PODS_MIN_RUNNING:-2}"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

retry() {
  local attempt=1
  until "$@"; do
    if [[ "$attempt" -ge "$RETRY_MAX" ]]; then
      log "❌ Command failed after ${attempt} attempts: $*"
      return 1
    fi
    log "⚠️ Retry ${attempt}/${RETRY_MAX}: $*"
    attempt=$((attempt + 1))
    sleep "$RETRY_DELAY"
  done
}

wait_k8s() {
  log "⏳ Waiting for Kubernetes API..."
  export KUBECONFIG="$KUBECONFIG_PATH"

  until kubectl get nodes >/dev/null 2>&1; do
    sleep 5
  done

  log "✅ Kubernetes API ready"
}

wait_pods() {
  log "⏳ Waiting for pods in namespace: ${NAMESPACE}"

  for _ in {1..30}; do
    local ready
    ready="$(kubectl get pods -n "$NAMESPACE" --no-headers 2>/dev/null | awk '$3=="Running"{c++} END{print c+0}')"

    if [[ "$ready" -ge "$PODS_MIN_RUNNING" ]]; then
      log "✅ Pods are running (${ready})"
      return 0
    fi

    sleep 5
  done

  return 1
}

wait_rollouts() {
  log "⏳ Waiting for deployment rollouts"
  kubectl rollout status deployment/api -n "$NAMESPACE" --timeout=180s
  kubectl rollout status deployment/worker -n "$NAMESPACE" --timeout=180s
  log "✅ Deployments rolled out"
}

health_check() {
  log "🔍 Running health check: https://${DOMAIN}/health"

  for _ in {1..20}; do
    if curl -kfsS "https://${DOMAIN}/health" | grep -qi 'ok'; then
      log "✅ Health check passed"
      return 0
    fi
    sleep 5
  done

  return 1
}

rollback() {
  log "🔄 ROLLBACK INITIATED"
  kubectl rollout undo deployment/api -n "$NAMESPACE" || true
  kubectl rollout undo deployment/worker -n "$NAMESPACE" || true
  kubectl rollout status deployment/api -n "$NAMESPACE" --timeout=180s || true
  kubectl rollout status deployment/worker -n "$NAMESPACE" --timeout=180s || true
  log "⚠️ Rollback finished"
}

main() {
  log "🚀 SELF-HEALING DEPLOY START"

  retry systemctl restart k3s
  wait_k8s

  retry kubectl apply --validate=false -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

  kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

  retry kubectl apply -f k8s/

  if ! wait_pods; then
    log "❌ Pods failed to start"
    rollback
    exit 1
  fi

  if ! retry wait_rollouts; then
    log "❌ Rollout check failed"
    rollback
    exit 1
  fi

  if ! health_check; then
    log "❌ Health check failed"
    rollback
    exit 1
  fi

  log "🎉 DEPLOY SUCCESS (SELF-HEALED)"
}

main "$@"
