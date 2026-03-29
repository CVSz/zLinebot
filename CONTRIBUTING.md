# Contributing Guide (EN)

## Development Setup
1. Fork and clone repository.
2. Create feature branch.
3. Copy env and run stack:
   ```bash
   cp .env.example .env
   docker compose up -d --build
   ```
4. Validate health endpoint: `curl http://localhost:3000/health`

## Contribution Scope
- Bug fixes
- Security hardening
- Performance improvements
- Documentation and examples

## Pull Request Checklist
- Keep PR focused and small.
- Explain motivation and approach.
- Include testing evidence (commands and output summary).
- Update docs when changing behavior.
- Ensure tenant safety and privacy impact are addressed.

## Commit Style
Use descriptive commits, for example:
- `feat: add X`
- `fix: correct Y`
- `docs: update Z`

## Review Expectations
Maintainers review for correctness, security, maintainability, and backward compatibility.
