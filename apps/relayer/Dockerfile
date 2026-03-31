FROM node:20-alpine AS base
RUN npm install -g pnpm@9.12.3

# --- deps stage ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY packages/shared-prisma/package.json packages/shared-prisma/
COPY prisma/package.json prisma/
COPY apps/relayer/package.json apps/relayer/
RUN pnpm install --frozen-lockfile

# --- prisma generate ---
FROM deps AS prisma
WORKDIR /app
COPY prisma/ prisma/
COPY packages/shared-prisma/ packages/shared-prisma/
RUN pnpm --dir prisma run generate

# --- build stage ---
FROM prisma AS builder
WORKDIR /app
COPY tsconfig.base.json ./
COPY packages/shared-prisma/ packages/shared-prisma/
COPY apps/relayer/ apps/relayer/
RUN pnpm --dir packages/shared-prisma run build
RUN pnpm --dir apps/relayer run build

# --- runtime stage ---
FROM node:20-alpine AS runner
RUN npm install -g pnpm@9.12.3
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared-prisma/dist ./packages/shared-prisma/dist
COPY --from=builder /app/packages/shared-prisma/package.json ./packages/shared-prisma/package.json
COPY --from=builder /app/apps/relayer/dist ./apps/relayer/dist
COPY --from=builder /app/apps/relayer/package.json ./apps/relayer/package.json
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=prisma /app/node_modules/@prisma ./node_modules/@prisma

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "apps/relayer/dist/main.js"]
