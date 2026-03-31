# HF-arenas

HF arenas — crypto-native prediction markets for Hugging Face models, datasets, and Spaces.

## What this repo is

THE ARENA // HF TOP is a compile-ready monorepo for:
- Solidity market contracts (`packages/contracts`)
- NestJS relayer and compliance services (`apps/relayer`)
- Indexer service (`apps/indexer`)
- Subgraph for The Graph Protocol (`subgraph`)
- Shared Prisma database layer (`packages/shared-prisma`, `prisma`)
- Production config and operational docs (`config`, `docs`)

## Current status

Pre-production engineering scaffold. Useful for implementation, review, and build-out, but not a substitute for:
- successful compilation and tests
- external smart contract audit
- jurisdiction-specific legal review
- production secrets management and deployment hardening

## Prerequisites

- Node.js ≥ 20
- pnpm 9.12.3+ (`corepack enable && corepack prepare pnpm@9.12.3 --activate`)
- PostgreSQL 15+ (or Docker)
- Foundry (for Solidity: `curl -L https://foundry.paradigm.xyz | bash && foundryup`)
- Docker & Docker Compose (optional, for containerised setup)

## Quick start (local)

```bash
# 1. Clone and install
git clone <repo-url> && cd HF-arenas
cp .env.example .env          # then fill in real values
make bootstrap                # pnpm install → prisma generate → build

# 2. Start Postgres (pick one)
docker compose -f config/docker-compose.production.yaml up db -d
# or use a local Postgres and set DATABASE_URL in .env

# 3. Run migrations
pnpm prisma:migrate

# 4. Compile contracts (requires Foundry + libs)
cd packages/contracts
forge install openzeppelin/openzeppelin-contracts openzeppelin/openzeppelin-contracts-upgradeable foundry-rs/forge-std
cd ../..
make contracts

# 5. Type-check everything
make typecheck

# 6. Start dev servers (separate terminals)
make relayer   # http://localhost:3001/api/docs
make indexer   # http://localhost:3002/api/health
```

## Recommended launch fee defaults

| Fee | Basis points | Percentage |
|-----|-------------|-----------|
| Protocol | 275 | 2.75% |
| Creator | 100 | 1.00% |
| Referral | 50 | 0.50% |
| Dispute reserve | 75 | 0.75% |
| **Total** | **500** | **5.00%** |

These defaults are set in `ArenaRegistry.sol` (lines 16-19) and should remain consistent across docs, contracts, and off-chain services.

## Makefile targets

| Target | Description |
|--------|-------------|
| `make bootstrap` | Install, generate Prisma client, build all |
| `make build` | Turbo build all packages/apps |
| `make typecheck` | Type-check TypeScript packages |
| `make test` | Run all test suites |
| `make contracts` | Build Solidity via Forge |
| `make contracts-test` | Run Foundry tests |
| `make subgraph` | Build subgraph |
| `make relayer` | Start relayer in dev/watch mode |
| `make indexer` | Start indexer in dev/watch mode |
| `make docker-up` | Build and start all Docker services |
| `make docker-down` | Stop Docker services |
| `make clean` | Remove build artifacts and node_modules |

## Docker

```bash
# Build and start all services (Postgres, Redis, relayer, indexer)
make docker-up

# Stop
make docker-down
```

Requires `.env` to be populated. The `docker-compose.production.yaml` overrides DATABASE_URL and REDIS_URL to use internal Docker hostnames.

## Project structure

```
HF-arenas/
├── apps/
│   ├── relayer/          NestJS relay + compliance API (port 3001)
│   └── indexer/          NestJS subgraph-to-Postgres sync (port 3002)
├── packages/
│   ├── contracts/        Solidity: ArenaRegistry, ArenaFactory, ArenaMarket
│   └── shared-prisma/    Shared PrismaModule and PrismaService
├── prisma/               Prisma schema, migrations
├── subgraph/             Graph Protocol subgraph (AssemblyScript mappings)
├── config/               docker-compose, OpenAPI spec
└── docs/                 Operational next-steps
```

## Pre-launch preflight checklist

- [ ] All Foundry tests pass (`make contracts-test`)
- [ ] TypeScript compiles cleanly (`make typecheck`)
- [ ] Prisma migrations applied successfully
- [ ] Subgraph deployed with real contract addresses (replace placeholders in `subgraph.yaml`)
- [ ] All `.env` secrets replaced with real values (no `REPLACE_WITH_*` strings)
- [ ] External smart contract audit completed
- [ ] Jurisdiction-specific legal review completed
- [ ] KMS / multisig setup for `ORACLE_PRIVATE_KEY` and `PRIVATE_KEY`
- [ ] Gelato relay sponsorship funded
- [ ] Sumsub KYC integration tested in staging
- [ ] Sanctions screening provider (TRM/Chainalysis) API keys provisioned
- [ ] Rate limiting and WAF configured for production endpoints
- [ ] Database backups and monitoring configured
