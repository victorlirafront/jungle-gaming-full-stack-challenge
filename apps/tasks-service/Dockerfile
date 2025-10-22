# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g turbo

# Dependencies stage - install production dependencies only
FROM base AS dependencies
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/tasks-service/package*.json ./apps/tasks-service/
RUN npm ci --only=production --workspace=tasks-service && npm cache clean --force

# Development stage
FROM base AS development
WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/tasks-service ./apps/tasks-service
RUN npm install
EXPOSE 3003
CMD ["npm", "run", "dev", "--workspace=tasks-service"]

# Build stage
FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo run build --filter=tasks-service

# Production stage - optimized for size and security
FROM node:20-alpine AS production
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Install only production dependencies
RUN apk add --no-cache netcat-openbsd

# Copy production dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/tasks-service/node_modules ./apps/tasks-service/node_modules

# Copy built application and necessary files
COPY --from=builder /app/apps/tasks-service/dist ./dist
COPY --from=builder /app/apps/tasks-service/migrations ./migrations
COPY --from=builder /app/apps/tasks-service/src/config ./src/config
COPY --from=builder /app/apps/tasks-service/package*.json ./

# Copy and setup entrypoint
COPY apps/tasks-service/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3003
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]

