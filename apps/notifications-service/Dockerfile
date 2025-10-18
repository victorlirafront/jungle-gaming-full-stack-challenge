# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g turbo

# Development stage
FROM base AS development
WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/notifications-service ./apps/notifications-service
RUN npm install
EXPOSE 3004
CMD ["npm", "run", "dev", "--workspace=notifications-service"]

# Build stage
FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo run build --filter=notifications-service

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache netcat-openbsd
COPY --from=builder /app/apps/notifications-service/dist ./dist
COPY --from=builder /app/apps/notifications-service/migrations ./migrations
COPY --from=builder /app/apps/notifications-service/src/config ./src/config
COPY --from=builder /app/apps/notifications-service/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY apps/notifications-service/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
EXPOSE 3004
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]

