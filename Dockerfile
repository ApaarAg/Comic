# Multi-stage Dockerfile for Storyverse 4.0
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build client bundle
COPY . .
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install runtime dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm install -g tsx

# Copy built assets, static public folder, and express server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.ts ./server.ts

EXPOSE 3000

USER node

CMD ["tsx", "server.ts"]
