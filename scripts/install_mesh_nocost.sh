#!/usr/bin/env bash
set -euo pipefail
curl -sL https://run.linkerd.io/install | sh
export PATH="$PATH:$HOME/.linkerd2/bin"
linkerd install | kubectl apply -f -
linkerd check
