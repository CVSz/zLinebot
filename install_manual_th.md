# คู่มือติดตั้ง ZLineBot (TH)

## โหมดการติดตั้ง
- `./install.sh`
- `./scripts/install_no_cost.sh`
- `./scripts/install_full.sh`
- `./install_full.sh`
- `./install_ultimate.sh`

## สิ่งที่ต้องมี
เครื่อง Ubuntu/Debian, Docker, Git, Curl และอาจต้องใช้ Node/Python

## ขั้นตอนติดตั้งมาตรฐาน
```bash
git clone https://github.com/CVSz/zLinebot.git
cd zLinebot
cp .env.example .env
docker compose up -d --build
curl http://localhost:3000/health
```

## บริการหลัก
app, admin, postgres, redis, qdrant, ollama, kafka/zookeeper, clickhouse/metabase, flink, nginx, cloudflared

## Cloudflare Tunnel
```bash
cloudflared tunnel login
cloudflared tunnel create zlinebot
cloudflared tunnel run zlinebot
```

## การตรวจสอบหลังติดตั้ง
- `/health` ต้องตอบกลับปกติ
- dashboard และ `/ws` ใช้งานได้
- products/orders APIs ใช้งานได้
- LINE webhook ตรวจ signature ผ่าน
