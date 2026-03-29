#!/usr/bin/env bash
set -euo pipefail

echo "🍎 INSTALL IOS DEPLOYMENT TOOLCHAIN"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "❌ iOS deployment requires macOS with Xcode."
  exit 1
fi

if ! command -v brew >/dev/null 2>&1; then
  echo "❌ Homebrew not found. Install from https://brew.sh first."
  exit 1
fi

brew update
brew install cocoapods fastlane

if ! xcode-select -p >/dev/null 2>&1; then
  echo "❌ Xcode command line tools are missing. Run: xcode-select --install"
  exit 1
fi

sudo xcodebuild -license accept || true
pod --version >/dev/null

echo "✅ iOS deployment tooling installed"
echo "👉 Next: open Xcode once, sign in to Apple Developer account, and configure provisioning profiles."
