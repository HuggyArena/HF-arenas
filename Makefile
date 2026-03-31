.PHONY: install prisma build typecheck contracts subgraph relayer indexer \
       test bootstrap docker-up docker-down clean

# ─── Bootstrap ───────────────────────────────────────────────────────
bootstrap: install prisma build
	@echo "✔ Bootstrap complete"

install:
	pnpm install

prisma:
	pnpm prisma:generate

# ─── Build / Check ──────────────────────────────────────────────────
build:
	pnpm build

typecheck:
	pnpm typecheck

test:
	pnpm test

contracts:
	pnpm contracts:build

contracts-test:
	pnpm contracts:test

subgraph:
	pnpm subgraph:build

# ─── Dev Servers ─────────────────────────────────────────────────────
relayer:
	pnpm relayer:dev

indexer:
	pnpm indexer:dev

# ─── Docker ──────────────────────────────────────────────────────────
docker-up:
	docker compose -f config/docker-compose.production.yaml up -d --build

docker-down:
	docker compose -f config/docker-compose.production.yaml down

# ─── Housekeeping ────────────────────────────────────────────────────
clean:
	rm -rf node_modules apps/*/dist packages/*/dist .turbo
