#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "[ERROR] docker is required but not installed."
  exit 1
fi

if docker ps -a --format '{{.Names}}' | grep -qx 'vault'; then
  echo "[INFO] Container 'vault' already exists; removing it to recreate with expected settings."
  docker rm -f vault >/dev/null
fi

docker run -d --name vault -p 8200:8200 vault

echo "Set DB_PASS and JWT in your shell, then run:"
echo "vault kv put secret/zlinebot db_password=\"\$DB_PASS\" jwt=\"\$JWT\""
