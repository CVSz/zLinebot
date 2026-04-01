# Repository Structure & Upgrade Readiness

Last updated: 2026-04-01

This document summarizes the repository layout to speed up onboarding and reduce upgrade risk.

## 1) Top-level directories

- `app/` — Primary backend service (TypeScript/Express, webhooks, tenant APIs)
- `admin/` — Admin dashboard (React + Vite)
- `mobile/` — Mobile app code/modules
- `db/` — SQL schemas by domain (identity, billing, privacy, risk, events, etc.)
- `docs/` — User/admin manuals and OpenAPI
- `docker/`, `k8s/`, `infra/`, `cloudflare/`, `cloud/` — Deployment and infrastructure assets
- `ml/` — ML simulation/training and ranking modules
- `scripts/` — Automation scripts for install/lint/deploy

## 2) Baseline standards before upgrades

1. **Single environment contract**
   - Keep required values in `.env.example` complete and current.
   - Validate critical env values at backend startup.

2. **Quality gates in CI**
   - Ensure lint/type-check/test commands run in CI.
   - Keep a fast validation path for quick PR feedback.

3. **Webhook and API security**
   - Verify signatures for webhook providers.
   - Keep tenant authentication headers mandatory on tenant routes.

4. **Documentation discipline**
   - Update docs in `docs/` when endpoints or behavior changes.
   - Record ownership/responsibility as the project scales.

## 3) Pre-release checklist

- Run lint/type-check/tests.
- Validate schema compatibility in staging.
- Verify webhook secrets and key rotation procedures.
- Review core dependency versions.
- Confirm docs and API examples are still accurate.
