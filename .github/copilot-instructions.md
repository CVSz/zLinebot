**copilot-instructions.md**  
**Master Meta Full Final Release – End-to-End Guide for zLinebot**  
**Version**: 1.0 (Final Release)  
**Repository**: https://github.com/CVSz/zLinebot  
**Date**: 02 April 2026  
**Status**: Production-Ready Master Meta Reference for AI Copilot / Developer Agents  

---

### 1. Purpose of This Document

This is the authoritative, master-meta instruction set for any AI Copilot (GitHub Copilot, Claude, Grok, Cursor, etc.) tasked with understanding, extending, refactoring, debugging, or maintaining the **zLinebot** codebase. It provides a complete end-to-end deep-dive scan of the repository, integrates industry-standard LINE Bot best practices, and defines precise conventions, architecture rules, and operational workflows to ensure all future changes remain consistent with the platform’s AI-first, cloud-native, full-stack design.

Use this file as the primary system prompt / project context when generating code, reviewing PRs, or orchestrating CI/CD.

---

### 2. Repository Overview & Strategic Vision

**zLinebot** is not a simple chatbot. It is a **full-stack AI-native platform** with LINE Messaging as the primary conversational frontend, backed by:

- TypeScript/Node.js backend (domain-driven modules)
- Python ML services and pipelines
- Real-time stream processing (Flink)
- Data warehouse & feature store
- Cloud-native infrastructure (Docker, Kubernetes, Cloudflare Workers, Terraform, Istio)
- Web3 smart contracts
- Admin dashboard (React/Vite) and React Native mobile companion

**Core value proposition**: Deliver intelligent, personalized, scalable experiences through LINE while maintaining enterprise-grade security, privacy (PDPA-compliant), and observability.

**Current repository state** (as of last commit 02 Apr 2026):
- Primary language: TypeScript (72.7 %)
- Multi-language support: Python (ML), Shell, JavaScript (Workers), Java (ancillary)
- License: MIT
- Architecture: Modular monolith with clear domain boundaries and future micro-services path via Kubernetes

---

### 3. Complete Repository Structure (Deep-Dive Scan)

```
zLinebot/
├── app/                  # Core TypeScript backend (Express-like)
│   └── src/
│       ├── line/         # LINE Bot core (webhook, handler, flex)
│       ├── ai/           # LLM / AGI agents
│       ├── rl/           # Reinforcement learning & ranking
│       ├── events/       # Event sourcing & domain events
│       ├── queue/        # Background job & async processing
│       ├── privacy/      # PDPA, consent, data minimization
│       ├── security/     # Auth, middleware, signature verification
│       ├── db.ts         # Prisma / SQL connection
│       ├── main.ts       # Application bootstrap
│       └── ... (domain modules: identity, org, compliance, etc.)
├── cloudflare/           # Edge Workers (primary LINE webhook ingress)
│   ├── worker.js
│   ├── router.js
│   └── deploy.sh
├── ml/                   # Python ML services, training pipelines, model serving
├── db/                   # SQL schemas & migrations (domain-partitioned)
├── warehouse/            # Analytics & feature store assets
├── flink/                # Apache Flink stream jobs
├── k8s/                  # Kubernetes manifests & Helm charts
├── infra/                # Terraform infrastructure-as-code
├── docker/               # Dockerfiles & multi-stage builds
├── admin/                # React/Vite admin dashboard
├── mobile/               # React Native mobile app
├── contracts/            # Solidity Web3 smart contracts
├── scripts/              # Orchestration & install scripts
├── docs/                 # All manuals, OpenAPI, roadmaps (bilingual EN/TH)
├── .github/              # Workflows (CI/CD master meta pipeline already present)
├── install_*.sh          # Tiered installation (base → full → ultimate)
└── zlinebot-master-orchestrator.sh
```

**Key observation**: The LINE Bot layer is deliberately isolated in `app/src/line/` and fronted by Cloudflare Workers for ultra-low latency and DDoS protection.

---

### 4. LINE Bot Deep-Dive & Official Best-Practice Integration

#### 4.1 Current Implementation Summary
- **Ingress**: Cloudflare Worker (`cloudflare/worker.js`) → forwards verified requests to `app/src/line/webhook.ts`
- **Core modules** (`app/src/line/`):
  - `webhook.ts` – Signature verification, event parsing, 200 OK response within 3 seconds
  - `handler.ts` – Event routing (message, follow, unfollow, postback, beacon, etc.)
  - `flex.ts` – Rich Flex Message construction
  - `index.ts` – Public API for the rest of the application

#### 4.2 Mandatory LINE Bot Best Practices (to be enforced by Copilot)

