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
  local image_ref="${DOCKER_IMAGE_REF:-ghcr.io/cvsz/zlinebot}:latest"

  if [[ -z "${DOCKER_REGISTRY:-}" || -z "${DOCKER_USERNAME:-}" || -z "${DOCKER_PASSWORD:-}" ]]; then
    echo "ERROR: DOCKER_REGISTRY, DOCKER_USERNAME, and DOCKER_PASSWORD are required for cd mode" >&2
    exit 1
  fi

  echo "==> Logging into container registry: ${DOCKER_REGISTRY}"
  echo "$DOCKER_PASSWORD" | docker login "${DOCKER_REGISTRY}" -u "${DOCKER_USERNAME}" --password-stdin

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
