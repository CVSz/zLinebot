#!/usr/bin/env bash
set -euo pipefail

docker run -d --name vault -p 8200:8200 vault

echo "Set DB_PASS and JWT in your shell, then run:"
echo 'vault kv put secret/zlinebot db_password="$DB_PASS" jwt="$JWT"'
