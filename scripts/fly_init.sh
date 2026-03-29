#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-zlinebot}"
REGION="${REGION:-sin}"

fly launch \
  --name "${APP_NAME}" \
  --region "${REGION}" \
  --no-deploy \
  --dockerfile Dockerfile
