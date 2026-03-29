# MANUAL

## Start

docker compose up -d --build

## Cloudflare

cloudflared tunnel login
cloudflared tunnel create zlinebot

## LINE webhook

https://zlinebot.zeaz.dev/api/webhook

## Mobile deployment installers

Android deployment installer:

```bash
./scripts/install_android_deploy.sh
```

iOS deployment installer (macOS only):

```bash
./scripts/install_ios_deploy.sh
```

Full-stack mobile deployment installer:

```bash
./scripts/install_mobile_fullstack_deploy.sh
```
