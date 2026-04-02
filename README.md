# 🚀 zLinebot

### AI-Native Platform for Intelligent Messaging, Personalization, and Distributed Systems
**From LINE Bot → AI → ML → Web3 → Cloud Infrastructure (All-in-One Stack)**

---

<p align="center">
  <img src="https://img.shields.io/badge/AI-Platform-blueviolet" />
  <img src="https://img.shields.io/badge/Node.js-TypeScript-green" />
  <img src="https://img.shields.io/badge/Python-ML-yellow" />
  <img src="https://img.shields.io/badge/Kubernetes-Cloud--Native-blue" />
  <img src="https://img.shields.io/badge/Cloudflare-Edge-orange" />
  <img src="https://img.shields.io/badge/Web3-Smart%20Contracts-black" />
  <img src="https://img.shields.io/badge/License-MIT-brightgreen" />
</p>

---

> **zLinebot is not just a chatbot.**
> It is a **full-stack AI platform** that combines LINE messaging, machine learning, data systems, and cloud-native infrastructure into one unified architecture.

---

## ⚡ One-Liner

> Build intelligent, scalable, AI-powered systems with LINE as the frontend and a full distributed stack behind it.

---

## 🇬🇧 English

### 🧠 About the Platform

zLinebot is a full-stack AI platform that combines:

- 🤖 LINE Bot (frontend conversational interface)
- ⚙️ Backend services (Node.js + TypeScript)
- 🧠 Machine Learning services (Python)
- 📊 Data platform (SQL + analytics/feature systems)
- 🌐 Cloud-native infrastructure (Docker, Kubernetes, Cloudflare)
- ⛓ Web3 integrations (smart contracts)

### 🏗 Architecture Overview

```mermaid
flowchart TD

User[👤 User] --> LINE[📱 LINE Messaging API]
LINE --> CF[☁️ Cloudflare Worker / Edge]
CF --> APP[⚙️ Backend (Node.js / TS)]

APP --> DB[(🗄 Database)]
APP --> API[🔌 External APIs]

APP --> ML[🧠 ML Services (Python)]
ML --> MODEL[📊 Models: RL / Ranking / Anomaly]

APP --> FLINK[🌊 Stream Processing]
FLINK --> WH[(🏢 Data Warehouse)]

APP --> ADMIN[🖥 Admin Dashboard]
APP --> MOBILE[📱 Mobile App]

APP --> WEB3[⛓ Smart Contracts]

subgraph Infra
DOCKER[🐳 Docker]
K8S[☸️ Kubernetes]
ISTIO[🔀 Service Mesh]
TF[🏗 Terraform]
end

APP --> DOCKER
DOCKER --> K8S
K8S --> ISTIO
K8S --> TF
```

### 🛠 Tech Stack

#### Backend
- Node.js (TypeScript) → `app/`
- Cloudflare Workers → `cloudflare/`

#### Frontend
- Admin Dashboard (Vite/React) → `admin/`
- Mobile App (React Native) → `mobile/`

#### AI / ML
- Python services and experiments → `ml/`
- RL, ranking, federated learning, explainable AI

#### Data
- SQL schemas → `db/`
- Warehouse assets → `warehouse/`
- Stream processing jobs → `flink/`

#### Infrastructure
- Docker / Compose → `docker/`
- Kubernetes manifests → `k8s/`
- Terraform → `infra/`
- Nginx gateway → `nginx/`

#### Web3
- Solidity contracts → `contracts/`

### 📁 Project Structure

```text
zLinebot/
├── app/            # Backend services
├── admin/          # Dashboard
├── mobile/         # Mobile app
├── ml/             # AI models
├── db/             # Database schemas
├── warehouse/      # Analytics
├── flink/          # Streaming jobs
├── contracts/      # Smart contracts
├── cloudflare/     # Edge workers
├── cloud/          # Worker services
├── docker/         # Containers
├── k8s/            # Kubernetes
├── infra/          # Terraform
├── scripts/        # Automation
├── docs/           # Documentation
└── nginx/          # Gateway
```

