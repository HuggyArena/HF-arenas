# Deployment Guide

This document describes how to build, configure, and deploy every component of the **HF-arenas** monorepo to production.

---

## Deployable components

| Component | Type | Port | Recommended host |
|---|---|---|---|
| `apps/relayer` | NestJS API (Docker) | 3001 | Railway · Fly.io · AWS ECS |
| `apps/indexer` | NestJS worker (Docker) | 3002 | Railway · Fly.io · AWS ECS |
| `packages/contracts` | Solidity (Foundry) | — | Deploy via `forge script` |
| `subgraph` | The Graph subgraph | — | The Graph Studio / Hosted Service |
| `prisma` | DB migrations | — | Run before each app deploy |

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 20 |
| pnpm | 9.12.3 |
| Foundry (`forge`) | latest |
| Docker + Compose | ≥ 24 |
| PostgreSQL | 15 |
| Redis | 7 |

---

## Environment variables

Copy and fill in the values for each service before deploying.

### Relayer (`apps/relayer/.env.example`)

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default `3001`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `CHAIN_ID` | EVM chain ID (137 = Polygon mainnet) |
| `RPC_URL` | JSON-RPC endpoint (e.g. Alchemy) |
| `USDC_ADDRESS` | USDC token address on the target chain |
| `REGISTRY_ADDRESS` | Deployed `ArenaRegistry` contract address |
| `ORACLE_PRIVATE_KEY` | Private key used to sign oracle resolutions |
| `GELATO_API_KEY` | Gelato Relay API key for gasless transactions |
| `SANCTIONS_PROVIDER` | `TRM` or `CHAINALYSIS` |
| `TRM_API_KEY` | TRM Labs API key (if `SANCTIONS_PROVIDER=TRM`) |
| `CHAINALYSIS_API_KEY` | Chainalysis API key (if using Chainalysis) |
| `SUMSUB_APP_TOKEN` | Sumsub KYC app token |
| `SUMSUB_SECRET_KEY` | Sumsub KYC secret key |

### Indexer (`apps/indexer/.env.example`)

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default `3002`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `SUBGRAPH_URL` | The Graph query endpoint for the deployed subgraph |

### Container registry secrets (GitHub Actions)

| Secret | Description |
|---|---|
| `REGISTRY_URL` | Container registry hostname (e.g. `ghcr.io/your-org`) |
| `REGISTRY_USERNAME` | Registry login username |
| `REGISTRY_PASSWORD` | Registry login password / token |

---

## Release sequence

Follow these steps **in order** on every production release:

### 1. Contracts (if changed)

```bash
# Build and test locally
make contracts
make contracts-test

# Deploy to Polygon mainnet
cd packages/contracts
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

After deployment, note the new contract addresses and update:
- `.env` / secret store: `REGISTRY_ADDRESS`, `USDC_ADDRESS`
- `subgraph/subgraph.yaml`: `source.address` + `startBlock` for each data source

### 2. Subgraph (if contracts or schema changed)

```bash
# Sync ABI files from compiled contracts
make abi-sync

# (Optional) regenerate subgraph.yaml from template with updated addresses
bash scripts/prepare-subgraph.sh

# Codegen + build
make subgraph

# Authenticate and deploy to The Graph Studio
graph auth --studio $GRAPH_STUDIO_DEPLOY_KEY
graph deploy --studio arena-hf-top
```

### 3. Database migrations

Run before deploying new app images whenever `prisma/migrations/` has changed:

```bash
DATABASE_URL=$DATABASE_URL pnpm prisma:migrate
```

Or via Docker Compose (see below).

### 4. Backend services (relayer + indexer)

Images are built and pushed automatically on merge to `main` via the GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`).  
A manual approval gate in the `production` environment must be granted before images are deployed.

To deploy manually:

```bash
# Build both images from monorepo root
docker build -f apps/relayer/Dockerfile -t arena-relayer:latest .
docker build -f apps/indexer/Dockerfile -t arena-indexer:latest .

# Push to your registry
docker push $REGISTRY_URL/arena-relayer:latest
docker push $REGISTRY_URL/arena-indexer:latest

# Rolling update on your hosting platform, e.g. Fly.io:
fly deploy --app arena-relayer --image $REGISTRY_URL/arena-relayer:latest
fly deploy --app arena-indexer --image $REGISTRY_URL/arena-indexer:latest
```

---

## Local integration with Docker Compose

A `docker-compose.yml` at the repo root runs the full stack locally:

```bash
# Copy env template and fill in required secrets
cp .env.example .env
# Edit .env ...

docker compose up --build
```

Services:
- **db** — PostgreSQL 15 on `localhost:5432`
- **redis** — Redis 7 on `localhost:6379`
- **migrate** — runs `prisma migrate deploy` and exits
- **relayer** — on `localhost:3001`
- **indexer** — on `localhost:3002`

Healthcheck endpoints:
- `GET http://localhost:3001/api/health` → `{ ok: true, service: "relayer" }`
- `GET http://localhost:3002/api/health` → `{ ok: true, service: "indexer" }`

Production compose lives at `config/docker-compose.production.yaml` and requires the full set of env vars.

---

## CI/CD pipeline

Defined in `.github/workflows/ci.yml`:

| Trigger | Jobs run |
|---|---|
| All pushes / PRs | `lint` → `build` → `test` |
| Push to `main` | + `docker-build` → `approve-deploy` (manual gate) → `deploy-relayer` + `deploy-indexer` |

The `approve-deploy` job uses a GitHub **environment** named `production`.  
Create it in **Settings → Environments → production** and add required reviewers to enforce the approval gate.

---

## Missing secrets / blockers before first production deploy

- [ ] `ORACLE_PRIVATE_KEY` — generate and store in KMS / secrets manager
- [ ] `GELATO_API_KEY` — obtain from [Gelato dashboard](https://relay.gelato.network)
- [ ] `TRM_API_KEY` or `CHAINALYSIS_API_KEY` — obtain from compliance vendor
- [ ] `SUMSUB_APP_TOKEN` + `SUMSUB_SECRET_KEY` — obtain from [Sumsub dashboard](https://sumsub.com)
- [ ] `REGISTRY_URL` / `REGISTRY_USERNAME` / `REGISTRY_PASSWORD` — set up container registry
- [ ] Real `REGISTRY_ADDRESS` — set after contracts are deployed to mainnet
- [ ] Real `SUBGRAPH_URL` — set after subgraph is deployed to The Graph Studio
- [ ] `startBlock` values in `subgraph/subgraph.yaml` — fill in block number of first contract tx
- [ ] External contract audit — required before mainnet deploy
- [ ] Legal / geo-blocking configuration for compliance module
- [ ] Set up `production` GitHub environment with required approvers

---

## Full bootstrap from a clean checkout

```bash
# 1. Install toolchain deps (Node, pnpm, Foundry)
make bootstrap   # install → forge-deps → prisma → contracts → subgraph → build

# 2. Start local stack
cp .env.example .env   # fill in values
docker compose up --build
```
