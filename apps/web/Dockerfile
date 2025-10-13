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
COPY apps/web ./apps/web
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev", "--workspace=web"]

# Build stage
FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo run build --filter=web

# Production stage
FROM nginx:alpine AS production
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]

