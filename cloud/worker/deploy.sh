#!/usr/bin/env bash
set -euo pipefail

fly launch --no-deploy
fly scale count 1
fly autoscale set min=0 max=3
