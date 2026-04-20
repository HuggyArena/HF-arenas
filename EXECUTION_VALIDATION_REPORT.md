# Execution Validation Report

**Project:** HF-arenas — Prediction Markets for Hugging Face Models  
**Repository:** `cyberblicc-sketch/HF-arenas`  
**Report Date:** 2026-04-01  
**Status:** Pre-Production Engineering Scaffold

---

## Executive Summary

HF-arenas is a compile-ready monorepo delivering crypto-native prediction markets for Hugging Face models, datasets, and Spaces. This report summarizes the validated state of the codebase across contract logic, backend services, build pipeline, compliance infrastructure, and deployment readiness. All core components are structurally complete. Production go-live requires successful compilation, external smart contract audit, legal review, and secrets management hardening.

---

## Repository Structure

| Component | Path | Description |
|-----------|------|-------------|
| Relayer API | `apps/relayer` | NestJS gasless relay, signature, and compliance service |
| Indexer | `apps/indexer` | NestJS on-chain event sync service |
| Smart Contracts | `packages/contracts` | Solidity 0.8.26 market contracts (Foundry) |
| Shared Prisma | `packages/shared-prisma` | Shared database client and generated types |
| Database Schema | `prisma` | Prisma schema and migrations |
| Subgraph | `subgraph` | The Graph indexing layer |
| Config | `config` | Production Docker Compose and OpenAPI spec |
| Docs | `docs` | Operational and handoff documentation |

---

## Build Pipeline

### Bootstrap Sequence

| Step | Command | Status |
|------|---------|--------|
| Install dependencies | `pnpm install` | Required |
| Generate Prisma client | `pnpm prisma:generate` | Required |
| Build contracts | `pnpm contracts:build` | Required |
| Build all packages | `pnpm build` | Required |
| Type-check all packages | `pnpm typecheck` | Required |
| Build subgraph | `pnpm subgraph:build` | Required |

Full bootstrap shortcut: `make bootstrap`

### CI/CD Pipeline

Continuous integration runs on every push and pull request via GitHub Actions with two parallel job groups:

**App Checks**
- `pnpm install`
- `pnpm run lint`
- `pnpm run typecheck`

**Contracts Checks**
- `forge install` (OpenZeppelin, forge-std)
- `forge build --root packages/contracts`
- `forge test --root packages/contracts -v`

All CI checks must pass before a pull request can be merged.

---

## Smart Contracts

### Contracts Validated

| Contract | File | Notes |
|----------|------|-------|
| `ArenaRegistry` | `src/ArenaRegistry.sol` | Fee management, role access, treasury timelock |
| `ArenaFactory` | `src/ArenaFactory.sol` | Market deployment via beacon proxy |
| `ArenaMarket` | `src/ArenaMarket.sol` | Core market logic |
| `IRegistry` | `src/IRegistry.sol` | Registry interface |

### Fee Schedule

| Fee Type | Rate (bps) | Rate (%) |
|----------|-----------|----------|
| Protocol fee | 275 | 2.75% |
| Creator fee | 100 | 1.00% |
| Referral fee | 50 | 0.50% |
| Dispute reserve | 75 | 0.75% |
| **Total default** | **500** | **5.00%** |

- Maximum fee cap: `MAX_FEE_BPS = 5000` (50%)
- Fee changes are subject to a 2-day timelock
- Treasury changes are subject to a 2-day timelock

### Role Access Control

| Role | Constant | Purpose |
|------|----------|---------|
| `OPERATOR_ROLE` | `keccak256("OPERATOR_ROLE")` | Administrative operations |
| `ORACLE_ROLE` | `keccak256("ORACLE_ROLE")` | Market resolution |
| `CREATOR_ROLE` | `keccak256("CREATOR_ROLE")` | Market creation |

### Bet Parameters (Defaults)

| Parameter | Value |
|-----------|-------|
| Creator bond | 500 USDC |
| Challenge bond | 10 USDC |
| Minimum bet | 1 USDC |
| Maximum bet | 100,000 USDC |

### Solidity Target

- Compiler: `0.8.26`
- Framework: Foundry
- Dependencies: OpenZeppelin Contracts, OpenZeppelin Upgradeable, forge-std

