# Compile-ready next steps

## 1. Install dependencies
- `pnpm install` (or `make bootstrap` for full setup)
- Install Foundry dependencies for `packages/contracts`:
  ```bash
  cd packages/contracts
  forge install openzeppelin/openzeppelin-contracts openzeppelin/openzeppelin-contracts-upgradeable foundry-rs/forge-std
  ```

## 2. Database
- Set `DATABASE_URL` in `.env`
- Run `pnpm prisma:generate`
- Run `pnpm prisma:migrate`

## 3. Contracts
- Run `make contracts` (or `pnpm contracts:build`)
- Run `make contracts-test` (or `pnpm contracts:test`)

## 4. Backend
- Type-check relayer and indexer: `make typecheck`
- Wire real env vars (replace all `REPLACE_WITH_*` values)
- Test Sumsub and sanctions adapters in staging

## 5. Subgraph
- Replace placeholder addresses and start blocks in `subgraph/subgraph.yaml`
- Refresh ABI JSON files from compiled artifacts
- Run `pnpm subgraph:codegen && pnpm subgraph:build`

## 6. Release gating
- External contract audit
- Legal localization
- Secrets / KMS / multisig setup
- Gelato relay funding
- Production monitoring and alerting
