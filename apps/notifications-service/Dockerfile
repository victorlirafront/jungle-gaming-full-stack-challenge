# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g turbo

# Dependencies stage - install production dependencies with optimized cache layers
FROM base AS dependencies
WORKDIR /app
RUN apk add --no-cache python3 make g++

# Copy only package files first for better cache utilization
COPY package*.json ./
COPY turbo.json ./
COPY packages/package*.json ./packages/
COPY apps/notifications-service/package*.json ./apps/notifications-service/

# Install dependencies (this layer will be cached if package files don't change)
RUN npm ci --only=production --workspace=notifications-service && npm cache clean --force

# Copy remaining packages files after dependency installation
COPY packages ./packages

# Development stage with optimized cache layers
FROM base AS development
WORKDIR /app

# Copy only package files first for better cache utilization
COPY package*.json ./
COPY turbo.json ./
COPY packages/package*.json ./packages/
COPY apps/notifications-service/package*.json ./apps/notifications-service/

# Install all dependencies (dev + prod) - this layer will be cached
RUN npm install

# Copy remaining files after dependency installation
COPY packages ./packages
COPY apps/notifications-service ./apps/notifications-service

EXPOSE 3004
CMD ["npm", "run", "dev", "--workspace=notifications-service"]

# Build stage with optimized cache layers
FROM base AS builder
WORKDIR /app

# Copy package files first for dependency caching
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/notifications-service/package*.json ./apps/notifications-service/

# Install dependencies for build
RUN npm ci

# Copy source code after dependencies are installed
COPY apps/notifications-service ./apps/notifications-service

# Build the application
RUN turbo run build --filter=notifications-service

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
COPY --from=dependencies /app/apps/notifications-service/node_modules ./apps/notifications-service/node_modules

# Copy built application and necessary files
COPY --from=builder /app/apps/notifications-service/dist ./dist
COPY --from=builder /app/apps/notifications-service/migrations ./migrations
COPY --from=builder /app/apps/notifications-service/src/config ./src/config
COPY --from=builder /app/apps/notifications-service/package*.json ./

# Copy and setup entrypoint
COPY apps/notifications-service/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3004
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]

