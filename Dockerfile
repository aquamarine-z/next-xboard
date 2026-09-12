# ==============================================================================
# Multi-stage Dockerfile for next-xboard
# Optimized for minimal image size (~120MB) using Next.js Standalone mode
# ==============================================================================

FROM node:22-alpine AS base

# Install libc6-compat for alpine glibc compatibility
RUN apk add --no-cache libc6-compat

# --- Dependencies Stage ---
FROM base AS deps
WORKDIR /app

# Enable pnpm
RUN npm install -g pnpm@10.12.4

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build Stage ---
FROM base AS builder
WORKDIR /app

RUN npm install -g pnpm@10.12.4

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Arguments (Default backend URL can be overridden at build time)
ARG XBOARD_API_URL="https://cloud.aquamarinez.com"
ENV XBOARD_API_URL=${XBOARD_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Execute production build (generates .next/standalone and .next/static)
RUN pnpm build

# --- Runner Stage (Production image) ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Runtime environment variable (can be passed via `docker run -e XBOARD_API_URL=...`)
ENV XBOARD_API_URL="https://cloud.aquamarinez.com"

# Create a non-root dedicated user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone server output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
