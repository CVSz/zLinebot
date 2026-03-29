# ZLineBot User Manual (EN)

## Overview
ZLineBot is a chat-commerce assistant for browsing products, managing carts, creating orders, and submitting privacy requests via LINE and API.

## Quick Commands
- Product intent: `buy`, `price`, `มีอะไรบ้าง`, `ราคา`
- Browse products: `GET /products`
- Add cart item: `POST /cart`
- Create order: `POST /orders`

## Required Headers
- `x-api-key: <TENANT_API_KEY>`
- `x-tenant-id: <tenant_id>`

## API Usage
### Products
- `GET /products`
- `POST /products`

### Cart
- `GET /cart/:userId`
- `POST /cart`

### Orders
- `GET /orders`
- `POST /orders`
- `paymentMethod`: `promptpay` (QR) or `stripe` (checkout URL)

## Privacy / DSR
- `POST /privacy/consent`
- `GET /privacy/consent/:userId`
- `POST /privacy/dsr`
- DSR types: `access`, `delete`, `rectify`

## Typical Journey
1. User asks in LINE.
2. Bot recommends products.
3. User adds item to cart.
4. User creates order and pays.
5. User can submit privacy requests.

## Troubleshooting
- Unauthorized: invalid or missing `x-api-key`
- No products: selected tenant has no products
- LINE no reply: LINE credential/signature issue
- Stripe URL null: Stripe is not configured
