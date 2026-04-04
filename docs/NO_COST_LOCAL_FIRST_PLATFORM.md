# zLinebot Local-First AI SaaS Platform (Production Blueprint)

## Core stack (no-cost)
- k3s + Docker, local persistent volumes
- Cloudflare Tunnel for private exposure (no open inbound ports)
- FastAPI API + worker + Ollama + n8n + PostgreSQL/pgvector + Redis Streams
- Prometheus + Grafana + OpenTelemetry
- Vault dev mode for local secrets bootstrap

## Mandatory flow design
### LINE
`Webhook -> HMAC verify -> JWT/RBAC -> tenant scope -> rate-limit -> dedupe -> intent -> DB/RAG -> Ollama -> fallback`

### TikTok
`Webhook -> Redis stream -> worker -> DB -> AI -> n8n`

### Queue controls
- Redis stream consumer groups
- max retry = 3
- DLQ stream per tenant
- idempotency key on every event

## Security invariants
- HMAC SHA256 check for LINE `x-line-signature`
- JWT validation: issuer, audience, exp, signature
- per-tenant OPA policy bundle (`policy/tenants/<tenant_id>/`)
- all SQL uses parameterized queries
- redact PII in logs

## Codex analysis layers
- AST Python + TypeScript
- SSA risk signal per function
- inter-procedural taint (source->sink)
- IsolationForest anomaly scoring
- OPA decision gate
- Ollama JSON review + schema validation

## CI/CD gate
- Block merge when any `critical|high` finding exists
- Allow safe auto-fix patch generation only for deterministic transforms

## Multi-tenant constraints
- every table has `shop_id`
- every query requires `shop_id`
- Redis keys prefixed with `tenant:{shop_id}:...`
- vector search filtered by tenant metadata

## SLO targets
- webhook p95 < 100ms
- worker success >= 99.5%
- DLQ rate < 0.5%

## i18n behavior
- parse `Accept-Language`
- fallback `en`
