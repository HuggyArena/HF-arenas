.PHONY: bootstrap install forge-deps prisma build typecheck contracts subgraph relayer indexer

bootstrap: install forge-deps prisma contracts build

install:
	pnpm install

forge-deps:
	cd packages/contracts && forge install foundry-rs/forge-std --no-git \
	  && forge install OpenZeppelin/openzeppelin-contracts --no-git \
	  && forge install OpenZeppelin/openzeppelin-contracts-upgradeable --no-git

prisma:
	pnpm prisma:generate

build:
	pnpm build

typecheck:
	pnpm typecheck

contracts:
	pnpm contracts:build

subgraph:
	pnpm subgraph:build

relayer:
	pnpm relayer:dev

indexer:
	pnpm indexer:dev
