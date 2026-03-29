#!/usr/bin/env bash
set -euo pipefail

curl -L https://fly.io/install.sh | sh

export FLYCTL_INSTALL="${HOME}/.fly"
export PATH="${FLYCTL_INSTALL}/bin:${PATH}"

fly auth login
