.PHONY: install prisma build typecheck contracts subgraph relayer indexer mode-play mode-real

install:
	pnpm install

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

## ── Environment mode switching ──────────────────────────────────────────────
## mode-play: switch to Play Money (testnet/demo) mode.
##   Copies .env.play → .env, creating .env.play from defaults if it doesn't exist.
mode-play:
	@if [ ! -f .env.play ]; then \
		echo "Creating default .env.play from .env.example…"; \
		cp .env.example .env.play; \
		grep -qxF 'ENABLE_FAUCET=true' .env.play || echo 'ENABLE_FAUCET=true' >> .env.play; \
	fi
	@grep -q '^ENABLE_FAUCET=' .env.play && \
		sed -i 's/^ENABLE_FAUCET=.*/ENABLE_FAUCET=true/' .env.play || \
		echo 'ENABLE_FAUCET=true' >> .env.play
	cp .env.play .env
	@echo "✅  Switched to PLAY MONEY mode (faucet enabled)."

## mode-real: switch to Real Money (mainnet) mode.
##   Copies .env.real → .env, creating .env.real from defaults if it doesn't exist.
mode-real:
	@if [ ! -f .env.real ]; then \
		echo "Creating default .env.real from .env.example…"; \
		cp .env.example .env.real; \
		grep -qxF 'ENABLE_FAUCET=false' .env.real || echo 'ENABLE_FAUCET=false' >> .env.real; \
	fi
	@grep -q '^ENABLE_FAUCET=' .env.real && \
		sed -i 's/^ENABLE_FAUCET=.*/ENABLE_FAUCET=false/' .env.real || \
		echo 'ENABLE_FAUCET=false' >> .env.real
	cp .env.real .env
	@echo "✅  Switched to REAL MONEY mode (faucet disabled)."
