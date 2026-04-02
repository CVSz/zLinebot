#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-zlinebot.zeaz.dev}"
EMAIL="${EMAIL:-admin@zeaz.dev}"
REPO_URL="${REPO_URL:-https://github.com/CVSz/zLinebot.git}"
INSTALL_DIR="${INSTALL_DIR:-/var/www/zLinebot}"

log() {
  echo "[bootstrap] $*"
}

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    echo "Please run as root (sudo ./bootstrap.sh)."
    exit 1
  fi
}

wait_for_deploy() {
  local namespace="$1"
  local deploy="$2"
  log "Waiting for deployment/${deploy} in namespace/${namespace}..."
  kubectl -n "$namespace" rollout status deployment/"$deploy" --timeout=300s
}

require_root

log "Starting zLinebot hyperscale setup for ${DOMAIN}"

export DEBIAN_FRONTEND=noninteractive
apt update
apt upgrade -y
apt install -y curl git docker.io ca-certificates

systemctl enable docker
systemctl start docker

if ! command -v kubectl >/dev/null 2>&1; then
  log "Installing k3s..."
  curl -sfL https://get.k3s.io | sh -
fi

export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

log "Verifying cluster readiness..."
until kubectl get nodes >/dev/null 2>&1; do
  log "Waiting for k3s API to become ready..."
  sleep 5
done
kubectl get nodes

if ! command -v helm >/dev/null 2>&1; then
  log "Installing helm..."
  curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

log "Installing ingress-nginx..."
kubectl apply --validate=false -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

log "Installing cert-manager..."
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml

log "Waiting for cert-manager deployment..."
kubectl -n cert-manager rollout status deployment/cert-manager --timeout=300s
kubectl -n cert-manager rollout status deployment/cert-manager-cainjector --timeout=300s
kubectl -n cert-manager rollout status deployment/cert-manager-webhook --timeout=300s

log "Applying letsencrypt ClusterIssuer..."
cat <<YAML | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    email: ${EMAIL}
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
YAML

mkdir -p "$(dirname "$INSTALL_DIR")"
if [[ ! -d "$INSTALL_DIR/.git" ]]; then
  log "Cloning repository into ${INSTALL_DIR}"
  git clone "$REPO_URL" "$INSTALL_DIR"
else
  log "Repository already exists; pulling latest changes"
  git -C "$INSTALL_DIR" fetch origin
  git -C "$INSTALL_DIR" reset --hard origin/main
fi

cd "$INSTALL_DIR"

log "Building Docker images..."
docker build -t zlinebot-api -f apps/api/Dockerfile .
docker build -t zlinebot-worker -f apps/worker/Dockerfile .

log "Loading images into k3s containerd..."
k3s ctr image import <(docker save zlinebot-api:latest)
k3s ctr image import <(docker save zlinebot-worker:latest)

kubectl create namespace zlinebot --dry-run=client -o yaml | kubectl apply -f -

if [[ -f .env ]]; then
  log "Applying zlinebot-secret from .env"
  kubectl create secret generic zlinebot-secret \
    --namespace=zlinebot \
    --from-env-file=.env \
    --dry-run=client -o yaml | kubectl apply -f -
else
  log "No .env file found; applying default k8s/secret.yaml"
  kubectl apply -f k8s/secret.yaml
fi

log "Applying Kubernetes manifests..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/worker-deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/api-hpa.yaml
kubectl apply -f k8s/prometheus.yaml
kubectl apply -f k8s/grafana.yaml
kubectl apply -f k8s/ingress.yaml

log "Applying production TLS ingress override..."
cat <<YAML | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: zlinebot-ingress
  namespace: zlinebot
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - ${DOMAIN}
      secretName: zlinebot-tls
  rules:
    - host: ${DOMAIN}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 80
YAML

wait_for_deploy zlinebot api
wait_for_deploy zlinebot worker

echo
echo "🎉 DEPLOY COMPLETE"
echo "🌍 https://${DOMAIN}"
