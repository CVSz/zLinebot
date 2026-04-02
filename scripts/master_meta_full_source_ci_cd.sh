#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-ci}"

cd "$ROOT_DIR"

echo "==> zLinebot master meta full-source CI/CD"
echo "Mode: $MODE"

run_ci() {
  echo "==> Running full-source lint/build checks"
  ./scripts/lint_all.sh

  echo "==> Building root Docker image"
  docker build -t zlinebot:ci .
}

run_cd() {
  local image_ref="${FLY_REGISTRY:-registry.fly.io/zlinebot}:latest"

  if [[ -z "${FLY_API_TOKEN:-}" ]]; then
    echo "ERROR: FLY_API_TOKEN is required for cd mode" >&2
    exit 1
  fi

  echo "==> Logging into Fly registry"
  echo "$FLY_API_TOKEN" | docker login registry.fly.io -u x --password-stdin

  echo "==> Pushing image: ${image_ref}"
  docker tag zlinebot:ci "$image_ref"
  docker push "$image_ref"
}

case "$MODE" in
  ci)
    run_ci
    ;;
  cd)
    run_ci
    run_cd
    ;;
  *)
    echo "Usage: $0 [ci|cd]" >&2
    exit 1
    ;;
esac

echo "==> Master meta full-source CI/CD flow completed"
