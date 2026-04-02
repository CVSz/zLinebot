FROM node:20-alpine AS builder
WORKDIR /app

ENV ONNXRUNTIME_NODE_INSTALL=skip

COPY app/package*.json ./
RUN npm ci --ignore-scripts

COPY app/. ./
RUN npm run build && npm prune --omit=dev --ignore-scripts

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER node
CMD ["npm", "run", "worker"]
