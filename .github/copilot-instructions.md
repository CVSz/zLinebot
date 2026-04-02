# copilot-instructions.md
**Master Meta Full Final Release – Complete Full-Detail Edition**  
**Repository:** https://github.com/CVSz/zLinebot  
**Version:** 1.0.0-final (April 2026)  
**Purpose:** Official, exhaustive instruction set for GitHub Copilot, Cursor, Claude, or any AI coding assistant operating inside this workspace.  

This document is the single source of truth. All AI-generated code, refactors, features, documentation updates, or infrastructure changes **must** conform to these rules without exception.

---

## 1. Project Identity & Core Mission

**ZLineBot** is a **multi-tenant commerce + conversational AI platform** with native LINE and TikTok integration.  

It provides:
- RESTful commerce APIs (products, cart, orders, billing)
- LINE webhook bot with full signature verification
- TikTok OAuth, webhook, Shop control panel, and automated showcase-to-video generation
- Real-time metrics via WebSocket (`/ws`)
- Privacy/DSR compliance suite (consent, access, delete, rectify)
- Tenant isolation enforced by `x-api-key` + `x-tenant-id` headers
- Production-grade deployment paths (Docker Compose → Kubernetes → Cloudflare + Fly.io)

**Non-negotiable principles** (apply to every suggestion):
1. **Tenant isolation** is sacred — never leak data across tenants.
2. **Privacy & compliance** (GDPR/PDPA) takes precedence over convenience.
3. **Security** (signature verification, rate limiting, audit logging) is mandatory.
4. **Modularity & backward compatibility** must be preserved.
5. **Documentation must be updated** whenever behavior changes.

---

## 2. Repository Structure (Authoritative Map)
```bash
zLinebot/
├── app/                  # ← Primary backend (Express + TypeScript) – all new API logic here
├── admin/                # ← React + Vite admin dashboard
├── mobile/               # ← React Native sample modules
├── db/                   # ← PostgreSQL schemas & migrations (domain-separated)
├── docs/                 # ← All manuals, OpenAPI, blueprints
├── docker/               # ← Dockerfile, compose files
├── k8s/                  # ← Kubernetes manifests
├── infra/                # ← Terraform / provisioning
├── cloudflare/           # ← Workers & tunnel configs
├── cloud/worker/         # ← Cloudflare Worker scripts
├── flink/                # ← Streaming jobs
├── ml/                   # ← ML ranking & simulation modules
├── scripts/              # ← install.sh, orchestrators, lint scripts
├── nginx/                # ← Reverse-proxy configs
├── warehouse/            # ← ClickHouse & data-warehouse assets
├── .env.example          # ← Must remain complete and current
├── docker-compose.yml
├── zlinebot-meta-orchestrator.sh   # ← Meta-level orchestration (use as reference)
├── CONTRIBUTING.md       # ← Mandatory PR rules
└── docs/REPO_STRUCTURE.md # ← Always consult before structural changes
```
**Rule:** Never create new top-level directories. All new code belongs in the appropriate domain folder listed above.

---

## 3. Technology Stack & Version Policy

| Layer              | Technology                          | Constraint / Rule                                      |
|--------------------|-------------------------------------|--------------------------------------------------------|
| Backend            | Node.js + Express + TypeScript      | Strict TS; no `any`; use interfaces & zod validation   |
| Admin UI           | React 18 + Vite + TypeScript        | Functional components, TanStack Query, Tailwind        |
| Database           | PostgreSQL + Prisma / raw SQL       | Schema changes only via db/migrations                  |
| Cache / Session    | Redis                               | Keys prefixed with `tenant:{tenant_id}:`               |
| Realtime           | WebSocket (`/ws`)                   | Only `metrics` message type; JSON only                 |
| Streaming          | Apache Flink (flink/)               | Java-based jobs only                                   |
| ML / Ranking       | Python (ml/)                        | Ruff linting enforced                                  |
| Deployment         | Docker → Kubernetes → Cloudflare    | Always update corresponding manifests                  |
| Linting            | ESLint + Prettier (TS/JS)           | .ruff.toml for Python; ShellCheck for scripts          |

