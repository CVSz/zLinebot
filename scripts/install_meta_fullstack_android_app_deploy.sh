#!/usr/bin/env bash
set -euo pipefail

echo "🤖 META FULL-STACK ANDROID APPLICATION DEPLOYMENT INSTALLER"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$ROOT_DIR/scripts/install_mobile_fullstack_deploy.sh"
"$ROOT_DIR/scripts/install_android_deploy.sh"

npm install --prefix "$ROOT_DIR/app"

echo "✅ Meta full-stack Android deployment installer completed"
echo "👉 Next: configure Android keystore + fastlane lane before release build."
