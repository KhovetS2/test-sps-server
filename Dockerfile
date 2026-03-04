# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies needed for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ---- Production stage ----
FROM node:20-alpine

WORKDIR /app

# Install dependencies for native modules rebuild
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled JS from builder
COPY --from=builder /app/dist ./dist

# Create data directory for SQLite
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Environment variables (defaults — override via docker run -e or .env)
ENV PORT=3000
ENV JWT_SECRET=sps-jwt-secret-change-in-production
ENV JWT_REFRESH_SECRET=sps-refresh-secret-change-in-production
ENV JWT_EXPIRES_IN=15m
ENV JWT_REFRESH_EXPIRES_IN=7d

CMD ["node", "dist/index.js"]
