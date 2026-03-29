# ZLineBot Install Manual (EN)

## Install Modes
- `./install.sh`
- `./scripts/install_no_cost.sh`
- `./scripts/install_full.sh`
- `./install_full.sh`
- `./install_ultimate.sh`

## Prerequisites
Ubuntu/Debian host, Docker, Git, Curl, optional Node/Python.

## Standard Setup
```bash
git clone https://github.com/CVSz/zLinebot.git
cd zLinebot
cp .env.example .env
docker compose up -d --build
curl http://localhost:3000/health
```

## Core Services
app, admin, postgres, redis, qdrant, ollama, kafka/zookeeper, clickhouse/metabase, flink, nginx, cloudflared.

## Cloudflare Tunnel
```bash
cloudflared tunnel login
cloudflared tunnel create zlinebot
cloudflared tunnel run zlinebot
```

## Validation
- `/health` returns ok
- dashboard and `/ws` work
- products/orders APIs work
- LINE webhook signature validation passes
