# ZLineBot Blueprint (TH)

## สถาปัตยกรรม
Backend แบบ Express พร้อม tenant middleware, LINE webhook, API ด้าน billing/privacy/audit และ websocket metrics

## ชั้นการทำงาน
- Edge: Nginx, Cloudflare tunnel
- API: routers + middleware
- Data: Postgres/Redis และ event stack เสริม
- Realtime: ตัวนับเหตุการณ์ไปยัง `/ws`

## โดเมนข้อมูล
ตารางหลัก: `products`, `carts`, `orders`, `invoices`, `subscriptions`, `loyalty_points`, `referrals`

## เส้นทาง AI
Intent trigger -> ranking/recommendation -> LLM fallback

## ความปลอดภัย
API key + tenant isolation, LINE signature verification, rate limiting และ privacy endpoints

## การ deploy
ใช้ Docker Compose สำหรับมาตรฐาน และใช้ k8s manifests + infra scripts สำหรับแบบขั้นสูง
