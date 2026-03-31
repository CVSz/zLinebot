#!/usr/bin/env bash
# ==============================================================================
# zLinebot Discussions Automated Configurator (2026 Edition)
# Target: https://github.com/CVSz/zLinebot/discussions
# Purpose: Enable Discussions + provide clear manual setup instructions.
#          Note: GitHub CLI does not yet support creating discussions or categories.
# Version: 2026.04.01
# License: MIT
# ==============================================================================
set -euo pipefail

# --- Configuration ---
REPO_OWNER="${REPO_OWNER:-CVSz}"
REPO_NAME="${REPO_NAME:-zLinebot}"
FULL_REPO="${REPO_OWNER}/${REPO_NAME}"
SCRIPT_VERSION="2026.04.01"

# ==============================================================================
# [1/4] Environment Validation
# ==============================================================================
echo "=== [1/4] Environment Validation ==="

if command -v lsb_release >/dev/null 2>&1; then
  OS_VER="$(lsb_release -rs 2>/dev/null || echo unknown)"
  if [[ "$OS_VER" != "24.04" ]]; then
    echo "[WARNING] Script optimized for Ubuntu 24.04 LTS. Detected: $OS_VER"
  fi
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "[ERROR] GitHub CLI (gh) is not installed. Please install it first."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "[ERROR] GitHub CLI is not authenticated. Please run: gh auth login"
  exit 1
fi

# ==============================================================================
# [2/4] Enabling GitHub Discussions
# ==============================================================================
echo "=== [2/4] Enabling GitHub Discussions ==="

gh repo edit "$FULL_REPO" --enable-discussions >/dev/null
echo "[INFO] Discussions feature enabled (or already active) for ${FULL_REPO}"

# ==============================================================================
# [3/4] Discussion Categories – Manual Setup
# ==============================================================================
echo "=== [3/4] Discussion Categories (Manual Setup Required) ==="

cat <<'EOF'
[IMPORTANT] GitHub does not currently provide a public API or gh CLI command to create Discussion categories.

Please create the following 12 categories manually:

1. 📢 Announcements          → Not answerable
2. ❓ Q&A                     → Answerable
3. 💡 Feature Requests & Ideas → Not answerable
4. 🐛 Bug Reports             → Answerable
5. 🚀 Deployment & Infrastructure → Answerable
6. 📱 LINE Integration        → Answerable
7. 🤖 AI & Conversational     → Not answerable
8. 🛒 Commerce & E-commerce   → Answerable
9. 🔒 Privacy & Compliance    → Answerable
10. 👷 Development & Contributing → Answerable
11. 🏆 Show & Tell / Success Stories → Not answerable
12. 💬 General / Off-topic    → Not answerable

How to create:
   1. Go to: https://github.com/CVSz/zLinebot/settings/discussions
   2. Under "Discussion categories", click "New category" for each item.
   3. Set the emoji, name, description (optional but recommended), and "Answerable" flag as shown above.

EOF

# ==============================================================================
# [4/4] Welcome Discussion – Manual Creation Recommended
# ==============================================================================
echo "=== [4/4] Welcome Discussion ==="

cat <<'EOF'
The GitHub CLI does not yet support creating discussions (`gh discussion create` is unavailable).

Please create the welcome discussion manually (one-time action):

1. Go to: https://github.com/CVSz/zLinebot/discussions
2. Click "New discussion"
3. Select category: **📢 Announcements**
4. Use the following title and body:

Title:
🚀 Welcome to zLinebot Discussions – Production Configuration Active

Body:
### zLinebot Discussions – Production Configuration Complete

The repository now uses a structured discussion system tailored to multi-tenant commerce, LINE messaging, conversational AI, privacy/compliance, and infrastructure workflows.

**Guidelines**
- Follow [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) and [CONTRIBUTING.md](../CONTRIBUTING.md).
- Do not post secrets, API keys, tokens, or personal data.
- Provide context (version, deployment method, environment), reproducible steps, logs, and sanitized payloads.
- Use the most appropriate category for each thread.
- Close the loop by posting the solution when your issue is resolved.

This setup is managed by `scripts/configure_discussions.sh` (version ${SCRIPT_VERSION}).

Where to report security issues: [SECURITY.md](../SECURITY.md).

EOF

echo "============================================================================"
echo "SUCCESS: zLinebot Discussions feature has been enabled."
echo "Repository: https://github.com/${FULL_REPO}/discussions"
echo "Script version: ${SCRIPT_VERSION}"
echo "============================================================================"
echo ""
echo "Next steps:"
echo "   1. Create the 12 categories via GitHub Settings → Discussions"
echo "   2. Create the welcome discussion manually (copy the title/body above)"
echo ""
echo "After completing these manual steps, the Discussions area will be fully configured."
