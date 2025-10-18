# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g turbo

# Development stage
FROM base AS development
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/auth-service ./apps/auth-service
RUN npm install
EXPOSE 3002
CMD ["npm", "run", "dev", "--workspace=auth-service"]

# Build stage
FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo run build --filter=auth-service

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache netcat-openbsd
COPY --from=builder /app/apps/auth-service/dist ./dist
COPY --from=builder /app/apps/auth-service/migrations ./migrations
COPY --from=builder /app/apps/auth-service/src/config ./src/config
COPY --from=builder /app/apps/auth-service/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY apps/auth-service/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
EXPOSE 3002
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]

