#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "==> Linting Python (ruff)"
if ! python3 -m ruff --version >/dev/null 2>&1; then
  echo "ruff not found; installing into current Python environment"
  python3 -m pip install --upgrade pip ruff
fi
python3 -m ruff check ml scripts

echo "==> Type-checking backend (TypeScript)"
(
  cd app
  npm config delete proxy || true
  npm config delete http-proxy || true
  npm config delete https-proxy || true
  NODE_OPTIONS="${NODE_OPTIONS:---dns-result-order=ipv4first}" npm install --no-audit --no-fund --no-package-lock
  npm run build
)

echo "==> Building admin frontend"
(
  cd admin
  npm install --no-audit --no-fund
  npm run build
)

echo "==> Shellcheck (*.sh)"
find . -type f -name '*.sh' \
  -not -path './.git/*' \
  -not -path './admin/node_modules/*' \
  -not -path './app/node_modules/*' \
  -print0 | xargs -0 -r shellcheck

echo "All lint checks completed."