### ⚡ Highlights

- 🔥 Full-stack AI platform (not only a bot)
- 🧠 AI-first architecture
- 🌐 End-to-end flow: Edge → Cloud → ML → Data
- ⚙️ Modular and scalable design
- 🚀 Production-ready infrastructure path (K8s + Service Mesh)

### 🎯 Use Cases

- LINE AI Chatbot
- Recommendation System
- Automation Platform
- AI SaaS
- Web3 + AI Integration

### 🔮 Future Direction

- LLM / AI Agents
- Real-time personalization
- Privacy-preserving AI (FHE / Federated)
- Tokenized ecosystem

---

## 🇹🇭 ภาษาไทย

### 🧠 ภาพรวมแพลตฟอร์ม

zLinebot คือแพลตฟอร์ม AI แบบ Full-stack ที่รวม:

- 🤖 LINE Bot (ช่องทางสนทนาฝั่งผู้ใช้)
- ⚙️ Backend services (Node.js + TypeScript)
- 🧠 บริการ Machine Learning (Python)
- 📊 Data platform (SQL + ระบบ analytics/feature)
- 🌐 โครงสร้างพื้นฐานแบบ Cloud-native (Docker, Kubernetes, Cloudflare)
- ⛓ การเชื่อมต่อ Web3 (Smart Contracts)

### 🏗 ภาพรวมสถาปัตยกรรม

สถาปัตยกรรมใช้งานแบบครบวงจรตั้งแต่ผู้ใช้บน LINE ผ่าน Edge ไปยัง backend, ML, data pipeline และ infrastructure สำหรับ production ตามแผนภาพด้านบน.

### 🛠 เทคสแตก

#### Backend
- Node.js (TypeScript) → `app/`
- Cloudflare Workers → `cloudflare/`

#### Frontend
- Admin Dashboard (Vite/React) → `admin/`
- Mobile App (React Native) → `mobile/`

#### AI / ML
- Python services และงานทดลองโมเดล → `ml/`
- รองรับ RL, ranking, federated learning, explainable AI

#### Data
- SQL schemas → `db/`
- งาน warehouse → `warehouse/`
- งาน stream processing → `flink/`

#### Infrastructure
- Docker / Compose → `docker/`
- Kubernetes → `k8s/`
- Terraform → `infra/`
- Nginx → `nginx/`

#### Web3
- Solidity → `contracts/`

### ⚡ จุดเด่น

- 🔥 เป็นแพลตฟอร์ม AI แบบ Full-stack (ไม่ใช่แค่ bot)
- 🧠 วางสถาปัตยกรรมแบบ AI-first
- 🌐 ครบทั้ง Edge → Cloud → ML → Data
- ⚙️ โครงสร้างแยกส่วน ช่วยให้ขยายระบบได้ง่าย
- 🚀 พร้อมต่อยอดสู่ production (K8s + Service Mesh)

### 🎯 ตัวอย่างการใช้งาน

- LINE AI Chatbot
- Recommendation System
- Automation Platform
- AI SaaS
- Web3 + AI Integration

### 🔮 ทิศทางในอนาคต

- LLM / AI Agents
- การทำ personalization แบบ real-time
- Privacy AI (FHE / Federated)
- ระบบนิเวศแบบ tokenized

---

## 📚 Additional Documentation

- Thai docs entry: [docs/README_th.md](docs/README_th.md)
- Full structure guide: [docs/REPO_STRUCTURE.md](docs/REPO_STRUCTURE.md)
- Installation guide: [docs/INSTALL_FULL.md](docs/INSTALL_FULL.md)
- Product proposal: [docs/PROPOSAL_FULL.md](docs/PROPOSAL_FULL.md)
- Master CI/CD guide: [docs/CI_CD_MASTER_META.md](docs/CI_CD_MASTER_META.md)

---

## 📄 License

MIT License
