#!/usr/bin/env bash
set -euo pipefail

echo "📱 INSTALL FULL-STACK MOBILE DEPLOYMENT TOOLCHAIN"

SUDO=""
if command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
fi

if [[ "$(uname -s)" == "Linux" ]]; then
  # NOTE: Uses apt (Debian/Ubuntu package manager).
  $SUDO apt update
  $SUDO apt install -y curl git nodejs npm ruby-full build-essential
elif [[ "$(uname -s)" == "Darwin" ]]; then
  if ! command -v brew >/dev/null 2>&1; then
    echo "❌ Homebrew required on macOS."
    exit 1
  fi
  brew update
  brew install node ruby cocoapods fastlane
else
  echo "❌ Unsupported OS: $(uname -s)"
  exit 1
fi

if [ ! -d zLinebot ]; then
  git clone https://github.com/CVSz/zLinebot.git
fi

npm install --prefix zLinebot/app

echo "✅ Base full-stack mobile dependencies installed"
echo "👉 Run platform-specific installer next:"
echo "   - Linux/Android: scripts/install_android_deploy.sh"
echo "   - macOS/iOS:    scripts/install_ios_deploy.sh"
