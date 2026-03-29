# ZLineBot README (TH)

แพลตฟอร์มคอมเมิร์ซหลาย tenant ที่ใช้ AI + LINE integration มี metrics แบบเรียลไทม์ มี API ด้าน billing/compliance และรองรับการ deploy ทั้ง Docker/k8s

## เริ่มต้นใช้งาน
```bash
cp .env.example .env
docker compose up -d --build
curl http://localhost:3000/health
```

## API หลัก
- `GET /products`, `POST /products`
- `GET /cart/:userId`, `POST /cart`
- `GET /orders`, `POST /orders`
- `GET /admin/billing`
- `POST /privacy/consent`, `POST /privacy/dsr`

เฮดเดอร์ที่ต้องส่ง:
- `x-api-key: <TENANT_API_KEY>`
- `x-tenant-id: <tenant_id>`

## เอกสารที่เกี่ยวข้อง
- `user_manual_en.md`, `user_manual_th.md`
- `admin_manual_en.md`, `admin_manual_th.md`
- `install_manual_en.md`, `install_manual_th.md`
- `roadmaps_en.md`, `roadmaps_th.md`
- `blueprint_en.md`, `blueprint_th.md`
- `presentation_en.md`, `presentation_th.md`
