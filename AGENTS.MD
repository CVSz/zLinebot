**Status:** Master Meta Full Final Release – Version 2.0  
**Date:** 03 April 2026  
**Repository:** https://github.com/CVSz/zLinebot  
**Purpose:** This document serves as the definitive, authoritative reference for the complete multi-agent system within the zLinebot platform. It details every agent, their responsibilities, technical specifications, inter-agent communication protocols, orchestration mechanisms, and governance rules. All AI Copilot agents, developers, and automated systems **must** adhere strictly to this specification.

---

# zLinebot Multi-Agent System – Master Meta Full Final Release

**Version:** 2.0 (Master Meta Full Final Release)  
**Repository:** [CVSz/zLinebot](https://github.com/CVSz/zLinebot)  
**Date:** 03 April 2026  
**Status:** Production-Ready, Comprehensive Master Reference

---

## 1. Introduction

The zLinebot **Agentic Layer** is a fully autonomous, multi-agent orchestration framework designed to transform LINE-based conversations into intelligent, real-time commerce and operational decisions. It operates as a distributed, event-driven system of specialized agents that collaborate under a central orchestrator.

This layer enables:
- Dynamic pricing and personalized recommendations.
- Automated negotiation and supply-chain coordination.
- Risk assessment, policy enforcement, and SLA compliance.
- Emergency governance and kill-switch protocols.
- Seamless integration with recommendation engines, Web3 tokenized economy, and real-time data pipelines.

All agents are built to be **privacy-first**, **observable**, **resilient**, and **extensible**, ensuring zero-trust execution and full compliance with PDPA/GDPR.

---

## 2. Agentic Architecture Overview

**Core Principles:**
- **Event-Driven & Asynchronous:** Agents react to Kafka events, Redis queues, and LINE webhook triggers.
- **gRPC / Protobuf Primary Communication:** Fallback to REST for development only.
- **Orchestrator-Centric:** A central `AgentOrchestrator` service routes tasks, resolves conflicts, and maintains shared state via Redis + PostgreSQL.
- **Plugin-Based Extensibility:** Agents are loaded dynamically via the Automation Compiler.
- **Observability-Native:** Every agent emits OpenTelemetry traces, metrics, and structured logs with anonymized user/session IDs.
- **Safety & Alignment:** Mandatory guardrails, human-in-the-loop escalation paths, and formal verification hooks.

**Deployment Locations:**
- Core agents run in Kubernetes pods (Python + FastAPI/gRPC).
- Edge agents (lightweight decisioning) run inside Cloudflare Workers.
- Web3 agents interface with Solidity contracts via RPC.

---

## 3. Core Agents Catalog

| Agent Name                  | Primary Responsibility                              | Trigger Events                          | Tech Stack                          | Key Outputs / Actions                     |
|-----------------------------|-----------------------------------------------------|-----------------------------------------|-------------------------------------|-------------------------------------------|
| **RecommendationAgent**     | Personalized product ranking & next-best-action     | LINE message, cart update, user profile | Two-tower model, vector search, RL  | Ranked product list, confidence score     |
| **PricingAgent**            | Dynamic pricing, discount optimization, bundling    | Inventory change, demand signal, competitor data | Contextual bandit, causal inference | Final price quote, price history log      |
| **SalesAgent**              | Conversation-to-transaction closure, upsell/cross-sell | User intent detection, cart abandonment | Transformer + policy network        | Order proposal, negotiation prompt        |
| **NegotiationAgent**        | Automated price/term negotiation with users & suppliers | Explicit negotiation request            | RLHF-tuned LLM + game theory        | Counter-offer, contract draft             |
| **RiskAgent**               | Fraud, credit, compliance, and anomaly detection    | High-value order, new user, payment     | Isolation forest + graph neural net | Risk score, block/approve decision        |
| **EconomyAgent**            | Tokenized loyalty, incentive distribution, macro-economy balancing | Reward issuance, token mint/burn events | Solidity smart-contract hooks       | Token allocation, economic health report  |
| **SupplyAgent**             | Inventory forecasting, supplier coordination, replenishment | Low-stock alert, order volume spike     | Time-series forecasting + optimization | Reorder request, supplier PO              |
| **PolicyAgent**             | Enforcement of business rules, PDPA/GDPR, brand guidelines | Any user interaction or data access     | Rule engine + LLM validator         | Compliance verdict, audit log entry       |
| **SLAAgent**                | Real-time SLA monitoring, violation prediction, remediation | Latency, error rate, queue depth        | Prometheus rules + predictive model | Alert escalation, auto-remediation        |
| **KillSwitchAgent**         | Emergency system shutdown, rollback, or human override | Manual trigger, anomaly threshold breach | Hardened circuit-breaker pattern    | Global pause/resume signal                |

**Additional Support Agents:**
- **FeatureStoreAgent** – Synchronizes real-time features from Flink streams.
- **ObservabilityAgent** – Aggregates traces/metrics and triggers alerts.
- **PluginRunnerAgent** – Executes user-defined automation scripts in sandboxed environment.

---

## 4. Agent Orchestration & Communication

- **Central Orchestrator (`AgentOrchestrator`)**: Located in `app/agents/orchestrator/`. Uses a priority queue (Redis) and conflict-resolution engine.
- **Communication Protocol**:
  - Synchronous (low-latency): gRPC unary calls.
  - Asynchronous (long-running): Kafka topics with exactly-once semantics.
  - Shared Memory: Redis for short-term state; PostgreSQL for persistent audit.
- **Coordination Patterns**:
  - **Consensus Voting** for high-stakes decisions (Pricing + Risk + Policy).
  - **Chain-of-Thought Routing** for complex user journeys.
  - **Dead-Letter Queue** for failed agent executions with automatic retry + human escalation.

---

## 5. Agent Lifecycle Management

1. **Registration** – Agents register themselves at startup with capabilities and version.
2. **Health Checks** – Kubernetes liveness + readiness probes + periodic self-test.
3. **Hot-Reloading** – PluginRunner supports runtime updates without full restart.
4. **Versioning** – Each agent maintains semantic versioning; Orchestrator enforces compatibility matrix.
5. **Termination** – Graceful shutdown with state flush to audit log.

---

## 6. Security, Safety & Alignment Framework

- **Zero-Trust Execution**: Every inter-agent call is authenticated via mTLS and signed payloads.
- **Guardrails**: All agents implement `SafetyGuard` middleware (rate limiting, input sanitization, output validation).
- **Human-in-the-Loop**: Critical actions (price > threshold, kill-switch, policy override) require admin approval via React dashboard.
- **Audit & Traceability**: Immutable audit trail stored in `db/audit/` schema with cryptographic signing.
- **Alignment**: Agents are continuously fine-tuned via RLHF and counterfactual evaluation to maximize user value while respecting brand and legal constraints.

---

## 7. Automation Compiler & Plugin System

- Located in `app/agents/compiler/`.
- Accepts YAML/JSON workflow definitions and compiles them into executable agent graphs.
- Supports custom plugin loading (Python packages in sandbox).
- Scheduler integrates with Celery + Redis for cron-style and event-driven automations.

---

## 8. Development & Extension Guidelines

**Mandatory Rules for All Agents:**
- Must implement full OpenTelemetry instrumentation.
- Must expose `/health`, `/metrics`, and `/docs` endpoints.
- Must pass `codex.sh audit` before any merge.
- Must include unit tests covering at least 90% of decision paths.
- Must document every new capability in this file and in `docs/FEATURE_DEEP_IMPACT_DIVE_2026-04.md`.

**Extension Process:**
1. Define new agent in `ml/agents/` or `app/agents/`.
2. Register with Orchestrator via configuration.
3. Update this `AGENTS.md` and the Copilot instructions.
4. Create corresponding Kubernetes manifests and Grafana dashboards.

---

## 9. Master Meta Full Final Release Checklist

- [ ] All agents listed above are fully implemented and production-deployed.
- [ ] End-to-end tracing and audit logging verified across the entire agent graph.
- [ ] Security and safety guardrails tested with adversarial scenarios.
- [ ] Automation Compiler validated with sample workflows.
- [ ] Orchestrator conflict-resolution and fallback logic confirmed.
- [ ] Documentation synchronized with `copilot-instructions.md` and repository structure.

---

This `AGENTS.md` file is now the canonical source of truth for the zLinebot multi-agent system. It is ready for immediate placement in the repository root (or `docs/agents.md` if preferred). All future development, code generation, and operational decisions must reference this document.

Should any clarification, additional agent specifications, or diagram requirements arise, please provide further details for refinement.
