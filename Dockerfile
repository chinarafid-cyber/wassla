# syntax=docker/dockerfile:1

FROM node:24-alpine AS base

# ---------------------------------------------------------------------------
# deps: install dependencies with a clean, reproducible lockfile install
# ---------------------------------------------------------------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
# Cache mount survives across builds, so a transient registry hiccup on a
# clean image only costs the retry once — later builds mostly hit cache.
RUN --mount=type=cache,target=/root/.npm \
  npm ci --no-audit --fund=false

# ---------------------------------------------------------------------------
# builder: generate the Prisma client and produce the standalone Next.js build
# ---------------------------------------------------------------------------
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# `next build` imports @/lib/env while collecting page data (to determine
# each route's static/dynamic shape), which runs its Zod validation eagerly.
# No route is statically prerendered here (every page needs a live session
# or database access), so nothing actually connects with these values — they
# only need to satisfy the schema shape. Real secrets are injected at
# container runtime instead, via docker-compose's `environment:` block.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV REDIS_URL="redis://localhost:6379"
ENV JWT_ACCESS_SECRET="build-time-placeholder-value-not-used-at-runtime-x"
ENV JWT_REFRESH_SECRET="build-time-placeholder-value-not-used-at-runtime-y"
ENV SMS_PROVIDER=twilio
ENV TWILIO_ACCOUNT_SID=build-time-placeholder
ENV TWILIO_AUTH_TOKEN=build-time-placeholder
ENV TWILIO_FROM_NUMBER=build-time-placeholder

RUN npx prisma generate
RUN npm run build

# ---------------------------------------------------------------------------
# runner: minimal production image, runs as a non-root user
# ---------------------------------------------------------------------------
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
