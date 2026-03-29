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

> Linux note: currently targets Debian/Ubuntu systems (uses `apt`).

iOS deployment installer (macOS only):

```bash
./scripts/install_ios_deploy.sh
```

Full-stack mobile deployment installer:

```bash
./scripts/install_mobile_fullstack_deploy.sh
```

> Linux note: currently targets Debian/Ubuntu systems (uses `apt`).

Meta full-stack Android application deployment installer:

```bash
./scripts/install_meta_fullstack_android_app_deploy.sh
```

Meta full-stack iOS application deployment installer:

```bash
./scripts/install_meta_fullstack_ios_app_deploy.sh
```

Meta full-stack mobile application deployment installer:

```bash
./scripts/install_meta_fullstack_mobile_app_deploy.sh
```
