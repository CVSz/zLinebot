#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "[ERROR] docker is required but not installed."
  exit 1
fi

if docker ps -a --format '{{.Names}}' | grep -qx 'crdb'; then
  echo "[INFO] Container 'crdb' already exists; removing it to recreate with expected settings."
  docker rm -f crdb >/dev/null
fi

docker run -d --name crdb \
  -p 26257:26257 -p 8080:8080 \
  cockroachdb/cockroach start-single-node --insecure

echo "[INFO] CockroachDB started: sql=26257 admin_ui=8080"
