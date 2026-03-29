# ZLineBot Admin Manual (EN)

## Admin Scope
Manage tenants, billing, compliance, observability, and incident response.

## Admin Interfaces
- Dashboard: realtime metrics via `/ws`
- Billing: `/admin/billing`
- Admin APIs:
  - `GET /admin/health`
  - `GET /admin/billing`
  - `POST /admin/audit/ledger-export`
  - `POST /privacy/consent`
  - `POST /privacy/dsr`

## Access Control
- `x-api-key` must match `TENANT_API_KEY`
- tenant comes from `x-tenant-id` (default `demo`)
- schema context: `tenant_<id>, public`

## Billing Operations
1. Confirm invoice records exist.
2. Verify tenant/api-key headers from admin client.
3. Reconcile with order/payment records.

## Audit & Privacy
- Ledger export: `POST /admin/audit/ledger-export`
- Consent endpoints
- DSR workflow: `access`, `delete`, `rectify`

## Observability
- Events: `message`, `order`, `payment`
- Health: `GET /health`
- Realtime websocket metrics every second

## Incident Playbook
- 401 spike: check key rotation/config
- 429 spike: check retry loops/traffic surges
- No metrics: verify Redis, websocket route, event emission
