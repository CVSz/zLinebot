> **Documentation Update (2026-04-02):** For the latest repository-wide feature analysis, see `docs/FEATURE_DEEP_IMPACT_DIVE_2026-04.md`.

# 🚀 zLinebot

### AI-Native Super Platform for Messaging, Intelligence, and Distributed Systems
**From LINE Bot → AI → ML → Data → Web3 → Cloud Infrastructure (All-in-One Ecosystem)**

---

<p align="center">
  <img src="https://img.shields.io/badge/AI-Native-blueviolet" />
  <img src="https://img.shields.io/badge/Fullstack-Platform-black" />
  <img src="https://img.shields.io/badge/Node.js-TypeScript-green" />
  <img src="https://img.shields.io/badge/Python-ML-yellow" />
  <img src="https://img.shields.io/badge/Kubernetes-Cloud--Native-blue" />
  <img src="https://img.shields.io/badge/Cloudflare-Edge-orange" />
  <img src="https://img.shields.io/badge/Web3-SmartContracts-black" />
  <img src="https://img.shields.io/badge/Status-Production--Ready-success" />
  <img src="https://img.shields.io/badge/License-MIT-brightgreen" />
</p>

---

> **zLinebot is not just a chatbot.**
> It is a **full-stack AI-native platform** that unifies messaging, machine learning, data infrastructure, and cloud systems into one scalable architecture.

---

## ⚡ Executive Summary

zLinebot is designed as an **AI-first distributed system**:
- LINE is the user interaction surface.
- Backend services orchestrate workflows and APIs.
- ML services power ranking, personalization, and automation.
- Cloud-native infrastructure enables scale and reliability.

---

## 🧠 ภาพรวมระบบ

zLinebot คือแพลตฟอร์ม AI แบบ Full-stack ที่รวม:

- 🤖 LINE Bot (Frontend Interface)
- ⚙️ Backend (Node.js + TypeScript)
- 🧠 Machine Learning (Python)
- 📊 Data Platform (SQL + Feature Store + Warehouse)
- 🌐 Cloud-native Infrastructure (Docker, Kubernetes, Cloudflare)
- ⛓ Web3 (Smart Contracts)

---

## 🏗 System Architecture

> Mermaid ด้านล่างปรับให้เป็น GitHub-safe syntax (text-only labels) เพื่อเลี่ยง parse error.

```mermaid
flowchart TD

User[User] --> LINE[LINE Messaging API]
LINE --> EDGE[Cloudflare Edge]
EDGE --> APP[Backend Services Node.js TS]

APP --> DB[Database Layer]
APP --> API[External APIs]

APP --> ML[ML Services Python]
ML --> MODEL[Models RL Ranking Anomaly]

APP --> STREAM[Flink Stream]
STREAM --> WH[Data Warehouse]

APP --> ADMIN[Admin Dashboard]
APP --> MOBILE[Mobile App]
APP --> WEB3[Smart Contracts]

subgraph INFRA
DOCKER[Docker]
K8S[Kubernetes]
MESH[Service Mesh]
TF[Terraform]
end

APP --> DOCKER
DOCKER --> K8S
K8S --> MESH
K8S --> TF
```

---

## 🛠 Technology Stack

### Backend
- Node.js (TypeScript) → `app/`
- Cloudflare Workers → `cloudflare/`

### Frontend
- Admin Dashboard (Vite/React) → `admin/`
- Mobile App (React Native) → `mobile/`

### AI / ML
- Python ML services → `ml/`
- RL, ranking, federated learning, explainability

### Data
- SQL schemas → `db/`
- Warehouse assets → `warehouse/`
- Stream processing jobs → `flink/`

### Infrastructure
- Docker / Compose → `docker/`
- Kubernetes manifests → `k8s/`
- Terraform → `infra/`
- Nginx gateway → `nginx/`

### Web3
- Solidity contracts → `contracts/`

---

## 📁 Project Structure

```text
zLinebot/
├── app/            # Backend services (Node.js / TS)
├── admin/          # Dashboard (Vite/React)
├── mobile/         # Mobile app (React Native)
├── ml/             # AI / ML pipelines
├── db/             # Database schemas
├── warehouse/      # Analytics warehouse
├── flink/          # Stream processing
├── contracts/      # Smart contracts
├── cloudflare/     # Edge workers
├── cloud/          # Worker services
├── docker/         # Containers
├── k8s/            # Kubernetes
├── infra/          # Terraform
├── scripts/        # Automation
├── docs/           # Documentation
└── nginx/          # Gateway
```

