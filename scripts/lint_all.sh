#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "==> Linting Python (ruff)"
python3 -m ruff check ml scripts

echo "==> Type-checking backend (TypeScript)"
(
  cd app
  npm install --no-audit --no-fund
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
  -not -path './admin/node_modules/*' \
  -not -path './app/node_modules/*' \
  -print0 | xargs -0 -r shellcheck

echo "All lint checks completed."
