> **Documentation Update (2026-04-02):** For the latest repository-wide feature analysis, see `docs/FEATURE_DEEP_IMPACT_DIVE_2026-04.md`.

# 🧠 zLinebot System Design

## Full System Flow

```text
User → LINE → Cloudflare Edge → Backend API Gateway
→ Service Layer → ML Layer → Data Layer → Infrastructure Layer
```

## Layer Breakdown

### 1) API Layer (Node.js)
- LINE webhook handler.
- Authentication and rate limit.
- API routing and request shaping.

### 2) Service Layer
- User service.
- Messaging service.
- Recommendation service.
- Billing and identity service.

### 3) ML Layer
- Ranking model.
- RL agent.
- Personalization engine.
- Feature store integration.

### 4) Data Layer
- OLTP: PostgreSQL / CockroachDB.
- OLAP: Data warehouse.
- Streaming: Flink.

### 5) Infrastructure Layer
- Kubernetes for orchestration.
- Service mesh (Istio/Linkerd).
- Edge network (Cloudflare).
- CI/CD for continuous delivery.

## Scaling Strategy
- Stateless backend services for horizontal scaling.
- Async ML inference where latency budgets allow.
- Edge caching for low-latency delivery.
- Event-driven architecture (Kafka / Redpanda).

## Security Design
- Zero-trust edge posture.
- Strong identity model and tenant boundaries.
- Audit logging for governance.
- Privacy-preserving ML direction (federated/FHE-ready).

## Positioning
From a "bot project" to an AI infrastructure platform that is startup-ready, VC-ready, and production-system ready.
