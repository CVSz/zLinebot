# Master Meta Full Source CI/CD

This repository now includes a dedicated CI/CD workflow for full-source verification and deployment.

## Workflow

- File: `.github/workflows/master-meta-full-source-ci-cd.yml`
- Name: **Master Meta Full Source CI/CD**
- Triggers:
  - `pull_request`
  - `push` on `main` and `master`
  - `workflow_dispatch`

## Pipeline logic

### CI job

1. Checkout source code.
2. Setup Python and Node.js runtimes.
3. Install lint tooling (`ruff`, `shellcheck`).
4. Execute full-source checks via:
   - `./scripts/master_meta_full_source_ci_cd.sh ci`

This script runs:
- Python lint checks
- TypeScript backend build
- Admin frontend build
- Shell script linting
- Root Docker image build

### CD job

Runs only on push to `main` (after CI passes).

1. Build image.
2. Push image to Fly registry using `FLY_API_TOKEN`.
3. Deployment logic is executed through:
   - `./scripts/master_meta_full_source_ci_cd.sh cd`

## Local usage

```bash
./scripts/master_meta_full_source_ci_cd.sh ci
```

```bash
FLY_API_TOKEN=... FLY_REGISTRY=registry.fly.io/zlinebot ./scripts/master_meta_full_source_ci_cd.sh cd
```