**Dependency rule:** Never upgrade major versions without updating `install_ultimate.sh` and all deployment manifests simultaneously.

---

## 4. Coding & Architectural Standards

### 4.1 Backend (app/)
- All routes **must** pass through tenant middleware.
- Use `express.Router()` per domain (`products.router.ts`, `privacy.router.ts`, etc.).
- Request validation: Zod schemas (never inline).
- Error handling: Centralized `errorHandler` with tenant-safe logging.
- Webhook security: `verifyLineSignature` and `verifyTikTokSignature` **always** applied.
- Real-time: Emit only via `wsServer.emit('metrics', payload)`.

### 4.2 Multi-Tenancy
```ts
// REQUIRED pattern
const tenantId = req.headers['x-tenant-id'];
const apiKey   = req.headers['x-api-key'];

// Validate both before any database operation
if (!tenantId || !apiKey) throw new UnauthorizedError();
```

### 4.3 Privacy & DSR
Every user-facing operation **must** check consent status via `/privacy/consent/:userId`.  
DSR endpoints (`POST /privacy/dsr`) are audit-logged and irreversible.

### 4.4 TypeScript Rules
- `strict: true`, `noImplicitAny: true`
- Prefer `interface` over `type` for public contracts
- Export only what is consumed by other modules
- All public APIs documented with JSDoc + OpenAPI tags

### 4.5 Commit & PR Discipline
- Use Conventional Commits exactly as shown in CONTRIBUTING.md
- Every PR **must**:
  - Update relevant manual (EN/TH)
  - Include test evidence
  - Reference tenant-safety and privacy impact
  - Pass full CI (lint + type-check + health check)

---

## 5. AI Assistant Operational Rules (Meta Layer)

When the user (or Copilot) requests any change:

1. **First** consult `docs/REPO_STRUCTURE.md`, `blueprint_en.md`, and this file.
2. **Second** verify against existing modules — never duplicate functionality.
3. **Third** generate code that is:
   - Tenant-isolated
   - Privacy-compliant
   - Fully typed
   - Documented
   - Testable via `docker compose up`
4. **Finally** output:
   - The code diff
   - Updated documentation section
   - Required environment variables (if any)
   - Migration steps (if schema changes)

**Forbidden actions:**
- Suggest code that bypasses tenant middleware
- Use `console.log` in production paths
- Hard-code secrets or tenant IDs
- Create routes without corresponding OpenAPI documentation
- Ignore Thai/English dual-language manual updates

---

## 6. Feature Implementation Blueprint

**New commerce endpoint** → `app/routes/products.router.ts` + `db/migrations` + update `docs/openapi.yaml`  
**New LINE intent** → Add to conversational AI path in `app/services/line-intent.ts` + update user_manual  
**New TikTok automation** → Extend `admin/tiktok-shop/` + `ml/` ranking module  
**Realtime metric** → Add field to `/ws` payload + update admin dashboard  

**Always** run the following validation after changes:
```bash
docker compose down && docker compose up -d --build
curl http://localhost:3000/health
# Then test tenant isolation with two different x-tenant-id values
```

---

## 7. Final Authority Statement

This `copilot-instructions.md` is the **master meta** document.  
It supersedes all previous instructions, comments, or ad-hoc guidelines.  

Any future update to this file **must** be versioned in the header and accompanied by a full repository-wide review using `zlinebot-meta-orchestrator.sh`.

**Copilot / AI Assistant:**  
You are now fully initialized with the complete, final, production-ready instruction set for zLinebot.  
Proceed with absolute precision, professionalism, and unwavering adherence to every rule above.

---
**End of Master Meta Full Final Release**  
