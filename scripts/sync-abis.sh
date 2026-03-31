#!/usr/bin/env bash
# sync-abis.sh — copy compiled ABI artifacts from Foundry output into the subgraph ABI directory.
# Run after `forge build` (or `make contracts`).
set -euo pipefail

CONTRACTS_OUT="packages/contracts/out"
SUBGRAPH_ABIS="subgraph/abis"

if [ ! -d "$CONTRACTS_OUT" ]; then
  echo "ERROR: Foundry output directory '$CONTRACTS_OUT' not found. Run 'forge build' first." >&2
  exit 1
fi

echo "Syncing ABIs from $CONTRACTS_OUT → $SUBGRAPH_ABIS"

for contract in ArenaFactory ArenaMarket ArenaRegistry; do
  src="$CONTRACTS_OUT/${contract}.sol/${contract}.json"
  dst="$SUBGRAPH_ABIS/${contract}.json"
  if [ ! -f "$src" ]; then
    echo "WARNING: $src not found — skipping $contract" >&2
    continue
  fi
  # Extract only the 'abi' array from the Foundry artifact JSON
  node -e "
    const fs = require('fs');
    const artifact = JSON.parse(fs.readFileSync('$src', 'utf8'));
    fs.writeFileSync('$dst', JSON.stringify(artifact.abi, null, 2) + '\n');
  "
  echo "  $contract OK"
done

echo "ABI sync complete."
