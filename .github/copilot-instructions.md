# zLinebot AI Copilot Instructions – Master Reference

**Version:** 1.4 (Updated 2026-04-03 – Monitoring, Security, and Deployment Enhancements)
**Repository:** [CVSz/zLinebot](https://github.com/CVSz/zLinebot)
**Date:** 03 April 2026
**Status:** Production-Ready Master Reference

---

## 1. Purpose

This document is the **authoritative instruction set** for AI Copilot agents working on **zLinebot**, covering:

* Full deep-dive analysis of the repository
* ML services, LINE Bot security, deployment, and monitoring
* Best practices for code generation, refactoring, debugging, and observability

All future code contributions must comply with these guidelines.

---

## 2. Repository Overview

**zLinebot** features:

* **Frontend:** LINE Messaging API
* **Backend:** TypeScript/Node.js
* **ML Services:** Python pipelines (RL, ranking, anomaly detection, federated learning)
* **Infrastructure:** Docker, Kubernetes, Cloudflare Workers, Terraform, Istio
* **Edge Strategy:** Cloudflare Workers for low-latency webhook handling

---

## 3. Repository Structure

```text
zLinebot/
├── app/                  # TypeScript backend
├── cloudflare/           # Edge Workers for LINE webhook
├── cloud/                # Worker implementations
├── cloudflared/          # Secure tunnel scripts
├── ml/                   # Python ML pipelines
├── db/                   # SQL schemas and migrations
├── warehouse/            # Analytics and feature store
├── flink/                # Apache Flink jobs
├── k8s/                  # Kubernetes + Istio manifests
├── infra/                # Terraform infrastructure
├── docker/               # Dockerfiles/docker-compose
├── nginx/                # API gateway configs
├── admin/                # React/Vite admin dashboard
├── mobile/               # React Native companion app
├── contracts/            # Solidity smart contracts
├── scripts/              # Orchestration scripts
├── docs/                 # Documentation
├── .github/              # CI/CD workflows
├── SECURITY.md           # Security policies
├── install_*.sh          # Installation scripts
└── zlinebot-master-orchestrator.sh
```

**Deployment Insight:** Cloudflare Workers handle webhook requests at the edge. Backend and ML services scale independently via Docker/Kubernetes.

---

## 4. ML Services Interaction

**Workflow:**

1. **Ingress:** LINE message → Cloudflare Worker → backend (`app/`)
2. **Event Routing:** Backend parses event → determines ML enrichment
3. **Async Offload:** Heavy ML inference via Redis/gRPC queues (never synchronous)
4. **ML Processing:** Python pipelines generate predictions (ranking, anomaly alerts)
5. **Response Generation:** Backend formats Flex Message or text reply → LINE API
6. **Observability:** OpenTelemetry traces with trace ID and anonymized user ID

**Best Practices:**

* Prefer gRPC in Kubernetes; REST fallback for local dev
* Use protobuf for feature vectors
* Scale ML services independently
* Implement dead-letter queues and fallback LINE replies
* Include unit and integration tests for ML → LINE round-trip

---

## 5. Security Framework

| Layer         | Control                                       | Location                  | Rule                              |
| ------------- | --------------------------------------------- | ------------------------- | --------------------------------- |
| Edge          | Cloudflare WAF, rate limiting, bot management | `cloudflare/`             | Always active                     |
| Signature     | HMAC-SHA256 verification                      | Worker + backend          | Reject invalid requests           |
| Auth          | Channel token validation                      | `app/src/security/`       | Validate every request            |
| Privacy       | PDPA compliance                               | `privacy/`                | Log anonymized; delete on request |
| Transport     | TLS 1.3, Istio mTLS                           | `k8s/`                    | Mandatory in production           |
| Input         | Payload sanitization                          | `app/src/line/handler.ts` | Reject malformed events           |
| Secrets       | K8s/Cloudflare secrets                        | `.env.example`            | Validate at startup               |
| Observability | Structured logs & traces                      | All layers                | Include trace IDs                 |
| Resilience    | Circuit breakers, DLQs                        | Middleware                | Prevent cascading failures        |
| Compliance    | Secret rotation, PDPA audit                   | CI/CD + `SECURITY.md`     | Document each release             |

**Extra Directives:** Rotate secrets quarterly, enforce rate limits, and filter ML calls for privacy.

---

## 6. Deployment Strategies

**Tiers:**

1. **Local Dev:** Docker Compose, Cloudflared tunnel, webhook testing
2. **Staging:** Cloudflare Worker via `wrangler`, WAF enabled, validate with LINE simulator
3. **Production:** Kubernetes + Istio, Terraform, Cloudflare Worker edge, independent ML scaling

**Best Practices:**

* HTTPS webhook with TLS 1.2+
* Return 200 OK <3s
* Structured observability (logs, traces)
* Separate staging/production environments

---

## 7. Monitoring Tools

**Layers:**

* **Edge:** Cloudflare observability (latency, errors)
* **Backend:** OpenTelemetry + structured logs
* **ML:** Prometheus metrics
* **Kubernetes:** Prometheus + Grafana + Alertmanager
* **Logging/Tracing:** ELK/Loki, Jaeger

**Guidelines:**

* Validate dashboards in staging
* Set alerts for SLA/security events
* Include synthetic LINE events in CI/CD validation

---

## 8. Development Conventions

* TypeScript strict mode + ESLint + Prettier
* Domain-driven design module boundaries
* Conventional commits & CI/CD gates
* Secrets never committed; validate `.env`
* Unit/integration tests in `line/` and `ml/`
* Update documentation with API or feature changes

---

## 9. Copilot Operational Directives

* **Context Priority:** Monitoring → Deployment → Security → ML → Privacy → Performance → UX
* **Language:** English unless requested
* **Change Suggestion:** Always include file path, diff/full function, rationale, impact
* **Refactoring:** Never break webhook SLA
* **Future-Proofing:** Maintain LLM/federated learning compatibility

---

## 10. Final Release Checklist

* [ ] Monitoring instrumentation in place
* [ ] End-to-end metrics/logs/traces propagate
* [ ] Monitoring stack validated
* [ ] Alerts cover SLA/security events
* [ ] Documentation synchronized
* [ ] Copilot instructions updated

---
