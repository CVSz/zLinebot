# ZLineBot Admin Manual (EN)

## 1. Operations Scope
Admin manages tenant configuration, billing visibility, compliance, and incident response.

## 2. Admin Interfaces
- Web dashboard (`admin/`) for realtime metrics
- API endpoints:
  - `GET /admin/health`
  - `GET /admin/billing`
  - `POST /admin/audit/ledger-export`
  - `POST /privacy/consent`
  - `POST /privacy/dsr`

## 3. Access Control Model
- API key middleware validates `x-api-key`
- Tenant context set from `x-tenant-id`
- Tenant schema applied as `tenant_<id>, public`

## 4. Billing Runbook
1. Verify invoices are present.
2. Confirm tenant scoping headers in requests.
3. Reconcile order and payment records.

## 5. Privacy/Compliance Runbook
- Capture and review user consent
- Execute DSR operations (`access`, `delete`, `rectify`)
- Generate ledger export for audit trail

## 6. Observability
- Health: `GET /health`
- Realtime metrics: `/ws`
- Event categories: message/order/payment

## 7. Incident Playbook
- 401 spikes: verify key rotation and env injection
- 429 spikes: inspect abusive traffic/retry loops
- Missing metrics: check Redis/event publishing/websocket path

## 8. Security Checklist
- Never expose API keys
- Enforce TLS at edge
- Keep backups and restore drills
- Restrict admin network surface
