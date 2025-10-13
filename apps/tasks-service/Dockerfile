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
COPY apps/tasks-service ./apps/tasks-service
RUN npm install
EXPOSE 3003
CMD ["npm", "run", "dev", "--workspace=tasks-service"]

# Build stage
FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo run build --filter=tasks-service

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/apps/tasks-service/dist ./dist
COPY --from=builder /app/apps/tasks-service/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3003
CMD ["node", "dist/main"]

