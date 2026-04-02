#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-zlinebot.zeaz.dev}"
NAMESPACE="${NAMESPACE:-zlinebot}"
INTERVAL_SECONDS="${INTERVAL_SECONDS:-30}"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

while true; do
  if ! curl -kfsS "https://${DOMAIN}/health" | grep -qi 'ok'; then
    log "🚨 Health check failed, restarting deployments"
    kubectl rollout restart deployment/api -n "$NAMESPACE" || true
    kubectl rollout restart deployment/worker -n "$NAMESPACE" || true
  else
    log "✅ Health check OK"
  fi

  sleep "$INTERVAL_SECONDS"
done
