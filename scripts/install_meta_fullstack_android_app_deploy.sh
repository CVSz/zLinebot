#!/usr/bin/env bash
set -euo pipefail

echo "🤖 META FULL-STACK ANDROID APPLICATION DEPLOYMENT INSTALLER"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$ROOT_DIR/scripts/install_mobile_fullstack_deploy.sh"
"$ROOT_DIR/scripts/install_android_deploy.sh"

if command -v npm >/dev/null 2>&1; then
  npm install --prefix "$ROOT_DIR/mobile"
fi

echo "✅ Meta full-stack Android deployment installer completed"
echo "👉 Next: configure Android keystore + fastlane lane before release build."
