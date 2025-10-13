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
COPY apps/api-gateway ./apps/api-gateway
RUN npm install
EXPOSE 3001
CMD ["npm", "run", "dev", "--workspace=api-gateway"]

# Build stage
FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo run build --filter=api-gateway

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=builder /app/apps/api-gateway/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/main"]

