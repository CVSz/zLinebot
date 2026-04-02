> **Documentation Update (2026-04-02):** For the latest repository-wide feature analysis, see `docs/FEATURE_DEEP_IMPACT_DIVE_2026-04.md`.

# SaaS Foundation Plan

This document captures the incremental approach for evolving zLinebot into a production SaaS platform without a risky full rewrite.

## Phase 1: Foundation
- Monorepo scaffold (`apps/*`, `packages/*`) via `scripts/bootstrap-saas-foundation.sh`.
- Core stack targets:
  - Fastify API
  - Prisma + PostgreSQL
  - BullMQ + Redis
  - React admin
  - Docker + Nginx

## Phase 2: Automation & Security
- Automation queue runner and worker executor.
- Webhook ingestion for external events.
- API key support.
- Baseline protections:
  - Helmet
  - Rate limiting
  - Env secret generation

## Phase 3: Monetization & Observability
- Stripe subscription lifecycle + webhook handling.
- Usage tracking and quota enforcement hooks.
- Execution logs and analytics endpoints.
- Dashboard widgets for automation and usage stats.

## Bootstrap command
```bash
./scripts/bootstrap-saas-foundation.sh
```

Optionally choose an output folder:
```bash
./scripts/bootstrap-saas-foundation.sh zlinebot-saas
```
