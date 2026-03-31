# zLinebot Discussion Guidelines

Welcome to the zLinebot Discussions space. This document explains how to choose the right category, what details to include, and how to keep conversations useful and respectful.

## Community standards

- Follow [CONTRIBUTING.md](../CONTRIBUTING.md).
- Follow [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md).
- Do not post secrets, API keys, tokens, or personal data.
- Keep content relevant to zLinebot (commerce APIs, LINE integration, AI workflows, infrastructure, and compliance).

## Recommended categories

| Category Name | Type | Purpose | Posting guidance |
|---|---|---|---|
| Announcements | Announcement | Official updates, releases, roadmap changes, and maintenance notices. | Maintainers only. Informational posts; replies optional. |
| Q&A | Q&A | General technical questions about setup, usage, and troubleshooting. | Include environment details, reproduction steps, and logs. |
| Feature Requests & Ideas | Idea | New feature proposals and enhancement ideas. | Share use case, business/technical impact, and priority. |
| Bug Reports | Q&A | Runtime/configuration defects and behavior validation before opening an Issue. | For confirmed code bugs, open an Issue and link it in the discussion. |
| Deployment & Infrastructure | Q&A | Docker, Kubernetes, Cloudflare, Terraform, scaling, CI/CD. | Specify deployment target, versions, and exact error output. |
| LINE Integration | Q&A | LINE webhook, signature validation, events, and messaging behavior. | Redact channel credentials and include sanitized payload samples. |
| AI & Conversational | Idea | AI model integration, prompt strategy, and retrieval/conversation design ideas. | Focus on reusable platform improvements over app-specific prompts. |
| Commerce & E-commerce | Q&A | Products, cart, orders, billing, and multi-tenant commerce behavior. | Reference API paths, tenant context, and expected business rules. |
| Privacy & Compliance | Q&A | DSR, consent, audit logs, data lifecycle, and policy questions. | Reference applicable regulations (for example GDPR/PDPA) and data scope. |
| Development & Contributing | Q&A | Architecture, coding conventions, PR process, and contributor workflow. | Link related files and follow contribution checklist requirements. |
| Show & Tell / Success Stories | Open-ended | Community implementations and lessons learned. | Share anonymized examples only; no spam or unsolicited advertising. |
| General / Off-topic | Open-ended | Meta-discussions and broad community feedback. | Keep respectful and loosely connected to the zLinebot ecosystem. |

## How to write a high-quality discussion

1. **Use a clear title** with one problem or idea per thread.
2. **Provide context** (version/commit, deployment method, environment).
3. **Add reproducible details** (request/response snippets, logs, screenshots).
4. **Redact sensitive data** before posting.
5. **Close the loop** by posting the final solution if you solved it.

## Maintainer triage workflow (recommended)

- Convert validated defects to Issues and cross-link threads.
- Pin critical updates in **Announcements**.
- Mark accepted ideas and track status in roadmap/release notes.
- Redirect misplaced posts to the correct category with a short explanation.

## Suggested pinned "Welcome" outline

When editing the pinned welcome post, include:

- A short project introduction.
- Category overview with links to this guideline.
- A reminder to follow the Code of Conduct.
- Where to report security issues: [SECURITY.md](../SECURITY.md).

---

If category structure changes, update this file in the same pull request so community guidance stays synchronized.
