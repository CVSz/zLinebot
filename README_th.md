# ZLineBot (ภาษาไทย)

> [EN](README.md) | TH

ZLineBot คือแพลตฟอร์มคอมเมิร์ซแบบหลาย tenant ที่มีความสามารถด้าน conversational AI, เชื่อมต่อ LINE, มี API สำหรับสินค้า/ตะกร้า/ออเดอร์, ระบบ metrics แบบเรียลไทม์ และโมดูลด้านการปฏิบัติการ/คอมพลายแอนซ์

## ความสามารถหลัก
- แยก tenant ด้วย `x-api-key` และ `x-tenant-id`
- API หลักด้านคอมเมิร์ซ: products, cart, orders, billing
- เชื่อม LINE webhook พร้อมตรวจสอบลายเซ็น
- Realtime metrics ผ่าน WebSocket (`/ws`)
- API ด้าน privacy/DSR (consent/access/delete/rectify)
- Deploy ได้ทั้ง Docker Compose, scripts, และ Kubernetes

## สถาปัตยกรรมแบบย่อ
- **Backend:** Express + TypeScript (`app/`)
- **Admin UI:** React + Vite (`admin/`)
- **Mobile:** ตัวอย่าง React Native (`mobile/`)
- **Data stack:** Postgres, Redis, Kafka, ClickHouse, Qdrant, Flink
- **Infra:** Docker, k8s manifests, Terraform/Cloudflare

## เริ่มต้นใช้งาน
```bash
cp .env.example .env
docker compose up -d --build
curl http://localhost:3000/health
```

## API สำคัญ
Headers:
- `x-api-key: <TENANT_API_KEY>`
- `x-tenant-id: <tenant_id>`

Endpoints:
- `GET /products`, `POST /products`
- `GET /cart/:userId`, `POST /cart`
- `GET /orders`, `POST /orders`
- `GET /admin/health`, `GET /admin/billing`
- `POST /admin/audit/ledger-export`
- `POST /privacy/consent`, `GET /privacy/consent/:userId`, `POST /privacy/dsr`

## เอกสาร
### คู่มือ
- [User Manual (EN)](user_manual_en.md)
- [User Manual (TH)](user_manual_th.md)
- [Admin Manual (EN)](admin_manual_en.md)
- [Admin Manual (TH)](admin_manual_th.md)
- [Install Manual (EN)](install_manual_en.md)
- [Install Manual (TH)](install_manual_th.md)

### เอกสารโครงการ
- [Blueprint (EN)](blueprint_en.md)
- [Blueprint (TH)](blueprint_th.md)
- [Roadmap (EN)](roadmaps_en.md)
- [Roadmap (TH)](roadmaps_th.md)
- [Presentation (EN)](presentation_en.md)
- [Presentation (TH)](presentation_th.md)

## ไฟล์มาตรฐาน GitHub
- [Code of Conduct](CODE_OF_CONDUCT.md) | [TH](CODE_OF_CONDUCT_th.md)
- [Contributing](CONTRIBUTING.md) | [TH](CONTRIBUTING_th.md)
- [Security](SECURITY.md) | [TH](SECURITY_th.md)
- [License](LICENSE) | [EN copy](LICENSE_EN.md) | [TH guide](LICENSE_TH.md)
