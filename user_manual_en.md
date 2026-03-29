# ZLineBot User Manual (EN)

## 1. Platform Overview
ZLineBot supports conversational shopping via LINE and API-based commerce flows.

## 2. User Capabilities
- View products (`GET /products`)
- Add to cart (`POST /cart`)
- View cart (`GET /cart/:userId`)
- Place orders (`POST /orders`)
- Submit privacy consent and DSR requests

## 3. Required Headers
- `x-api-key: <TENANT_API_KEY>`
- `x-tenant-id: <tenant_id>`

## 4. Product and Cart Flow
1. Fetch product list.
2. Select product and quantity.
3. Add item to cart.
4. Review cart before checkout.

## 5. Order and Payment Flow
- Create order with `paymentMethod`:
  - `promptpay` (QR path)
  - `stripe` (checkout URL when configured)

## 6. LINE Chat Usage
- Text intents like `buy`, `price`, `มีอะไรบ้าง`, `ราคา` trigger shopping responses.
- Bot can recommend items and provide concise response text.

## 7. Privacy and DSR
- `POST /privacy/consent`
- `GET /privacy/consent/:userId`
- `POST /privacy/dsr`
- DSR types: `access`, `delete`, `rectify`

## 8. Realtime Metrics (Read-only)
Metrics are visible via admin dashboard and `/ws` stream (`messages`, `orders`, `payments`).

## 9. Troubleshooting
- 401 Unauthorized: invalid `x-api-key`
- Empty products: no tenant product data
- No LINE response: credential/signature mismatch
- Null Stripe URL: Stripe not configured
