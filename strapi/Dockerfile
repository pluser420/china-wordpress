# ---------------------------------------------------------------------------
# Strapi v4 CMS — Production Docker image
# Node 18-alpine keeps the image small while satisfying Strapi's engine range.
# ---------------------------------------------------------------------------
FROM node:18-alpine AS base

# Install libc compatibility for native modules (pg, better-sqlite3) on Alpine
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# ---------------------------------------------------------------------------
# Dependencies stage — install production dependencies only
# ---------------------------------------------------------------------------
FROM base AS deps

COPY package.json yarn.lock* package-lock.json* ./

# Prefer yarn if a lockfile is present; fall back to npm
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile --production=false; \
  elif [ -f package-lock.json ]; then npm ci; \
  else echo "No lockfile found" && exit 1; \
  fi

# ---------------------------------------------------------------------------
# Builder stage — compile TypeScript and build Strapi admin panel
# ---------------------------------------------------------------------------
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Strapi (compiles TS config + generates admin panel bundle)
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  else npm run build; \
  fi

# ---------------------------------------------------------------------------
# Production runner stage
# ---------------------------------------------------------------------------
FROM node:18-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production

# Copy compiled application and dependencies from the builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy source schemas and components — Strapi reads JSON schemas at runtime
COPY --from=builder /app/src ./src
COPY --from=builder /app/config ./config

# Public directory for uploads (bind-mounted volume in production)
RUN mkdir -p /app/public/uploads

# Strapi listens on 1337 by default
EXPOSE 1337

CMD ["node_modules/.bin/strapi", "start"]
