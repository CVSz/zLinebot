# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app

ENV ONNXRUNTIME_NODE_INSTALL=skip

COPY package*.json ./
RUN npm install --ignore-scripts

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && adduser -S -u 1001 -G nodejs node

COPY --from=builder --chown=node:nodejs /app/package*.json ./
COPY --from=builder --chown=node:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=node:nodejs /app/dist ./dist

EXPOSE 3000

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["npm", "start"]
