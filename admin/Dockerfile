FROM node:20-alpine AS builder
WORKDIR /admin
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /admin
COPY --from=builder --chown=node:node /admin/package*.json ./
COPY --from=builder --chown=node:node /admin/node_modules ./node_modules
COPY --from=builder --chown=node:node /admin/dist ./dist
USER node
ENV NODE_ENV=production
EXPOSE 5173
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]
