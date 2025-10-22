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
COPY apps/api-gateway/package*.json ./apps/api-gateway/
RUN npm ci --only=production --workspace=api-gateway && npm cache clean --force

# Development stage
FROM base AS development
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/api-gateway ./apps/api-gateway
RUN npm install
EXPOSE 3001
CMD ["npm", "run", "dev", "--workspace=api-gateway"]

# Build stage
FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo run build --filter=api-gateway

# Production stage - optimized for size and security
FROM node:20-alpine AS production
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy production dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/api-gateway/node_modules ./apps/api-gateway/node_modules

# Copy built application and necessary files
COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=builder /app/apps/api-gateway/package*.json ./

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3001
CMD ["node", "dist/main"]

