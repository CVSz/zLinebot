#!/usr/bin/env bash
set -euo pipefail
docker run -d --name crdb \
  -p 26257:26257 -p 8080:8080 \
  cockroachdb/cockroach start-single-node --insecure
