# syntax=docker/dockerfile:1
# Build context must be the monorepo root:
#   docker build -f apps/indexer/Dockerfile .

FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# ── deps stage: install all workspace dependencies ───────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps/indexer/package.json apps/indexer/
COPY packages/shared-prisma/package.json packages/shared-prisma/
COPY prisma/package.json prisma/
RUN pnpm install --frozen-lockfile --ignore-scripts

# ── builder stage: compile everything the indexer needs ──────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/indexer/node_modules apps/indexer/node_modules
COPY --from=deps /app/packages/shared-prisma/node_modules packages/shared-prisma/node_modules
COPY --from=deps /app/prisma/node_modules prisma/node_modules
COPY . .
# Generate Prisma client and build workspace packages in dependency order
RUN pnpm prisma:generate
RUN pnpm --filter @arena/shared-prisma run build
RUN pnpm --dir apps/indexer run build

# ── runner stage: minimal production image ───────────────────────────────────
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy only what is required to run the compiled NestJS app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/indexer/node_modules ./apps/indexer/node_modules
COPY --from=builder /app/apps/indexer/dist ./apps/indexer/dist
COPY --from=builder /app/packages/shared-prisma/dist ./packages/shared-prisma/dist
COPY --from=builder /app/packages/shared-prisma/node_modules ./packages/shared-prisma/node_modules
COPY --from=builder /app/prisma ./prisma

WORKDIR /app/apps/indexer
EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3002/api/health || exit 1

CMD ["node", "dist/main.js"]
