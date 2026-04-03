**Status:** Master Meta Full Final Release – Version 2.0  
**Date:** 03 April 2026  
**Repository:** https://github.com/CVSz/zLinebot  
**Purpose of this Update:** This document has been comprehensively revised to serve as the definitive, authoritative, and complete instruction set for all AI Copilot agents and contributors. It now fully incorporates every feature, component, and architectural element of the zLinebot platform, establishing the Master Meta Full Final Release.

---

# zLinebot AI Copilot Instructions – Master Meta Full Final Release

**Version:** 2.0 (Master Meta Full Final Release)  
**Repository:** [CVSz/zLinebot](https://github.com/CVSz/zLinebot)  
**Date:** 03 April 2026  
**Status:** Production-Ready, Comprehensive Master Reference

---

## 1. Purpose

This document constitutes the **single authoritative instruction set** for all AI Copilot agents, developers, and automated systems working on **zLinebot**. It provides exhaustive guidance on:

- The complete platform vision and every implemented feature.
- Architectural principles, system workflows, and component interactions.
- Security, privacy, observability, deployment, and scalability requirements.
- Precise code-generation, refactoring, debugging, and documentation standards.

All future contributions, code generation, and modifications **must** strictly adhere to these guidelines. This version represents the Master Meta Full Final Release, consolidating all features across messaging, AI/ML, data infrastructure, Web3, cloud-native operations, and governance layers.

---

## 2. Project Vision & Full Feature Overview

**zLinebot** is a full-stack AI-native platform that unifies LINE Messaging as the primary user surface with advanced machine-learning pipelines, real-time data processing, Web3 integration, and cloud-native infrastructure. It functions as an intelligent commerce and automation ecosystem rather than a conventional chatbot.

**Core Capabilities (Master Feature Inventory):**

**A. Conversational & Commerce Core**  
- LINE webhook handling and message orchestration (Cloudflare Workers + TypeScript backend).  
- Product, order, cart, and lifecycle management with PromptPay/Stripe integration.  
- Intelligent conversation-to-transaction flows.

**B. AI Decisioning & Recommendation**  
- Recommendation/ranking services (vector search, hybrid retrieval).  
- Contextual bandit, reinforcement learning (RL), reward modeling, and IPS/DR evaluation.  
- Transformer/two-tower/foundation-model helpers.  
- Explainability, policy updates, and counterfactual evaluation.  
- Federated learning and privacy-preserving ML (FHE-ready pathways).

**C. Automation & Agentic Layer**  
- Multi-agent modules for pricing, sales, risk, economy, negotiation, supply, policy, SLA, and kill-switch management.  
- Automation compiler, plugin/runner pipelines, scheduler, and queue workers.

**D. Data, Features & Streaming**  
- Comprehensive SQL schemas (events, features, billing, audit, privacy, RLHF).  
- Feature store synchronization and data warehouse.  
- Apache Flink stream-processing jobs for feature joins and materialization.  
- Kafka producers/consumers for real-time pipelines.

**E. Security, Privacy & Trust**  
- Zero-trust architecture, tenant isolation, and runtime guardrails.  
- PDPA/GDPR compliance, DSR handling, audit logging, and evidence generation.  
- HMAC-SHA256 signature verification, payload sanitization, and secret rotation.

**F. Admin, Mobile & UX Surfaces**  
- React/Vite admin dashboard (dashboard, automations, logs, builder, billing, live monitoring).  
- React Native companion mobile application.

**G. Infrastructure & Delivery**  
- Docker / Docker Compose (multiple variants: full, observability-focused, blue-green).  
- Kubernetes + Istio manifests with autoscaling and service mesh.  
- Terraform infrastructure definitions and Cloudflare Workers edge routing.  
- Nginx API gateway and secure tunnel support.

**H. Web3 Integration**  
- Solidity smart contracts for tokenized economy, negotiation, causal modules, and loyalty mechanisms.

**I. Observability & Resilience**  
- OpenTelemetry distributed tracing, structured logging (Loki/ELK), Prometheus metrics, Jaeger tracing, and Grafana dashboards.  
- Self-healing scripts, circuit breakers, dead-letter queues, and SLA monitoring.

---

## 3. Repository Structure (Canonical)

```
zLinebot/
├── app/                  # TypeScript/Node.js backend services
├── admin/                # React/Vite admin dashboard
├── mobile/               # React Native mobile application
├── ml/                   # Python ML pipelines (RL, ranking, anomaly, federated)
├── db/                   # SQL schemas and migrations
├── warehouse/            # Analytics warehouse & feature store
├── flink/                # Apache Flink stream jobs
├── contracts/            # Solidity smart contracts
├── cloudflare/           # Edge Workers for LINE webhooks
├── cloud/                # Additional worker implementations
├── docker/               # Dockerfiles and Compose configurations
├── k8s/                  # Kubernetes + Istio manifests
├── infra/                # Terraform infrastructure as code
├── nginx/                # API gateway configurations
├── scripts/              # Deployment, secrets, watchdog, and automation scripts
├── docs/                 # Documentation (including FEATURE_DEEP_IMPACT_DIVE_2026-04.md)
├── .github/              # CI/CD workflows
├── SECURITY.md           # Security policies
└── zlinebot-master-orchestrator.sh
```

---

## 4. Architectural & System Design Principles

- **Edge-First Processing:** Cloudflare Workers handle LINE webhooks at the edge for minimal latency; return HTTP 200 within < 3 seconds.
- **Async ML Offload:** All heavy inference (ranking, RL, anomaly detection) occurs asynchronously via Redis/gRPC queues.
- **Domain-Driven Design:** Strict module boundaries with clear ownership.
- **Privacy by Design:** Anonymized logging, PDPA-compliant data handling, and federated learning readiness.
- **Zero-Trust & Resilience:** Mandatory mTLS, circuit breakers, dead-letter queues, and tenant isolation.
- **Observability-Native:** Every component must emit OpenTelemetry traces (including anonymized user ID and trace ID).
- **Future-Proofing:** Maintain compatibility with LLM agents, real-time personalization, multi-region deployment, and tokenized ecosystems.

---

## 5. Technology Stack & Component Guidelines

**Backend:** TypeScript/Node.js (strict mode), ESLint, Prettier.  
**ML Services:** Python pipelines with gRPC/protobuf preferred; REST fallback for development.  
**Infrastructure:** Docker, Kubernetes + Istio, Terraform, Cloudflare Workers, Nginx.  
**Data:** PostgreSQL/CockroachDB schemas, Apache Flink, Kafka, feature store.  
**Frontend:** React/Vite (admin), React Native (mobile).  
**Web3:** Solidity contracts in `contracts/`.  
**Observability:** OpenTelemetry, Prometheus, Grafana, Jaeger/Loki.

**Component-Specific Directives:**  
- Backend handlers must validate signatures and sanitize inputs.  
- ML services must implement dead-letter queues and fallback replies.  
- Web3 contracts must follow security best practices and include audit documentation.  
- Infrastructure manifests must support blue-green deployments and zero-downtime updates.

---

## 6. Security Framework

All layers enforce: Cloudflare WAF, HMAC-SHA256 verification, channel token validation, TLS 1.3/mTLS, payload sanitization, secret hygiene (chmod 600), and quarterly rotation. Compliance with PDPA/GDPR is mandatory; audit trails and DSR endpoints are required.

---

## 7. Deployment Strategies

- **Local:** Docker Compose + Cloudflared tunnel.  
- **Staging:** Cloudflare Workers (wrangler) with WAF and LINE simulator validation.  
- **Production:** Kubernetes + Istio, Terraform-provisioned, Cloudflare edge fronting, independent ML scaling, blue-green deployments.

---

## 8. Monitoring & Observability

- Edge: Cloudflare analytics.  
- Backend/ML/K8s: Prometheus + Grafana + Alertmanager.  
- Tracing/Logging: OpenTelemetry, Jaeger, Loki.  
- Alerts must cover SLA violations, security events, and synthetic LINE event validation.

---

## 9. Development & Code Quality Standards

- Conventional commits, strict TypeScript, full test coverage (unit + integration).  
- Secrets never committed; `.env.example` validation at startup.  
- Documentation and deep-impact analysis must be synchronized with every major change.  
- CI/CD gates: linting, security scans (CodeQL), and automated audits via `codex.sh audit`.

---

## 10. Copilot Operational Meta-Rules (Master Edition)

- **Priority Order:** Security → Privacy → Observability → Performance → Scalability → UX.  
- **Output Format:** Always specify file path, full diff or function, rationale, and business impact.  
- **Refactoring Rule:** Never degrade webhook SLA or introduce synchronous ML calls.  
- **Language:** English (unless explicitly requested otherwise).  
- **Vision Alignment:** Every change must advance the AI-native, privacy-first, cloud-native, and Web3-enabled ecosystem.

---

## 11. Master Meta Full Final Release Checklist (Evidence-Gated)

> **Rule:** checklist items can be marked complete only when linked evidence exists in code, tests, or generated reports.

- [ ] All features from Sections 2 and 3 fully implemented and documented (track in `docs/META_FULL_IMPLEMENT_ALL_FEATURES_2026-04-03.md`).  
- [ ] End-to-end observability (traces, metrics, logs) propagates across every layer (attach trace IDs + dashboard screenshots).  
- [ ] Security, privacy, and compliance controls verified (including PDPA audit evidence).  
- [ ] Web3 contracts audited and integrated (audit report required).  
- [ ] Deployment pipelines support zero-downtime, multi-environment, and multi-region scenarios (staging/prod rollout evidence required).  
- [ ] Monitoring dashboards and alerts validated with synthetic events (alert proof required).  
- [ ] Deep-impact analysis (`docs/FEATURE_DEEP_IMPACT_DIVE_2026-04.md`) cross-referenced and current.  
- [ ] CI/CD automated audit (`bash codex.sh audit`) passes with zero critical findings (attach report artifact).  
- [ ] All documentation synchronized and this Copilot instructions file updated to v2.0 Master Meta Full Final Release.

---

## 12. Final Release Complete Form (Master Meta v2.0)

**Release Name:** Master Meta Full Final Release  
**Version:** 2.0  
**Release Date:** 03 April 2026  
**Repository:** https://github.com/CVSz/zLinebot  
**Deep-Impact Reference:** `docs/FEATURE_DEEP_IMPACT_DIVE_2026-04.md`  
**Implementation Matrix:** `docs/META_FULL_IMPLEMENT_ALL_FEATURES_2026-04-03.md`  
**Automated Audit Command:** `bash codex.sh audit`

### Completion Declaration

The release is managed under an **evidence-gated complete form** process.  
The implementation matrix defines module-level completion, remaining gaps, and validation artifacts required before final production sign-off.

### Operational Acceptance Criteria

1. Security-first architecture and privacy-by-design controls are documented and testable.
2. Observability coverage is demonstrated across edge, services, queues, streaming, and infrastructure.
3. Deployment strategies support local, staging, and production with zero-downtime patterns.
4. Governance, compliance, and audit paths are represented in code, docs, and generated evidence.
5. Deep-impact analysis and Copilot operational rules are synchronized for execution.

### Sign-off Metadata

- **Status:** In Verification  
- **Instruction Authority:** `.github/copilot-instructions.md` (this file)  
- **Execution Guide:** `docs/FEATURE_DEEP_IMPACT_DIVE_2026-04.md`  
- **Implementation Guide:** `docs/META_FULL_IMPLEMENT_ALL_FEATURES_2026-04-03.md`  
- **Change Governance:** Conventional commits + CI/CD + automated audit gate

---
