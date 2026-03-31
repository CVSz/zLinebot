#!/usr/bin/env bash
# ==============================================================================
# zLinebot Discussions Automated Configurator
# Target: https://github.com/CVSz/zLinebot/discussions
# Purpose: Idempotent setup of GitHub Discussions categories and welcome thread.
# License: MIT
# ==============================================================================

set -euo pipefail

REPO_OWNER="${REPO_OWNER:-CVSz}"
REPO_NAME="${REPO_NAME:-zLinebot}"
FULL_REPO="${REPO_OWNER}/${REPO_NAME}"
SCRIPT_VERSION="2026.04.01"

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "[ERROR] Required command is missing: $cmd"
    exit 1
  fi
}

echo "=== [1/4] Environment Validation ==="
if command -v lsb_release >/dev/null 2>&1; then
  OS_VER="$(lsb_release -rs 2>/dev/null || echo unknown)"
  if [[ "$OS_VER" != "24.04" ]]; then
    echo "[WARNING] Script optimized for Ubuntu 24.04 LTS. Detected version: $OS_VER"
  fi
else
  echo "[WARNING] lsb_release not found. Skipping OS version check."
fi

require_cmd gh
require_cmd jq

if ! gh auth status >/dev/null 2>&1; then
  echo "[ERROR] GitHub CLI is not authenticated. Run: gh auth login"
  exit 1
fi

echo "=== [2/4] Enabling GitHub Discussions and Retrieving Repository ID ==="
gh repo edit "$FULL_REPO" --enable-discussions >/dev/null

REPO_ID="$(gh api graphql \
  -f query='query($owner:String!, $name:String!) { repository(owner:$owner, name:$name) { id } }' \
  -F owner="$REPO_OWNER" \
  -F name="$REPO_NAME" \
  --jq '.data.repository.id')"

if [[ -z "$REPO_ID" || "$REPO_ID" == "null" ]]; then
  echo "[ERROR] Unable to resolve repository ID for $FULL_REPO"
  exit 1
fi

echo "=== [3/4] Creating / Updating Discussion Categories ==="

# JSON schema: [{name,emoji,description,isAnswerable}]
read -r -d '' CATEGORIES_JSON <<'JSON' || true
[
  {"name":"📢 Announcements","emoji":"📢","description":"Official project updates, releases, roadmap changes, and maintenance notices. Maintainers only.","isAnswerable":false},
  {"name":"❓ Q&A","emoji":"❓","description":"Technical questions regarding installation, API usage, LINE webhook configuration, troubleshooting, or general platform operation.","isAnswerable":true},
  {"name":"💡 Feature Requests & Ideas","emoji":"💡","description":"Suggestions for new features, enhancements to commerce modules, AI capabilities, or LINE integrations.","isAnswerable":false},
  {"name":"🐛 Bug Reports","emoji":"🐛","description":"Confirmed runtime or configuration issues. Provide environment details and reproducible steps.","isAnswerable":true},
  {"name":"🚀 Deployment & Infrastructure","emoji":"🚀","description":"Questions concerning Docker, Kubernetes, Cloudflare, Terraform, CI/CD, and scaling.","isAnswerable":true},
  {"name":"📱 LINE Integration","emoji":"📱","description":"LINE bot webhook, messaging flows, signature verification, and conversational scenarios.","isAnswerable":true},
  {"name":"🤖 AI & Conversational","emoji":"🤖","description":"Discussions on conversational AI, prompt engineering, Qdrant integration, and model improvements.","isAnswerable":false},
  {"name":"🛒 Commerce & E-commerce","emoji":"🛒","description":"Product, cart, order, billing, and multi-tenancy API usage.","isAnswerable":true},
  {"name":"🔒 Privacy & Compliance","emoji":"🔒","description":"Data Subject Rights (DSR), consent management, audit logging, and regulatory compliance (GDPR/PDPA).","isAnswerable":true},
  {"name":"👷 Development & Contributing","emoji":"👷","description":"Architecture, code style, pull requests, and contribution guidelines.","isAnswerable":true},
  {"name":"🏆 Show & Tell / Success Stories","emoji":"🏆","description":"Community implementations, production use cases, and anonymized success metrics.","isAnswerable":false},
  {"name":"💬 General / Off-topic","emoji":"💬","description":"Non-technical feedback, meta-discussions, and community topics related to zLinebot.","isAnswerable":false}
]
JSON

