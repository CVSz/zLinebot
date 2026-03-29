#!/usr/bin/env bash
set -euo pipefail

echo "🤖 INSTALL ANDROID DEPLOYMENT TOOLCHAIN"

SUDO=""
if command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
fi

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "❌ Android installer currently supports Linux hosts only."
  exit 1
fi

$SUDO apt update
$SUDO apt install -y curl git unzip zip openjdk-17-jdk ruby-full build-essential

if ! command -v sdkmanager >/dev/null 2>&1; then
  mkdir -p "$HOME/Android/cmdline-tools"
  curl -fsSL "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" -o /tmp/cmdline-tools.zip
  rm -rf "$HOME/Android/cmdline-tools/latest"
  unzip -q /tmp/cmdline-tools.zip -d "$HOME/Android/cmdline-tools"
  mv "$HOME/Android/cmdline-tools/cmdline-tools" "$HOME/Android/cmdline-tools/latest"
fi

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android}"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

yes | sdkmanager --licenses >/dev/null
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"

gem install --no-document fastlane

echo "✅ Android deployment tooling installed"
echo "👉 Next: set ANDROID_HOME and add cmdline-tools/platform-tools to PATH in your shell profile."
