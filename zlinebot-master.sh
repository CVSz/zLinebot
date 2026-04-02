#!/usr/bin/env bash
# ============================================================
# zLinebot Final Release - Single-node k3s master installer
# Target: zlinebot.zeaz.dev behind Cloudflare proxy
# ============================================================

set -euo pipefail

DOMAIN="${DOMAIN:-zlinebot.zeaz.dev}"
EMAIL="${EMAIL:-admin@zeaz.dev}"
NAMESPACE="${NAMESPACE:-zlinebot}"
K3S_KUBECONFIG="/etc/rancher/k3s/k3s.yaml"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Please run as root (use sudo)."
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y curl
fi

echo "🚀 zLinebot FINAL INSTALL STARTING..."

apt-get update -y
apt-get upgrade -y
apt-get install -y git nginx ca-certificates curl gnupg

install_docker_engine() {
  if command -v docker >/dev/null 2>&1; then
    echo "Docker already installed, skipping engine installation."
    systemctl enable --now docker || true
    return 0
  fi

  install -m 0755 -d /etc/apt/keyrings
  if [[ ! -f /etc/apt/keyrings/docker.asc ]]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
  fi

  if [[ ! -f /etc/apt/sources.list.d/docker.list ]]; then
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null
  fi

  apt-get update -y
  # Resolve docker.io <-> containerd.io conflicts from mixed repositories.
  apt-get remove -y docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc 2>/dev/null || true
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
}

install_docker_engine

if ! command -v k3s >/dev/null 2>&1; then
  curl -sfL https://get.k3s.io | sh -
fi

export KUBECONFIG="$K3S_KUBECONFIG"
sleep 10

if ! command -v kubectl >/dev/null 2>&1; then
  ln -sf /usr/local/bin/k3s /usr/local/bin/kubectl
fi

if ! command -v helm >/dev/null 2>&1; then
  curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
sleep 20

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

mkdir -p /var/www
cd /var/www
if [[ ! -d zLinebot/.git ]]; then
  git clone https://github.com/CVSz/zLinebot.git
fi
cd zLinebot
git pull --ff-only || true

if [[ -f .env ]]; then
  echo "Using existing .env"
else
  if command -v node >/dev/null 2>&1; then
    node packages/config/generate-env.ts || cp .env.example .env
  else
    cp .env.example .env
  fi
fi

docker build -t zlinebot-api -f apps/api/Dockerfile .
docker build -t zlinebot-worker -f apps/worker/Dockerfile .

kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -
kubectl create secret generic zlinebot-secret \
  --namespace="${NAMESPACE}" \
  --from-env-file=.env \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -f - <<YAML
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: ${NAMESPACE}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15
          env:
            - name: POSTGRES_PASSWORD
              value: postgres
          ports:
            - containerPort: 5432
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: ${NAMESPACE}
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: ${NAMESPACE}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:7
          args: ["--maxmemory", "256mb", "--maxmemory-policy", "allkeys-lru"]
          ports:
            - containerPort: 6379
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: ${NAMESPACE}
spec:
  selector:
    app: redis
  ports:
    - port: 6379
      targetPort: 6379
YAML

kubectl apply -f - <<YAML
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: ${NAMESPACE}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: zlinebot-api
          imagePullPolicy: Never
          ports:
            - containerPort: 3000
          envFrom:
            - secretRef:
                name: zlinebot-secret
---
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: ${NAMESPACE}
spec:
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 3000
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: worker
  namespace: ${NAMESPACE}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: worker
  template:
    metadata:
      labels:
        app: worker
    spec:
      containers:
        - name: worker
          image: zlinebot-worker
          imagePullPolicy: Never
          envFrom:
            - secretRef:
                name: zlinebot-secret
YAML

kubectl apply -f - <<YAML
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: zlinebot
  namespace: ${NAMESPACE}
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

echo
cat <<INFO
🎉 INSTALL COMPLETE
🌍 https://${DOMAIN}

Next:
1) In Cloudflare DNS create A record: zlinebot -> this server IP (Proxy ON)
2) Cloudflare SSL/TLS mode: Full (strict)
INFO
