# syntax=docker/dockerfile:1

# ---- builder ----
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

WORKDIR /app

# Copy workspace manifests first for layer caching
COPY package.json pnpm-workspace.yaml ./
COPY apps/relayer/package.json apps/relayer/
COPY packages/shared-prisma/package.json packages/shared-prisma/
COPY prisma/package.json prisma/

# Install all workspace dependencies
RUN pnpm install

# Copy all source files needed for the build
COPY tsconfig.base.json ./
COPY apps/relayer/ apps/relayer/
COPY packages/shared-prisma/ packages/shared-prisma/
COPY prisma/ prisma/

# Generate Prisma client, build shared-prisma, then build the relayer
RUN pnpm prisma:generate \
 && pnpm --dir packages/shared-prisma run build \
 && pnpm --dir apps/relayer run build

# ---- runner ----
FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

WORKDIR /app

# Copy workspace manifests so pnpm can resolve workspace links
COPY package.json pnpm-workspace.yaml ./
COPY apps/relayer/package.json apps/relayer/
COPY packages/shared-prisma/package.json packages/shared-prisma/
COPY prisma/package.json prisma/

# Install production dependencies only
RUN pnpm install --prod

# Copy compiled output from builder
COPY --from=builder /app/apps/relayer/dist/ apps/relayer/dist/
COPY --from=builder /app/packages/shared-prisma/dist/ packages/shared-prisma/dist/
# Copy generated Prisma client
COPY --from=builder /app/node_modules/.prisma/ node_modules/.prisma/

EXPOSE 3001
CMD ["node", "apps/relayer/dist/main.js"]
