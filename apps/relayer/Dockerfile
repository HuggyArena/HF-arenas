FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* tsconfig.base.json ./

# Copy package manifests for dependency resolution
COPY packages/shared-prisma/package.json packages/shared-prisma/
COPY prisma/package.json prisma/
COPY apps/relayer/package.json apps/relayer/

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts 2>/dev/null || pnpm install --no-frozen-lockfile

# Copy Prisma schema and generate client
COPY prisma/schema.prisma prisma/
RUN pnpm --dir prisma exec prisma generate

# Copy source code
COPY packages/shared-prisma/ packages/shared-prisma/
COPY apps/relayer/ apps/relayer/

# Build shared-prisma first, then relayer
RUN pnpm --dir packages/shared-prisma run build
RUN pnpm --dir apps/relayer run build

# --- Production stage ---
FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/relayer/dist ./apps/relayer/dist
COPY --from=base /app/apps/relayer/package.json ./apps/relayer/
COPY --from=base /app/packages/shared-prisma/dist ./packages/shared-prisma/dist
COPY --from=base /app/packages/shared-prisma/package.json ./packages/shared-prisma/
COPY --from=base /app/prisma/schema.prisma ./prisma/
COPY --from=base /app/package.json ./

EXPOSE 3001
CMD ["node", "apps/relayer/dist/main.js"]
