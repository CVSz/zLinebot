#!/usr/bin/env bash
set -euo pipefail

echo "🍎 META FULL-STACK IOS APPLICATION DEPLOYMENT INSTALLER"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$ROOT_DIR/scripts/install_mobile_fullstack_deploy.sh"
"$ROOT_DIR/scripts/install_ios_deploy.sh"

if command -v npm >/dev/null 2>&1; then
  npm install --prefix "$ROOT_DIR/mobile"
fi

echo "✅ Meta full-stack iOS deployment installer completed"
echo "👉 Next: configure Apple signing/provisioning + fastlane lane before TestFlight/App Store upload."
