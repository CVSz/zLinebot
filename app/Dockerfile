FROM node:20-slim AS builder
WORKDIR /app

ENV ONNXRUNTIME_NODE_INSTALL=skip

COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

USER node
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
