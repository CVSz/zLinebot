> **Documentation Update (2026-04-02):** For the latest repository-wide feature analysis, see `docs/FEATURE_DEEP_IMPACT_DIVE_2026-04.md`.

# ZLineBot Full Installation Guide

Last updated: 2026-04-02

This guide provides complete installation paths for local development, low-cost environments, and production-like setups.

## 1) Installation modes

| Mode | Use case | Main command |
|---|---|---|
| Quick local | Fast validation/dev | `./install.sh` or `docker compose up -d --build` |
| Manual local | Full control step-by-step | Follow sections 3-7 |
| No-cost profile | Budget constrained experiments | `./scripts/install_no_cost.sh` |
| Full profile | Broader platform components | `./scripts/install_full.sh` |
| Extended | Heavier turnkey setup variants | `./install_full.sh` / `./install_ultimate.sh` |

## 2) Prerequisites

Minimum:

- OS: Ubuntu/Debian (or compatible Linux container/VM)
- Docker Engine + Compose plugin
- `git`, `curl`, `bash`
- Open ports required by selected services

Optional but recommended:

- Node.js 20+ and npm (for app/admin direct runs)
- Python 3.10+ (ML scripts/utilities)
- `jq`, `make`, `kubectl`, `helm` for advanced ops

## 3) Clone and initialize

```bash
git clone https://github.com/CVSz/zLinebot.git
cd zLinebot
cp .env.example .env
```

## 4) Configure environment variables

At minimum set:

- `TENANT_API_KEY`
- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `DATABASE_URL`
- `REDIS_URL`

Common optional vars (depending on enabled integrations):

- TikTok OAuth + webhook secrets
- Stripe/payment webhook secret
- Kafka/ClickHouse/Qdrant service URLs
- Cloudflare tunnel / DNS settings

## 5) Start services (Docker-first)

```bash
docker compose up -d --build
```

Check container health:

```bash
docker compose ps
docker compose logs --tail=200 app
```

## 6) Verify baseline behavior

```bash
curl -sS http://localhost:3000/health
```

Expected outcome: healthy JSON response.

Optional tenant smoke:

```bash
curl -sS http://localhost:3000/products \
  -H "x-api-key: ${TENANT_API_KEY}" \
  -H "x-tenant-id: demo"
```

## 7) Admin UI validation

- Open the admin app URL from compose output (commonly `http://localhost:5173` or proxied route).
- Validate dashboard load, billing view, and order/product screens.

## 8) Webhook/integration setup

### LINE webhook

- Set LINE secret/token in `.env`
- Expose endpoint over secure HTTPS/tunnel
- Verify signature validation with real provider callbacks

### TikTok integration

- Configure client credentials + callback URL
- Test auth URL and callback flow
- Validate signed webhook ingestion

### Cloudflare tunnel (optional)

```bash
cloudflared tunnel login
cloudflared tunnel create zlinebot
cloudflared tunnel run zlinebot
```

## 9) Alternative installer scripts

- `./scripts/install_auto.sh` — helper automation path
- `./scripts/install_secure.sh` — security-focused setup
- `./scripts/install_k3s.sh` — k3s bootstrap
- `./scripts/install_istio.sh` — service mesh baseline
- `./scripts/install_mesh_nocost.sh` — mesh-oriented budget setup

> Always inspect script content before production use.

## 10) Kubernetes/infra path (advanced)

Use manifests in `k8s/` and infra definitions in `infra/`/`cloudflare/` once local/docker validation is stable.

Recommended sequence:

1. Validate app with compose
2. Stand up cluster and secret management
3. Apply core manifests (`k8s/core.yaml`, deployment/service/ingress)
4. Add observability and mesh components
5. Run staged rollout with canary checks

## 11) Troubleshooting guide

### App not healthy

- Check `docker compose logs app`
- Verify env variables and dependent service reachability

### Database connection errors

- Confirm `DATABASE_URL`
- Validate database container status and credentials

### LINE webhook returns 401/signature errors

- Recheck channel secret/token
- Ensure raw-body handling/signature flow remains intact

### Admin UI cannot load API

- Confirm CORS/base URL settings
- Confirm API container is up and reachable from admin service

### High restart loops

- `docker compose ps` for restart counts
- inspect failing service logs and memory/port conflicts

## 12) Hardening checklist before production

- Rotate default/dev secrets
- Enforce HTTPS everywhere
- Lock down ingress and webhook allowlists
- Enable centralized logging and retention policies
- Validate backup/restore and DR drills
- Enable alerting for health, queue lag, and error rates

## 13) Post-install operational checks

- `/health` stable over time
- Tenant-scoped endpoints enforce headers
- Billing/audit/privacy endpoints return expected payloads
- Websocket metrics stream is functional
- Admin flows complete without critical errors

## 14) Where to go next

- Proposal and rollout rationale: [PROPOSAL_FULL.md](PROPOSAL_FULL.md)
- Main repository guide: [../README.md](../README.md)
- Role manuals: `user_manual_*`, `admin_manual_*`, `install_manual_*`
