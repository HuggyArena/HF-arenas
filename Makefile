.PHONY: bootstrap install forge-deps prisma build typecheck contracts abi-sync subgraph relayer indexer

## Full first-time setup: install all deps, generate Prisma client, compile contracts, sync ABIs, build TS
bootstrap: install forge-deps prisma contracts abi-sync build

install:
	pnpm install

## Install Foundry / forge library dependencies
forge-deps:
	cd packages/contracts && forge install

prisma:
	pnpm prisma:generate

build:
	pnpm build

typecheck:
	pnpm typecheck

contracts:
	pnpm contracts:build

## Sync compiled ABI artifacts from Foundry output into subgraph/abis/
abi-sync: contracts
	bash scripts/sync-abis.sh

## Prepare subgraph.yaml from template (set REGISTRY_ADDRESS, FACTORY_ADDRESS, START_BLOCK env vars)
subgraph-prepare:
	bash scripts/prepare-subgraph.sh

subgraph: abi-sync subgraph-prepare
	pnpm subgraph:build

relayer:
	pnpm relayer:dev

indexer:
	pnpm indexer:dev

