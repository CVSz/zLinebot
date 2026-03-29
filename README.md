# ZLineBot

> EN | [TH (ภาษาไทย)](README_th.md)

ZLineBot is a multi-tenant commerce + conversational AI platform with LINE integration, product/cart/order APIs, realtime metrics, and operations/compliance modules.

## Key Features
- Multi-tenant request isolation (`x-api-key`, `x-tenant-id`)
- Commerce APIs: products, cart, orders, billing
- LINE webhook bot integration with signature verification
- Realtime metrics over WebSocket (`/ws`)
- Privacy and DSR APIs (consent/access/delete/rectify)
- Flexible deployment: Docker Compose, scripts, Kubernetes manifests

## Architecture at a Glance
- **Backend:** Express + TypeScript (`app/`)
- **Admin UI:** React + Vite (`admin/`)
- **Mobile samples:** React Native snippets (`mobile/`)
- **Data:** Postgres, Redis, Kafka, ClickHouse, Qdrant, Flink assets
- **Infra:** Docker, k8s manifests, Terraform/Cloudflare artifacts

## Quick Start
```bash
cp .env.example .env
docker compose up -d --build
curl http://localhost:3000/health
```

## Core API Endpoints
Headers:
- `x-api-key: <TENANT_API_KEY>`
- `x-tenant-id: <tenant_id>`

Endpoints:
- `GET /products`, `POST /products`
- `GET /cart/:userId`, `POST /cart`
- `GET /orders`, `POST /orders`
- `GET /admin/health`, `GET /admin/billing`
- `POST /admin/audit/ledger-export`
- `POST /privacy/consent`, `GET /privacy/consent/:userId`, `POST /privacy/dsr`

## Realtime Metrics
- WebSocket: `ws://<host>/ws`
- Message type: `metrics`
- Payload fields: `messages`, `orders`, `payments`

## Documentation
### Manuals
- [User Manual (EN)](user_manual_en.md)
- [User Manual (TH)](user_manual_th.md)
- [Admin Manual (EN)](admin_manual_en.md)
- [Admin Manual (TH)](admin_manual_th.md)
- [Install Manual (EN)](install_manual_en.md)
- [Install Manual (TH)](install_manual_th.md)

### Project Documents
- [Repository Structure & Upgrade Readiness](docs/REPO_STRUCTURE.md)
- [Quick README (EN, archived)](docs/readme_en.md)
- [Quick README (TH, archived)](docs/readme_th.md)
- [Blueprint (EN)](blueprint_en.md)
- [Blueprint (TH)](blueprint_th.md)
- [Roadmap (EN)](roadmaps_en.md)
- [Roadmap (TH)](roadmaps_th.md)
- [Presentation (EN)](presentation_en.md)
- [Presentation (TH)](presentation_th.md)

## GitHub Community Files
- [Code of Conduct](CODE_OF_CONDUCT.md) | [TH](CODE_OF_CONDUCT_th.md)
- [Contributing](CONTRIBUTING.md) | [TH](CONTRIBUTING_th.md)
- [Security](SECURITY.md) | [TH](SECURITY_th.md)
- [License](LICENSE) | [EN copy](LICENSE_EN.md) | [TH guide](LICENSE_TH.md)
