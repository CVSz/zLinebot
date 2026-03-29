#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Detecting system..."
RAM_MB=$(free -m | awk '/Mem:/ {print $2}')
CPU=$(nproc)

echo "CPU: $CPU cores"
echo "RAM: $RAM_MB MB"

MODE="no-cost"
if [ "$RAM_MB" -ge 16000 ] && [ "$CPU" -ge 4 ]; then
  MODE="full"
fi

echo "🚀 Selected mode: $MODE"
if [ "$MODE" = "full" ]; then
  bash scripts/install_full.sh
else
  bash scripts/install_no_cost.sh
fi
