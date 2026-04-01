# เอกสาร ZLineBot (TH)

อัปเดตล่าสุด: 2026-04-01

ZLineBot คือแพลตฟอร์มคอมเมิร์ซแบบ multi-tenant ที่มี LINE webhook, ระบบ privacy/compliance, billing endpoint และรองรับการต่อยอดระบบ ML/recommendation

## เริ่มต้นใช้งานเร็ว

```bash
cp .env.example .env
docker compose up -d --build
curl http://localhost:3000/health
```

## ภาพรวม API หลัก

Endpoint ที่อยู่ใน tenant scope ต้องส่ง header:

- `x-api-key: <TENANT_API_KEY>`
- `x-tenant-id: <tenant_id>`

เส้นทางหลัก:

- `GET /health`
- `GET /products`, `POST /products`
- `POST /events/view`, `POST /events/click`
- `GET /cart/:userId`, `POST /cart`
- `GET /orders`, `POST /orders`
- `GET /admin/health`
- `GET /admin/billing`
- `POST /privacy/consent`, `GET /privacy/consent/:userId`
- `POST /privacy/dsr`

## แผนที่เอกสาร

- `docs/USER.md` — การใช้งานฝั่งผู้ใช้
- `docs/ADMIN.md` — การใช้งานฝั่งผู้ดูแลและตัวอย่าง API
- `docs/MANUAL.md` — คู่มือ setup/deploy
- `docs/openapi.yaml` — API schema (ถ้ามีการอัปเดต)
- `docs/REPO_STRUCTURE.md` — โครงสร้าง repository และแนวทางอัปเกรด