EXISTING_JSON="$(gh api graphql \
  -f query='query($owner:String!, $name:String!) { repository(owner:$owner, name:$name) { discussionCategories(first:100) { nodes { id name emoji description isAnswerable } } } }' \
  -F owner="$REPO_OWNER" \
  -F name="$REPO_NAME" \
  --jq '.data.repository.discussionCategories.nodes')"

for encoded in $(printf '%s' "$CATEGORIES_JSON" | jq -rc '.[] | @base64'); do
  decode() { printf '%s' "$encoded" | base64 -d | jq -r "$1"; }

  NAME="$(decode '.name')"
  EMOJI="$(decode '.emoji')"
  DESC="$(decode '.description')"
  IS_ANSWERABLE="$(decode '.isAnswerable')"

  EXISTING="$(printf '%s' "$EXISTING_JSON" | jq -rc --arg name "$NAME" '.[] | select(.name == $name)')"

  if [[ -z "$EXISTING" ]]; then
    echo "[INFO] Creating category: $NAME"
    gh api graphql -f query='mutation($repoId:ID!, $name:String!, $emoji:String!, $description:String!, $isAnswerable:Boolean!) {
      createDiscussionCategory(input:{repositoryId:$repoId, name:$name, emoji:$emoji, description:$description, isAnswerable:$isAnswerable}) {
        category { id name }
      }
    }' \
      -F repoId="$REPO_ID" \
      -F name="$NAME" \
      -F emoji="$EMOJI" \
      -F description="$DESC" \
      -F isAnswerable="$IS_ANSWERABLE" >/dev/null
  else
    ID="$(printf '%s' "$EXISTING" | jq -r '.id')"
    CUR_EMOJI="$(printf '%s' "$EXISTING" | jq -r '.emoji')"
    CUR_DESC="$(printf '%s' "$EXISTING" | jq -r '.description')"
    CUR_ANSWERABLE="$(printf '%s' "$EXISTING" | jq -r '.isAnswerable')"

    if [[ "$CUR_EMOJI" != "$EMOJI" || "$CUR_DESC" != "$DESC" || "$CUR_ANSWERABLE" != "$IS_ANSWERABLE" ]]; then
      echo "[INFO] Updating category: $NAME"
      gh api graphql -f query='mutation($categoryId:ID!, $name:String!, $emoji:String!, $description:String!, $isAnswerable:Boolean!) {
        updateDiscussionCategory(input:{categoryId:$categoryId, name:$name, emoji:$emoji, description:$description, isAnswerable:$isAnswerable}) {
          category { id name }
        }
      }' \
        -F categoryId="$ID" \
        -F name="$NAME" \
        -F emoji="$EMOJI" \
        -F description="$DESC" \
        -F isAnswerable="$IS_ANSWERABLE" >/dev/null
    else
      echo "[INFO] Category already up-to-date: $NAME"
    fi
  fi
done

echo "=== [4/4] Initializing Welcome Discussion ==="
WELCOME_TITLE="🚀 Welcome to zLinebot Discussions – Full Configuration Active"
WELCOME_BODY="### zLinebot Discussions – Production Configuration Complete

The repository now uses a structured discussion system tailored to multi-tenant commerce, LINE messaging, conversational AI, privacy/compliance, and infrastructure workflows.

**Guidelines**
- Follow CODE_OF_CONDUCT.md.
- Include environment details, logs, and reproducible steps.
- Use the most appropriate category for each thread.

This setup is managed by scripts/configure_discussions.sh (version ${SCRIPT_VERSION})."

if gh discussion list --repo "$FULL_REPO" --limit 100 --json title | jq -e --arg t "$WELCOME_TITLE" '.[] | select(.title == $t)' >/dev/null; then
  echo "[INFO] Welcome discussion already exists – skipped."
else
  gh discussion create \
    --repo "$FULL_REPO" \
    --title "$WELCOME_TITLE" \
    --body "$WELCOME_BODY" \
    --category "📢 Announcements" >/dev/null
  echo "[INFO] Welcome discussion created successfully."
fi

echo "============================================================================"
echo "SUCCESS: zLinebot Discussions configuration has been applied."
echo "Repository: ${FULL_REPO}/discussions"
echo "Script version: ${SCRIPT_VERSION}"
echo "============================================================================"
