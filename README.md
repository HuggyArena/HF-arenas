# HF-arenas

HF arenas — crypto-native prediction markets for Hugging Face models, datasets, and Spaces.

## What this repo is

THE ARENA // HF TOP is a compile-ready monorepo for:
- Solidity market contracts (Foundry)
- NestJS relayer and compliance services
- Indexer / subgraph scaffolding
- Prisma schema and migrations
- Production config examples
- Operational and audit handoff docs

## Current status

Pre-production engineering scaffold. Useful for implementation, review, and build-out, but not a substitute for:
- successful compilation and tests
- external smart contract audit
- jurisdiction-specific legal review
- production secrets management and deployment hardening

## Included

- `apps/relayer` — NestJS gasless relay, EIP-712 oracle signing, Gelato ERC2771, compliance
- `apps/indexer` — NestJS subgraph sync service
- `packages/contracts` — Solidity (Foundry): ArenaRegistry, ArenaFactory, ArenaMarket
- `packages/shared-prisma` — shared NestJS Prisma module
- `prisma` — schema and migrations
- `subgraph` — The Graph subgraph
- `config` — Docker Compose and OpenAPI
- `docs` — next steps and audit handoff
- `scripts` — ABI sync and subgraph preparation helpers

## Fee defaults

| Fee type         | BPS  | Percentage |
|-----------------|------|------------|
| Protocol        | 275  | 2.75%      |
| Creator         | 100  | 1.00%      |
| Referral        | 50   | 0.50%      |
| Dispute reserve | 75   | 0.75%      |
| **Total**       | **500** | **5.00%** |

## Quick start

### Prerequisites

- [pnpm](https://pnpm.io) ≥ 9
- [Foundry](https://book.getfoundry.sh/) (`curl -L https://foundry.paradigm.xyz | bash && foundryup`)
- Node.js ≥ 20
- PostgreSQL ≥ 15

### 1. Bootstrap

```bash
cp .env.example .env
# IMPORTANT: Replace every REPLACE_WITH_* placeholder with real values before starting services.
# Fill in DATABASE_URL, RPC_URL, ORACLE_PRIVATE_KEY, GELATO_API_KEY, etc.

make bootstrap
# Runs: install → forge-deps → prisma generate → contracts build → abi-sync → TS build
```

### 2. Database

```bash
# Run migrations
pnpm --dir prisma run migrate:deploy
```

### 3. Run services

```bash
# Terminal 1 – Relayer (port 3001)
make relayer

# Terminal 2 – Indexer (port 3002)
make indexer
```

Swagger UI: http://localhost:3001/api/docs

### 4. Contracts

```bash
# Build
pnpm contracts:build

# Test
pnpm contracts:test
```

### 5. Subgraph

After deploying contracts, set addresses in `.env`:
```bash
REGISTRY_ADDRESS=0x...
FACTORY_ADDRESS=0x...
START_BLOCK=12345678
```

Then:
```bash
make subgraph          # prepares yaml + builds
pnpm subgraph:codegen  # regenerate AssemblyScript bindings after schema changes
```

### 6. Docker (production)

```bash
docker compose -f config/docker-compose.production.yaml up
```

## Next steps before mainnet

1. External smart contract audit
2. Legal localization (per jurisdiction)
3. Multisig setup for admin/treasury keys
4. Secrets management (KMS / vault)
5. Monitoring and alerting
6. Sumsub and TRM staging integration tests
