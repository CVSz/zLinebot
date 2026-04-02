> **Documentation Update (2026-04-02):** For the latest repository-wide feature analysis, see `docs/FEATURE_DEEP_IMPACT_DIVE_2026-04.md`.

# ZLineBot Documentation (EN)

Last updated: 2026-04-01

ZLineBot is a multi-tenant commerce platform with LINE webhook integration, privacy tooling, billing endpoints, and optional ML/recommendation modules.

## Quick Start

```bash
cp .env.example .env
docker compose up -d --build
curl http://localhost:3000/health
```

## Core API Surface

Tenant-scoped endpoints require:

- `x-api-key: <TENANT_API_KEY>`
- `x-tenant-id: <tenant_id>`

Key routes:

- `GET /health`
- `GET /products`, `POST /products`
- `POST /events/view`, `POST /events/click`
- `GET /cart/:userId`, `POST /cart`
- `GET /orders`, `POST /orders`
- `GET /admin/health`
- `GET /admin/billing`
- `POST /privacy/consent`, `GET /privacy/consent/:userId`
- `POST /privacy/dsr`

## Documentation Map

- `docs/USER.md` — End-user workflows
- `docs/ADMIN.md` — Admin workflows and API examples
- `docs/MANUAL.md` — Local/devops setup and deployment scripts
- `docs/openapi.yaml` — API schema (when maintained)
- `docs/REPO_STRUCTURE.md` — Repository architecture and upgrade notes
