.PHONY: bootstrap install forge-deps prisma contracts abi-sync subgraph build \
        typecheck lint test relayer indexer docker-build docker-up docker-down \
        migrate

# Full local bootstrap — run once after cloning.
# Requires: Node ≥ 20, pnpm 9, Foundry (forge/cast).
bootstrap: install forge-deps prisma contracts subgraph build

install:
	pnpm install

forge-deps:
	cd packages/contracts && forge install

prisma:
	pnpm prisma:generate

contracts:
	pnpm contracts:build

contracts-test:
	pnpm contracts:test

abi-sync:
	bash scripts/sync-abis.sh

subgraph: abi-sync
	pnpm subgraph:codegen
	pnpm subgraph:build

build:
	pnpm build

typecheck:
	pnpm typecheck

lint:
	pnpm lint

test:
	pnpm test

relayer:
	pnpm relayer:dev

indexer:
	pnpm indexer:dev

# Database migrations (requires DATABASE_URL)
migrate:
	pnpm prisma:migrate

# Docker helpers (build context = monorepo root)
docker-build:
	docker build -f apps/relayer/Dockerfile -t arena-relayer:local .
	docker build -f apps/indexer/Dockerfile -t arena-indexer:local .

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down
