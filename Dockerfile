FROM node:26-alpine AS builder
WORKDIR /app
ENV ONNXRUNTIME_NODE_INSTALL=skip
COPY app/package*.json ./
RUN npm install --ignore-scripts
COPY app/ ./
RUN npm run build && npm prune --omit=dev --ignore-scripts

FROM node:26-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY app/package*.json ./

EXPOSE 3000
USER node
CMD ["npm", "start"]
