# ADMIN GUIDE

Last updated: 2026-04-01

## Admin health and billing

- Service check: `GET /admin/health`
- Billing history by tenant: `GET /admin/billing`

## Product operations

- List products: `GET /products`
- Create product: `POST /products`

Example payload:

```json
{
  "name": "Premium Green Tea",
  "price": 129,
  "stock": 50,
  "desc": "Organic matcha blend"
}
```

## Order operations

- List orders: `GET /orders`
- Create order: `POST /orders`

Example payload:

```json
{
  "userId": "user_123",
  "total": 258,
  "paymentMethod": "stripe"
}
```

## Required headers

- `x-api-key: <TENANT_API_KEY>`
- `x-tenant-id: <tenant_id>`
- `Content-Type: application/json`