---

## Backend Services

### Relayer API (`apps/relayer`)

- Framework: NestJS
- API version: 1.3.0
- Base path: `/api`
- Swagger docs: `/api/docs`
- Default port: `3001`

**Security hardening applied:**
- Helmet middleware (HTTP security headers)
- Global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, and `transform` enabled
- Bearer authentication on all protected routes

**Required environment variables at startup:**
- `DATABASE_URL`
- `RPC_URL`
- `ORACLE_PRIVATE_KEY`
- `USDC_ADDRESS`
- `GELATO_API_KEY`

### Indexer (`apps/indexer`)

- Framework: NestJS
- Function: On-chain event synchronization to database

---

## Compliance Infrastructure

### Sanctions Screening

The compliance system operates on a **fail-closed** model: any screening failure or API error defaults to `HIGH` risk and blocks the request.

| Behavior | Description |
|----------|-------------|
| Cache TTL | 1 hour per address |
| Block threshold | `HIGH` or `SEVERE` risk severity |
| API error behavior | Fails closed — returns `HIGH` risk |
| Missing address | Passes guard (no address = no check) |
| Response on block | `403 ForbiddenException` |

### Webhook Security

- Signature validation: HMAC-SHA256
- Comparison: `timingSafeEqual` (constant-time, prevents timing attacks)

---

## Configuration

### Critical Placeholder Values (Must Replace Before Mainnet)

| Variable | Placeholder | Requirement |
|----------|-------------|-------------|
| `ADMIN_ADDRESS` | `0x0000000000000000000000000000000000000001` | Replace with multisig (e.g., Safe) — never a single EOA on mainnet |
| `REGISTRY_ADDRESS` | `0x0000000000000000000000000000000000000000` | Replace with deployed `ArenaRegistry` address — zero address will cause deployment failure |

### Subgraph Configuration

- Contract addresses and start blocks must be set before deployment
- ABI JSON files must be refreshed post-contract-deployment
- `subgraph/subgraph.template.yaml` is the address configuration template
- `scripts/prepare-subgraph.sh` generates `subgraph.yaml` from the template

---

## Pre-Production Checklist

### Engineering

- [ ] Successful `forge build` and `forge test` (all contract tests passing)
- [ ] `pnpm lint` and `pnpm typecheck` pass
- [ ] Prisma migrations applied to production database
- [ ] Relayer and indexer environment variables set and validated
- [ ] Subgraph deployed against final contract addresses
- [ ] `ADMIN_ADDRESS` and `REGISTRY_ADDRESS` replaced with production values
- [ ] Sumsub and sanctions adapters validated in staging

### Security

- [ ] External smart contract audit completed
- [ ] Secrets managed via KMS or equivalent — no plaintext keys in deployment
- [ ] `ADMIN_ADDRESS` configured as multisig (not a single EOA)
- [ ] `ORACLE_PRIVATE_KEY` stored securely; rotation policy defined
- [ ] `GELATO_API_KEY` validated at runtime construction

### Legal and Compliance

- [ ] Jurisdiction-specific legal review completed
- [ ] Terms of service and user-facing disclosures localized
- [ ] Sanctions provider (TRM/Chainalysis) live credentials provisioned

---

## Known Limitations

This repository is a compile-ready engineering scaffold. It is **not** a substitute for:

- Successful compilation and full test passage
- External smart contract audit
- Jurisdiction-specific legal review
- Production secrets management and deployment hardening

---

## Appendix: Key File Locations

| File | Purpose |
|------|---------|
| `packages/contracts/foundry.toml` | Foundry configuration (EVM version, optimizer) |
| `packages/contracts/src/ArenaRegistry.sol` | Fee schedule and role definitions |
| `prisma/schema.prisma` | Database schema |
| `subgraph/schema.graphql` | Subgraph entity schema |
| `config/docker-compose.production.yaml` | Production deployment configuration |
| `config/relayer.openapi.yaml` | Relayer OpenAPI specification |
| `.env.example` | Environment variable template |
| `docs/COMPILE_READY_NEXT_STEPS.md` | Step-by-step readiness checklist |
| `.github/workflows/ci.yml` | CI/CD pipeline definition |
