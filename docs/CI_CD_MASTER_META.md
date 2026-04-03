> **Documentation Update (2026-04-02):** For the latest repository-wide feature analysis, see `docs/FEATURE_DEEP_IMPACT_DIVE_2026-04.md`.

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
2. Push image to a container registry using Docker credentials.
3. Deployment logic is executed through:
   - `./scripts/master_meta_full_source_ci_cd.sh cd`

## Local usage

```bash
./scripts/master_meta_full_source_ci_cd.sh ci
```

```bash
DOCKER_REGISTRY=ghcr.io DOCKER_USERNAME=<user> DOCKER_PASSWORD=<token> DOCKER_IMAGE_REF=ghcr.io/<org>/zlinebot ./scripts/master_meta_full_source_ci_cd.sh cd
```
