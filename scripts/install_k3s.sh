#!/usr/bin/env bash
set -euo pipefail

curl -sfL https://get.k3s.io | sh -

export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl get nodes
