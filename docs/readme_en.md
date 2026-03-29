# ZLineBot README (EN)

AI-assisted multi-tenant commerce platform with LINE integration, realtime metrics, billing/compliance APIs, and Docker/k8s deployment options.

## Quick Start
```bash
cp .env.example .env
docker compose up -d --build
curl http://localhost:3000/health
```

## Core APIs
- `GET /products`, `POST /products`
- `GET /cart/:userId`, `POST /cart`
- `GET /orders`, `POST /orders`
- `GET /admin/billing`
- `POST /privacy/consent`, `POST /privacy/dsr`

Required headers:
- `x-api-key: <TENANT_API_KEY>`
- `x-tenant-id: <tenant_id>`

## Related Docs
- `user_manual_en.md`, `user_manual_th.md`
- `admin_manual_en.md`, `admin_manual_th.md`
- `install_manual_en.md`, `install_manual_th.md`
- `roadmaps_en.md`, `roadmaps_th.md`
- `blueprint_en.md`, `blueprint_th.md`
- `presentation_en.md`, `presentation_th.md`