| Category                  | Best Practice Requirement                                                                 | Implementation Location / Action |
|---------------------------|-------------------------------------------------------------------------------------------|----------------------------------|
| **Security**              | Always verify `X-Line-Signature` with HMAC-SHA256 (channel secret). Reject invalid signatures with 400. Rotate secrets quarterly. | `webhook.ts` + `security/` middleware |
| **Performance**           | Return HTTP 200 within **3 seconds**. Offload heavy logic to `queue/` or async workers. | Use `queue/` module for any AI/ML calls |
| **Event Handling**        | Support all official event types. Use `replyToken` for immediate replies; `push` for follow-ups. | `handler.ts` – exhaustive switch on `event.type` |
| **Rich Messaging**        | Prefer Flex Messages + Quick Replies + Buttons for UX. Limit text replies to < 5 segments per response. | `flex.ts` – maintain reusable templates |
| **Scalability**           | Never block the webhook thread. Use Redis-backed queue for personalization, RL ranking, or LLM calls. | Integrate `queue/` + Redis |
| **Privacy & Compliance**  | Log only anonymized event metadata. Store user profiles with explicit consent flags (PDPA). Implement data deletion endpoint. | `privacy/` module + consent checks in `handler.ts` |
| **Error Resilience**      | Implement dead-letter queue for failed events. Exponential backoff for LINE API calls. Circuit breaker for external services. | `events/` + `queue/` |
| **Testing**               | Unit tests for every event type + integration tests with LINE Simulator. Mock `@line/bot-sdk` where used. | Add to existing CI pipeline |
| **Monitoring**            | Emit structured logs (JSON) with trace ID, userId (anonymized), event type. Integrate with Cloudflare / Kubernetes observability. | Use OpenTelemetry in `middleware/` |
| **Rate Limiting**         | Respect LINE API quotas. Implement per-user and per-channel throttling. | `middleware/` + Redis counters |
| **Multilingual**          | Detect language from user profile or message. Default to Thai/English fallback. | `ai/` or `services/` localization layer |

**Copilot Rule**: When generating or modifying any code inside `app/src/line/`, **automatically** apply the table above unless explicitly overridden in a ticket.

---

### 5. Master Meta Development Conventions (Copilot Enforced)

1. **Code Style**  
   - TypeScript strict mode + ESLint + Prettier (`.ruff.toml` for Python parity).  
   - Domain-Driven Design: every feature lives in its own module under `src/`.  
   - All public exports must be documented with JSDoc + Thai/English bilingual comments where appropriate.

2. **Git & CI/CD**  
   - Use conventional commits.  
   - Every PR must pass the master-meta CI/CD pipeline (`.github/workflows/` – already contains full-source validation).  
   - Update `docs/` and OpenAPI spec (`docs/openapi.yaml`) on any API change.

3. **Environment Management**  
   - Never commit secrets. Use `.env.example` as single source of truth.  
   - Validate all required variables at startup (`main.ts`).

4. **Testing & Quality Gates**  
   - 80 %+ coverage target for `line/` and `ai/` modules.  
   - Security scans (Snyk / Dependabot) mandatory.

5. **Documentation Discipline**  
   - Every new feature → update `docs/REPO_STRUCTURE.md`, `docs/PROPOSAL_FULL.md`, and relevant manual.

---

### 6. End-to-End Operational Workflows

**Local Development**  
```bash
./install.sh          # base
./install_full.sh     # + ML + DB
./install_ultimate.sh # + K8s + Web3
docker compose up -d
```

**Production Deployment**  
1. Cloudflare Worker deploy → `cloudflare/deploy.sh`  
2. Backend → Kubernetes (k8s/) or Docker Swarm  
3. ML models → separate Python services behind Istio  
4. Monitoring → Cloudflare + Prometheus + Grafana (infra/)

**LINE Bot Channel Setup** (one-time)  
- Create LINE Messaging API channel  
- Set webhook URL to Cloudflare Worker route  
- Store `CHANNEL_SECRET` and `CHANNEL_ACCESS_TOKEN` in Kubernetes secrets / Cloudflare Variables

---

### 7. Copilot Operational Directives (Always Active)

- **Context Priority**: Architecture > Security > Privacy > Performance > UX  
- **Language**: Respond in English unless the user explicitly requests Thai.  
- **Output Format**: When suggesting code changes, always provide:  
  1. File path  
  2. Diff / full function  
  3. Rationale tied to best-practice table  
  4. Impact on other modules  
- **Refactoring Rule**: Never break the LINE webhook response-time contract.  
- **Future-Proofing**: All new features must be compatible with planned LLM Agents and federated learning roadmap (see `docs/roadmaps_*.md`).

---

### 8. Final Release Checklist (Copilot Validation)

Before any merge or release:
- [ ] LINE webhook signature verification active and tested  
- [ ] All events handled with proper queue offloading  
- [ ] Flex Message templates updated per new UX requirements  
- [ ] Privacy consent flows validated  
- [ ] CI/CD pipeline green  
- [ ] `docs/` synchronized  
- [ ] This `copilot-instructions.md` updated if architecture changes

---

**This document is the single source of truth for all AI-assisted work on zLinebot.**  
Any deviation must be explicitly approved via GitHub issue referencing this file.

**End of Master Meta Full Final Release**  
Ready for immediate use by any Copilot instance.
