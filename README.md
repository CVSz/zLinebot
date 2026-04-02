# ZLineBot

ZLineBot is a multi-tenant commerce + conversational AI platform designed for LINE-centric businesses that need production APIs, operational control panels, compliance controls, and an extensible AI/ML stack.

> Language docs: [README (TH)](docs/README_th.md)

## 1) What this repository provides

- **Backend APIs (TypeScript/Express)** for products, carts, orders, billing, privacy/DSR, TikTok/LINE integrations, observability, and policy control.
- **Admin web app (React/Vite)** for operations, billing, dashboarding, and TikTok Shop workflows.
- **Data + infra assets** (Postgres schemas, Kafka/Flink assets, Docker Compose, K8s manifests, Terraform/Cloudflare).
- **AI/ML modules** including ranking/recommendation scaffolding, RL components, world-model experiments, and feature-store hooks.

## 2) System architecture (high level)

- `app/` — core API, business logic, service integrations, policy/guardrails, agents, RL, identity, privacy, compliance.
- `admin/` — operational console UI.
- `docs/` — manuals, roadmap/proposal/presentation, governance/localization docs, API schema.
- `db/` + `warehouse/` — schema and analytics SQL.
- `docker/`, `k8s/`, `infra/`, `cloudflare/`, `cloud/` — deployment and platform artifacts.
- `ml/` + `flink/` — ML training/serving helpers and stream-processing jobs.

For deeper structure notes, see **[docs/REPO_STRUCTURE.md](docs/REPO_STRUCTURE.md)**.

## 3) Quick start (local)

```bash
cp .env.example .env
docker compose up -d --build
curl http://localhost:3000/health
```

Expected: health endpoint returns JSON `{"ok": true}` or equivalent healthy response.

## 4) Core runtime requirements

- Docker Engine + Docker Compose
- Linux/macOS shell environment
- Optional for dev workflow: Node.js 20+, npm, Python 3.10+

For complete setup options (minimal/no-cost/full production-like), see **[docs/INSTALL_FULL.md](docs/INSTALL_FULL.md)**.

## 5) Tenant model and required headers

Most tenant-scoped routes require:

- `x-api-key: <TENANT_API_KEY>`
- `x-tenant-id: <tenant_id>`

Typical functional domains:

- Commerce: `/products`, `/cart`, `/orders`
- Admin: `/admin/health`, `/admin/billing`, `/admin/audit/*`
- Privacy: `/privacy/consent`, `/privacy/dsr`
- Integrations: `/auth/tiktok/*`, `/webhook/tiktok`, `/line/*`
- Realtime: `/ws`

Canonical route implementations live in `app/src/routes/`.

## 6) Full documentation map

### Essential manuals
- **Installation (full detail):** [docs/INSTALL_FULL.md](docs/INSTALL_FULL.md)
- User Manual (EN): [docs/user_manual_en.md](docs/user_manual_en.md)
- User Manual (TH): [docs/user_manual_th.md](docs/user_manual_th.md)
- Admin Manual (EN): [docs/admin_manual_en.md](docs/admin_manual_en.md)
- Admin Manual (TH): [docs/admin_manual_th.md](docs/admin_manual_th.md)
- Install Manual (EN): [docs/install_manual_en.md](docs/install_manual_en.md)
- Install Manual (TH): [docs/install_manual_th.md](docs/install_manual_th.md)

### Planning / product docs
- **Proposal (full detail):** [docs/PROPOSAL_FULL.md](docs/PROPOSAL_FULL.md)
- Blueprint (EN): [docs/blueprint_en.md](docs/blueprint_en.md)
- Blueprint (TH): [docs/blueprint_th.md](docs/blueprint_th.md)
- Roadmap (EN): [docs/roadmaps_en.md](docs/roadmaps_en.md)
- Roadmap (TH): [docs/roadmaps_th.md](docs/roadmaps_th.md)
- Presentation (EN): [docs/presentation_en.md](docs/presentation_en.md)
- Presentation (TH): [docs/presentation_th.md](docs/presentation_th.md)

### Operations / technical references
- Repo structure: [docs/REPO_STRUCTURE.md](docs/REPO_STRUCTURE.md)
- OpenAPI reference: [docs/openapi.yaml](docs/openapi.yaml)
- Existing docs bundle: [docs/MANUAL.md](docs/MANUAL.md), [docs/ADMIN.md](docs/ADMIN.md), [docs/USER.md](docs/USER.md)

### Archived/readme redirects
- [docs/readme_en.md](docs/readme_en.md)
- [docs/readme_th.md](docs/readme_th.md)
- [docs/readme_en_redirect.md](docs/readme_en_redirect.md)
- [docs/readme_th_redirect.md](docs/readme_th_redirect.md)

## 7) GitHub community files kept at repository root

To keep GitHub-native discovery and security workflows intact, these remain at root:

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [Repository README](README.md)
- [License](LICENSE)

Localized variants are in `docs/`.

## 8) Recommended next steps

1. Complete environment secrets in `.env`.
2. Start stack and verify `/health` + key tenant routes.
3. Read **INSTALL_FULL** and **PROPOSAL_FULL** to choose rollout strategy.
4. Use manuals in `docs/` for operator and admin onboarding.
