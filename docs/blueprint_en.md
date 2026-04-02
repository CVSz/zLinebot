# ZLineBot Blueprint (EN)

## Architecture
Express backend with tenant middleware, LINE webhook, billing/privacy/audit APIs, and websocket metrics.

## Runtime Layers
- Edge: Nginx, Cloudflare tunnel
- API: routers + middleware
- Data: Postgres/Redis + optional event stack
- Realtime: event counters -> `/ws`

## Data Domains
Core tables: `products`, `carts`, `orders`, `invoices`, `subscriptions`, `loyalty_points`, `referrals`.

## AI Path
Intent trigger -> ranking/recommendation -> LLM fallback.

## Security
API key + tenant isolation, LINE signature verification, rate limiting, privacy endpoints.

## Deployment
Docker Compose for standard setup; k8s manifests + infra scripts for advanced deployments.
