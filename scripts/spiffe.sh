#!/usr/bin/env bash
set -euo pipefail

if ! command -v spire-server >/dev/null 2>&1 || ! command -v spire-agent >/dev/null 2>&1; then
  echo "[ERROR] Both spire-server and spire-agent must be installed and available in PATH."
  exit 1
fi

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "[INFO] Starting spire-server in background..."
spire-server run &
SERVER_PID=$!

echo "[INFO] Starting spire-agent in foreground..."
spire-agent run
