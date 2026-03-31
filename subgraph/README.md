# Subgraph

This subgraph indexes THE ARENA // HF TOP contracts.

Before build/deploy:
- replace placeholder addresses in `subgraph.yaml`
- set correct `startBlock` values from deployed contracts
- refresh ABI JSON files from the final compiled artifacts

Typical flow:
1. `pnpm --dir subgraph install`
2. `pnpm --dir subgraph run codegen`
3. `pnpm --dir subgraph run build`
4. deploy to Graph Studio or your chosen indexing target