---

## ⚡ Key Capabilities

- Intelligent LINE chatbot interface
- AI-driven personalization and decision systems
- Distributed microservices backend
- Edge-to-cloud execution model
- Real-time and batch data processing
- Privacy-first ML direction
- Web3 integration layer

---

## 🎯 Use Cases

- LINE AI Chatbot
- Recommendation System
- Automation Platform
- AI SaaS
- Web3 + AI Integration

---


## 🔐 SaaS Secure Deployment (zlinebot.zeaz.dev)

1. Generate a production `.env` with strong randomized secrets and domain-aware callback URLs:

```bash
bash scripts/generate-secrets.sh zlinebot.zeaz.dev
```

2. Start the full production stack (API, admin, worker, postgres, redis, nginx):

```bash
bash scripts/deploy.sh zlinebot.zeaz.dev
```

3. Optional SSL provisioning on host:

```bash
sudo certbot --nginx -d zlinebot.zeaz.dev
```

Notes:
- `.env` is written with `chmod 600` for better secret hygiene.
- `AUTOMATION_WORKER_MODE=external` runs queue workers as a dedicated service for SaaS-scale workloads.

---

## 🚀 Deployment Options

- Local development (Docker Compose)
- Cloud deployment (Cloudflare / self-hosted VM/Kubernetes)
- Kubernetes cluster (production scale)
- Edge deployment (Cloudflare Workers)

### ☁️ Automated Cloudflare DNS Configuration

This repository now includes automated Cloudflare DNS configuration:

```bash
CF_API_TOKEN=<token> CF_ZONE_ID=<zone_id> ./scripts/configure_cloudflare.sh infra/cloudflare_dns.yaml
```

For CI/CD automation, use `.github/workflows/cloudflare-config.yml` with GitHub secrets `CF_API_TOKEN` and `CF_ZONE_ID`.

### 🧩 Zero Trust full automation for `*.zeaz.dev` + `zlinebot.zeaz.dev`

This repository includes one-step automation for Tunnel ingress + DNS records:

```bash
CLOUDFLARE_API_TOKEN=<token> \
CLOUDFLARE_ACCOUNT_ID=<account_id> \
CLOUDFLARE_ZONE_ID=<zone_id> \
CLOUDFLARE_TUNNEL_ID=<tunnel_id> \
./scripts/configure_cloudflare_zero_trust_full.sh
```

Optional overrides:
- `CLOUDFLARE_BASE_DOMAIN` (default `zeaz.dev`)
- `CLOUDFLARE_PRIMARY_HOSTNAME` (default `zlinebot.<base-domain>`)
- `CLOUDFLARE_WILDCARD_HOSTNAME` (default `*.<base-domain>`)
- `CLOUDFLARE_TUNNEL_SERVICE_URL` (default `http://app:3000`)
- `DRY_RUN=true` for preview mode.

### 🔐 Cloudflare Zero Trust Tunnel Token (API)

You can fetch and write the tunnel token directly from the Zero Trust API:

```bash
CLOUDFLARE_API_TOKEN=<token> \
CLOUDFLARE_ACCOUNT_ID=<account_id> \
CLOUDFLARE_TUNNEL_ID=<tunnel_id> \
./scripts/fetch_cloudflare_tunnel_token.sh .env
```

This updates `CLOUDFLARE_TUNNEL_TOKEN` in `.env` for `docker compose`.

---

## 🔮 Roadmap

- LLM / AI Agent integration
- Real-time personalization
- Privacy-preserving AI (federated + FHE-ready)
- Multi-region distributed deployment
- Tokenized AI ecosystem

---

## 🤝 Contributing

Contributions are welcome across backend, ML, infrastructure, and docs.

- Contribution guide: `docs/CONTRIBUTING_th.md`
- Security policy: `SECURITY.md`

---

## 📄 License

MIT License

---

## 🌍 Vision

> Build an AI-native infrastructure layer where messaging, intelligence, and distributed systems converge into one platform.
---

## 🔎 Deep Impact Dive (April 2026)

A full cross-repository feature impact analysis is now available at:

- `docs/FEATURE_DEEP_IMPACT_DIVE_2026-04.md`

This analysis maps capabilities to business and operational outcomes, risk profile, and recommended high-ROI roadmap actions.

