#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/zlinebot}"
CURRENT_FILE="${APP_DIR}/current"
NGINX_CONF="${APP_DIR}/nginx/default.conf"
NGINX_CONTAINER="${NGINX_CONTAINER:-nginx}"
HEALTH_PATH="${HEALTH_PATH:-/health}"
REPO_BRANCH="${REPO_BRANCH:-main}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-30}"
SLEEP_SECONDS="${SLEEP_SECONDS:-2}"

cd "$APP_DIR"

echo "🚀 Starting zero-downtime deploy..."

if [[ ! -f "$CURRENT_FILE" ]]; then
  echo "blue" > "$CURRENT_FILE"
fi

CURRENT="$(cat "$CURRENT_FILE")"
if [[ "$CURRENT" == "blue" ]]; then
  NEXT="green"
  NEXT_PORT=3002
else
  NEXT="blue"
  NEXT_PORT=3001
fi

echo "🔁 Switching from $CURRENT → $NEXT"

git fetch origin "$REPO_BRANCH"
git reset --hard "origin/$REPO_BRANCH"

docker compose -f "docker-compose.${NEXT}.yml" build
docker compose -f "docker-compose.${NEXT}.yml" up -d

echo "⏳ Waiting for health check at http://localhost:${NEXT_PORT}${HEALTH_PATH}"
healthy=0
for _ in $(seq 1 "$MAX_ATTEMPTS"); do
  if curl -fsS "http://localhost:${NEXT_PORT}${HEALTH_PATH}" | grep -q 'ok'; then
    healthy=1
    echo "✅ New version is healthy"
    break
  fi
  sleep "$SLEEP_SECONDS"
done

if [[ "$healthy" -ne 1 ]]; then
  echo "❌ Health check failed. Keeping traffic on ${CURRENT}."
  docker compose -f "docker-compose.${NEXT}.yml" logs --tail=100 || true
  exit 1
fi

sed -i -E "s/server 127.0.0.1:[0-9]+;/server 127.0.0.1:${NEXT_PORT};/" "$NGINX_CONF"
docker exec "$NGINX_CONTAINER" nginx -s reload

echo "🔀 Traffic switched to $NEXT"

docker compose -f "docker-compose.${CURRENT}.yml" stop api worker
docker compose -f "docker-compose.${CURRENT}.yml" rm -f api worker

echo "$NEXT" > "$CURRENT_FILE"

echo "🎉 Deploy complete with ZERO downtime"
