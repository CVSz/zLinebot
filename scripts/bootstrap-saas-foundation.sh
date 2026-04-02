#!/usr/bin/env bash
# Creates a SaaS monorepo scaffold alongside the current repository layout.
# The script is intentionally additive and non-destructive.

set -euo pipefail

ROOT_DIR="${1:-saas}"

mkdir -p "$ROOT_DIR"/{apps/{api,admin,worker},packages/{auth,db,automation,billing,tiktok,config},docker/nginx,.github/workflows}

write_if_missing() {
  local target="$1"
  local content="$2"

  if [[ -f "$target" ]]; then
    echo "[skip] $target already exists"
    return
  fi

  printf "%s\n" "$content" > "$target"
  echo "[create] $target"
}

write_if_missing "$ROOT_DIR/package.json" '{
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}'

write_if_missing "$ROOT_DIR/turbo.json" '{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}'

write_if_missing "$ROOT_DIR/packages/db/schema.prisma" 'generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Tenant {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
}'

write_if_missing "$ROOT_DIR/apps/api/README.md" '# API

Fastify API placeholder for SaaS foundation.'

write_if_missing "$ROOT_DIR/apps/admin/README.md" '# Admin

React admin placeholder for SaaS foundation.'

write_if_missing "$ROOT_DIR/apps/worker/README.md" '# Worker

BullMQ worker placeholder for SaaS foundation.'

write_if_missing "$ROOT_DIR/docker-compose.yml" 'version: "3.9"

services:
  api:
    image: node:20
    working_dir: /app
    command: ["node", "-e", "console.log(\"api placeholder\")"]

  redis:
    image: redis:7

  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgres'

echo "SaaS scaffold generated in: $ROOT_DIR"
