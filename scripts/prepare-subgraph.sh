#!/usr/bin/env bash
# prepare-subgraph.sh — substitute deployed contract addresses and start blocks into subgraph.yaml.
# Reads from environment variables or .env file in repo root.
# Usage: REGISTRY_ADDRESS=0x... FACTORY_ADDRESS=0x... START_BLOCK=12345678 bash scripts/prepare-subgraph.sh
set -euo pipefail

# Load .env if present (does not override already-exported vars)
if [ -f .env ]; then
  set -o allexport
  # shellcheck disable=SC1091
  source .env
  set +o allexport
fi

REGISTRY_ADDRESS="${REGISTRY_ADDRESS:-0x0000000000000000000000000000000000000000}"
FACTORY_ADDRESS="${FACTORY_ADDRESS:-0x0000000000000000000000000000000000000000}"
START_BLOCK="${START_BLOCK:-0}"
NETWORK="${NETWORK:-polygon}"

# --- Validate inputs ---
ETH_ADDR_REGEX='^0x[0-9a-fA-F]{40}$'
if ! echo "$REGISTRY_ADDRESS" | grep -qE "$ETH_ADDR_REGEX"; then
  echo "ERROR: REGISTRY_ADDRESS is not a valid Ethereum address: $REGISTRY_ADDRESS" >&2
  exit 1
fi
if ! echo "$FACTORY_ADDRESS" | grep -qE "$ETH_ADDR_REGEX"; then
  echo "ERROR: FACTORY_ADDRESS is not a valid Ethereum address: $FACTORY_ADDRESS" >&2
  exit 1
fi
if ! echo "$START_BLOCK" | grep -qE '^[0-9]+$'; then
  echo "ERROR: START_BLOCK must be a non-negative integer: $START_BLOCK" >&2
  exit 1
fi

TEMPLATE="subgraph/subgraph.template.yaml"
OUTPUT="subgraph/subgraph.yaml"

if [ ! -f "$TEMPLATE" ]; then
  echo "ERROR: Template $TEMPLATE not found. Create it first or set addresses manually in subgraph.yaml." >&2
  exit 1
fi

sed \
  -e "s|{{REGISTRY_ADDRESS}}|$REGISTRY_ADDRESS|g" \
  -e "s|{{FACTORY_ADDRESS}}|$FACTORY_ADDRESS|g" \
  -e "s|{{START_BLOCK}}|$START_BLOCK|g" \
  -e "s|{{NETWORK}}|$NETWORK|g" \
  "$TEMPLATE" > "$OUTPUT"

echo "Wrote $OUTPUT"
echo "  Registry:  $REGISTRY_ADDRESS"
echo "  Factory:   $FACTORY_ADDRESS"
echo "  StartBlock: $START_BLOCK"
echo "  Network:   $NETWORK"
