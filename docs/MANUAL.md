> **Documentation Update (2026-04-02):** For the latest repository-wide feature analysis, see `docs/FEATURE_DEEP_IMPACT_DIVE_2026-04.md`.

# OPERATIONS MANUAL

Last updated: 2026-04-01

## Local start

```bash
cp .env.example .env
docker compose up -d --build
curl http://localhost:3000/health
```

## Webhook endpoints

- LINE webhook: `POST /webhook` (service base URL + `/webhook`)
- Stripe webhook: `POST /webhook/stripe`
- PromptPay webhook: `POST /webhook/promptpay`

## Cloudflare tunnel (optional)

```bash
cloudflared tunnel login
cloudflared tunnel create zlinebot
```

## Installers and automation scripts

Core installers:

- `./install.sh`
- `./install_full.sh`
- `./install_ultimate.sh`

Scripts directory installers:

- `./scripts/install_auto.sh`
- `./scripts/install_no_cost.sh`
- `./scripts/install_secure.sh`
- `./scripts/install_mobile_fullstack_deploy.sh`
- `./scripts/install_android_deploy.sh`
- `./scripts/install_ios_deploy.sh`
- `./scripts/install_meta_fullstack_android_app_deploy.sh`
- `./scripts/install_meta_fullstack_ios_app_deploy.sh`
- `./scripts/install_meta_fullstack_mobile_app_deploy.sh`

## Notes

- Some mobile/deploy scripts are OS-specific (Linux/macOS requirements differ).
- Keep `.env.example` and deployment manifests in sync before releases.
