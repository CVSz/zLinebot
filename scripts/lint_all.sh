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
  ONNXRUNTIME_NODE_INSTALL=skip NODE_OPTIONS="${NODE_OPTIONS:---dns-result-order=ipv4first}" npm install --ignore-scripts --no-audit --no-fund --no-package-lock
  npm run build
)

echo "==> Building admin frontend"
(
  cd admin
  npm install --no-audit --no-fund
  npm run build
)

echo "==> Shellcheck (*.sh)"
if ! command -v shellcheck >/dev/null 2>&1; then
  echo "shellcheck not found; attempting install"
  if command -v apt-get >/dev/null 2>&1; then
    if command -v sudo >/dev/null 2>&1; then
      if ! (sudo apt-get update && sudo apt-get install -y shellcheck); then
        echo "⚠️ unable to install shellcheck via sudo apt-get"
      fi
    else
      if ! (apt-get update && apt-get install -y shellcheck); then
        echo "⚠️ unable to install shellcheck via apt-get"
      fi
    fi
  fi
fi

if command -v shellcheck >/dev/null 2>&1; then
  find . -type f -name '*.sh' \
    -not -path './.git/*' \
    -not -path './admin/node_modules/*' \
    -not -path './app/node_modules/*' \
    -print0 | xargs -0 -r shellcheck
else
  echo "⚠️ shellcheck still unavailable; skipping shell lint step"
fi

echo "All lint checks completed."
