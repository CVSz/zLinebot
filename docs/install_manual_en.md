# ZLineBot Install Manual (EN)

## 1. Installation Paths
- Quick: `./install.sh`
- No-cost: `./scripts/install_no_cost.sh`
- Full feature: `./scripts/install_full.sh`
- Extended: `./install_full.sh`, `./install_ultimate.sh`

## 2. Prerequisites
- Ubuntu/Debian host
- Docker + Compose
- Git + Curl
- Optional: Node/Python for advanced workflows

## 3. Standard Install
```bash
git clone https://github.com/CVSz/zLinebot.git
cd zLinebot
cp .env.example .env
docker compose up -d --build
curl http://localhost:3000/health
```

## 4. Required Env Focus
- `TENANT_API_KEY`
- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `DATABASE_URL`, `REDIS_URL`

## 5. Cloudflare Tunnel Setup
```bash
cloudflared tunnel login
cloudflared tunnel create zlinebot
cloudflared tunnel run zlinebot
```

## 6. Post-install Validation
- `/health` returns ok
- dashboard loads
- `/ws` streams metrics
- products/orders endpoints work
- LINE webhook verification works

## 7. Troubleshooting
- Restart loop: `docker compose logs <service>`
- DB issue: verify `DATABASE_URL`
- LINE 401: verify secret/access token/signature flow
