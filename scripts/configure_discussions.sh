#!/usr/bin/env bash
# ==============================================================================
# zLinebot Discussions Automated Configurator (2026 Edition)
# Target: https://github.com/CVSz/zLinebot/discussions
# Purpose: Idempotent setup of GitHub Discussions (enable + welcome thread).
#          Note: Categories must be created manually via GitHub web UI.
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
# Function Definitions
# ==============================================================================
require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "[ERROR] Required command is missing: $cmd"
    exit 1
  fi
}

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

require_cmd gh
require_cmd jq

if ! gh auth status >/dev/null 2>&1; then
  echo "[ERROR] GitHub CLI is not authenticated. Please run: gh auth login"
  exit 1
fi

# ==============================================================================
# [2/4] Enabling GitHub Discussions
# ==============================================================================
echo "=== [2/4] Enabling GitHub Discussions ==="

gh repo edit "$FULL_REPO" --enable-discussions >/dev/null
echo "[INFO] Discussions feature enabled (or already active) for $FULL_REPO"

# ==============================================================================
# [3/4] Manual Category Setup Reminder
# ==============================================================================
echo "=== [3/4] Discussion Categories ==="

cat <<EOF2
[IMPORTANT] GitHub does not provide a public API (GraphQL or REST) to create or update Discussion categories.

Please create the following 12 categories manually in the GitHub web interface:

1. 📢 Announcements          (Not answerable)
2. ❓ Q&A                     (Answerable)
3. 💡 Feature Requests & Ideas (Not answerable)
4. 🐛 Bug Reports             (Answerable)
5. 🚀 Deployment & Infrastructure (Answerable)
6. 📱 LINE Integration        (Answerable)
7. 🤖 AI & Conversational     (Not answerable)
8. 🛒 Commerce & E-commerce   (Answerable)
9. 🔒 Privacy & Compliance    (Answerable)
10. 👷 Development & Contributing (Answerable)
11. 🏆 Show & Tell / Success Stories (Not answerable)
12. 💬 General / Off-topic    (Not answerable)

How to create:
   Go to: https://github.com/${FULL_REPO}/settings/discussions
   Click "New category" for each entry above.
   Set emoji, description, and "Answerable" flag as indicated.

Once created, this script will no longer show this section.
EOF2

# ==============================================================================
# [4/4] Initializing Welcome Discussion
# ==============================================================================
echo "=== [4/4] Initializing Welcome Discussion ==="

WELCOME_TITLE="🚀 Welcome to zLinebot Discussions – Production Configuration Active"

WELCOME_BODY="### zLinebot Discussions – Production Configuration Complete

The repository now uses a structured discussion system tailored to multi-tenant commerce, LINE messaging, conversational AI, privacy/compliance, and infrastructure workflows.

**Guidelines**
- Follow [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) and [CONTRIBUTING.md](../CONTRIBUTING.md).
- Do not post secrets, API keys, tokens, or personal data.
- Provide context (version/commit, deployment method, environment), reproducible steps, logs, and sanitized payloads.
- Use the most appropriate category for each thread.
- Close the loop by posting the solution when resolved.

**Automation**
This setup is managed by \`scripts/configure_discussions.sh\` (version ${SCRIPT_VERSION}).

Where to report security issues: [SECURITY.md](../SECURITY.md)."

if gh discussion list --repo "$FULL_REPO" --limit 100 --json title | jq -e --arg t "$WELCOME_TITLE" '.[] | select(.title == $t)' >/dev/null 2>&1; then
  echo "[INFO] Welcome discussion already exists – skipped."
else
  gh discussion create \
    --repo "$FULL_REPO" \
    --title "$WELCOME_TITLE" \
    --body "$WELCOME_BODY" \
    --category "📢 Announcements" >/dev/null
  echo "[INFO] Welcome discussion created successfully in Announcements category."
fi

echo "============================================================================"
echo "SUCCESS: zLinebot Discussions configuration has been applied."
echo "Repository: ${FULL_REPO}/discussions"
echo "Script version: ${SCRIPT_VERSION}"
echo "============================================================================"
echo ""
echo "Next step: Create the 12 categories manually via GitHub Settings → Discussions."
