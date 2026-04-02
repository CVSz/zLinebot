FROM node:20-alpine AS builder
WORKDIR /app
COPY . .

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder --chown=node:node /app ./
USER node
ENV NODE_ENV=production
CMD ["node", "worker.js"]
