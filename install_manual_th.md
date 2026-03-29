# คู่มือติดตั้ง ZLineBot (TH)

## 1. แนวทางติดตั้ง
- แบบเร็ว: `./install.sh`
- แบบประหยัด: `./scripts/install_no_cost.sh`
- แบบเต็มฟีเจอร์: `./scripts/install_full.sh`
- แบบขยาย: `./install_full.sh`, `./install_ultimate.sh`

## 2. สิ่งที่ต้องมี
- เครื่อง Ubuntu/Debian
- Docker + Compose
- Git + Curl
- ทางเลือกเสริม: Node/Python

## 3. ขั้นตอนติดตั้งมาตรฐาน
```bash
git clone https://github.com/CVSz/zLinebot.git
cd zLinebot
cp .env.example .env
docker compose up -d --build
curl http://localhost:3000/health
```

## 4. ค่าตัวแปรที่สำคัญ
- `TENANT_API_KEY`
- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `DATABASE_URL`, `REDIS_URL`

## 5. ตั้งค่า Cloudflare Tunnel
```bash
cloudflared tunnel login
cloudflared tunnel create zlinebot
cloudflared tunnel run zlinebot
```

## 6. ตรวจสอบหลังติดตั้ง
- `/health` ตอบปกติ
- dashboard เปิดได้
- `/ws` ส่ง metrics ได้
- endpoints products/orders ใช้งานได้
- LINE webhook ผ่านการตรวจสอบ

## 7. การแก้ปัญหา
- restart loop: `docker compose logs <service>`
- DB มีปัญหา: ตรวจ `DATABASE_URL`
- LINE 401: ตรวจ secret/access token/signature
