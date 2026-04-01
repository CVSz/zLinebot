# USER GUIDE

Last updated: 2026-04-01

## 1) Discover products

- Open the chat/channel client integrated with ZLineBot.
- Request product list from the backend (`GET /products`).
- Product impressions/clicks can be tracked via:
  - `POST /events/view`
  - `POST /events/click`

## 2) Build cart

- Add products to cart with `POST /cart`.
- Review current items with `GET /cart/:userId`.

## 3) Checkout

- Create order with `POST /orders`.
- Default payment method is PromptPay.
- Set `paymentMethod: "stripe"` to receive `checkoutUrl`.

## 4) Privacy controls

- Update consent with `POST /privacy/consent`.
- Query consent history with `GET /privacy/consent/:userId`.
- Submit data subject requests with `POST /privacy/dsr` (`access`, `delete`, `rectify`).

## Required headers (tenant APIs)

- `x-api-key: <TENANT_API_KEY>`
- `x-tenant-id: <tenant_id>`
