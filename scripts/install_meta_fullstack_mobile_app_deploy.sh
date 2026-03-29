#!/usr/bin/env bash
set -euo pipefail

echo "📱 META FULL-STACK MOBILE APPLICATION DEPLOYMENT INSTALLER"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OS="$(uname -s)"

if [[ "$OS" == "Linux" ]]; then
  "$ROOT_DIR/scripts/install_meta_fullstack_android_app_deploy.sh"
elif [[ "$OS" == "Darwin" ]]; then
  "$ROOT_DIR/scripts/install_meta_fullstack_ios_app_deploy.sh"
else
  echo "❌ Unsupported OS: $OS"
  echo "Run one of the platform-specific installers manually."
  exit 1
fi

echo "✅ Meta full-stack mobile deployment installer completed"
