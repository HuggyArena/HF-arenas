# THE ARENA // HF TOP
## Complete Production Master File v1.1 (Refined)

**Classification:** Production-ready technical specification and implementation starter  
**Status:** Deployable starter pending final external audit and jurisdiction-specific legal review  
**Date:** March 30, 2026  
**Target Chains:** Polygon Mainnet primary, Base secondary  
**Collateral:** USDC (6 decimals)  
**Stack:** Solidity 0.8.26+, Foundry, NestJS, Prisma, PostgreSQL, Redis, The Graph, Next.js 14, Wagmi, Viem

---

## 1. Purpose

This package consolidates the protocol specification, refined code scaffold, deployment configuration, operational runbooks, and draft legal and messaging assets for **The Arena // HF TOP**, an objective-event market system focused on Hugging Face ecosystem outcomes.

This artifact set is intended for:
- engineering handoff
- security review preparation
- operations setup
- legal localization
- vendor procurement support

This is **not** a substitute for a formal smart-contract audit, penetration test, or jurisdiction-specific legal advice.

---

## 2. System Summary

The Arena // HF TOP is a creator-led, pool-based market protocol with:
- creator-bonded market creation
- objective, timestamp-based resolution
- sanctions and KYC controls where required
- gas-sponsored relay flow
- indexer and subgraph support
- web and mobile-ready frontend surfaces
- operational tooling for launch and incident response

Core modules:
1. Smart contracts
2. Relayer service
3. Compliance adapters
4. Indexing and subgraph
5. Frontend integration shell
6. Database schema and SQL bootstrap
7. Email, legal, and runbook documents
8. Deployment and environment config

---

## 3. Governing Launch Principle

MVP runs fully play-money off-chain. The production architecture is intentionally built with a pluggable settlement adapter so a later real-crypto launch can replace the internal wallet with stablecoin collateral and on-chain or regulated settlement, subject to jurisdictional compliance.

This is a **separate launch mode**, not a config toggle.

---

## 4. Launch Modes

### 4.1 MVP Launch Mode
- play-money only
- fully off-chain
- off-chain matching engine
- internal ledger as source of truth
- Hugging Face snapshot-based oracle
- admin-curated market publication
- no on-chain collateral or token settlement

### 4.2 Crypto Launch Mode
- stablecoin collateral support
- wallet connectivity or custodial balances
- KYC / AML and sanctions controls
- jurisdiction gating
- surveillance and anti-abuse systems
- on-chain or regulated settlement path

---

## 5. Smart Contract Design

### 5.1 Contract Set

- `ArenaRegistry.sol` — roles, fee policy, treasury, sanctions flags, creator bond administration
- `ArenaMarket.sol` — upgradeable market implementation with open/close/propose/challenge/finalize/void/claim/refund lifecycle
- `ArenaFactory.sol` — beacon-based market deployment and creator bond enforcement
- `Deploy.s.sol` — Foundry deployment starter
- `IRegistry.sol` — shared interface contract

### 5.2 State Model

```
DRAFT -> PENDING_APPROVAL -> OPEN -> CLOSED -> PROPOSED -> CHALLENGED -> FINALIZED
   \___________________________________________________________________-> VOIDED
```

### 5.3 Core Safety Properties

- sanctions check before market participation
- creator self-bet cap
- nonce replay protection for signed bet flow
- fee split derived from registry values
- claim-based payout pattern
- voided market refund path
- role-based oracle and operator controls

### 5.4 Contract Caveats

Mainnet use still requires:
- invariant tests
- fuzzing
- static analysis
- external audit
- timelock/multisig production wiring
- exact ERC-2771 / EIP-712 verification alignment across frontend/backend/contract

---

## 6. Backend Services

### 6.1 Relayer

NestJS service that:
- receives signed relay requests
- performs idempotency checks
- performs cached sanctions checks
- submits sponsored relay calls to Gelato-compatible infrastructure
- logs and polls task status
- provides a signature endpoint for frontend bet preparation

### 6.2 Compliance

NestJS services and guards that:
- create Sumsub applicants
- process Sumsub webhooks
- screen wallet addresses using configured sanctions provider
- cache sanctions decisions
- block requests with high-severity results

### 6.3 Indexing

A sync service pattern for:
- polling a subgraph endpoint
- upserting market state into application tables
- enabling web app reads from the application database
- supplementing direct chain reads

---

## 7. Monorepo Structure

```
/apps
  /web                 # Next.js app
  /api                 # BFF / REST / WebSocket
  /worker-hf           # HF ingest + oracle jobs (Python)
  /worker-settlement   # settlement + payouts
  /admin               # optional admin console, or fold into web

/packages
  /domain              # shared types, enums, resolver schemas
  /matching-engine     # order book + matching logic
  /ledger              # balance/accounting logic
  /settlement          # settlement adapter boundary
  /client-sdk          # typed frontend client

/prisma
  schema.prisma

/infrastructure
  docker-compose.yml
  k8s/
```

---

## 8. Recommended Stack

- **Web:** Next.js + TypeScript
- **API:** NestJS or Fastify
- **Database:** PostgreSQL
- **Cache / queue:** Redis + BullMQ
- **ORM:** Prisma
- **HF workers:** Python + huggingface_hub
- **Object storage:** S3-compatible
- **Realtime:** WebSockets
- **Observability:** OpenTelemetry + Prometheus + Grafana

---

## 9. Core Services — Build Order

1. Auth + user accounts
2. Wallet / play-money ledger
3. Market catalog
4. Admin submission/review
5. Matching engine
6. Portfolio + PnL
7. HF ingest/oracle
8. Settlement
9. Realtime streams
10. Charts / analytics

---

## 10. Shared Domain Contracts

### Enums

```typescript
export type SubjectType = 'model' | 'dataset' | 'space' | 'org' | 'user';
export type MarketType = 'threshold' | 'comparison' | 'rank' | 'state_change';
export type MarketStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'SCHEDULED'
  | 'OPEN'
  | 'TRADING_PAUSED'
  | 'LOCKED'
  | 'RESOLVING'
  | 'RESOLVED'
  | 'CANCELLED';

export type Outcome = 'YES' | 'NO' | 'CANCEL';
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'LIMIT' | 'MARKET';
```

### Resolver Schema

```typescript
const ResolverSpec = z.object({
  version: z.literal(1),
  subjectType: z.enum(['model', 'dataset', 'space', 'org', 'user']),
  subjectRef: z.string(),
  metric: z.enum([
    'downloads_total',
    'downloads_7d',
    'downloads_30d',
    'likes_total',
    'repo_exists',
    'new_repo_count_for_owner',
    'leaderboard_rank',
    'leaderboard_score',
    'model_eval_present_for_benchmark'
  ]),
  comparison: z.enum(['gt', 'gte', 'lt', 'lte', 'eq']),
  targetValue: z.union([z.number(), z.string(), z.boolean()]),
  resolveAt: z.string().datetime(),
  tieRule: z.enum(['YES', 'NO', 'CANCEL']),
  missingDataRule: z.enum(['CANCEL', 'MANUAL_REVIEW']),
  source: z.object({
    provider: z.literal('huggingface'),
    endpointType: z.enum(['hub_api', 'leaderboard_api', 'snapshot_derived'])
  })
});
```

---

## 11. Data Model and Accounting

### Ledger Principle

Even in play money, balances must not be managed as a simple mutable number. The source of truth must be a double-entry ledger.

### Ledger Accounts

- user available
- user locked
- house inventory
- house rewards
- settlement clearing
- faucet issuance

Every trade creates:
- reservation adjustments
- execution transfers
- optional fee rows

### Settlement Math

Binary payoff:
- YES share pays 1.0 if YES wins
- NO share pays 1.0 if NO wins
- losing side pays 0
- cancelled markets refund locked capital and open-order holds

---

## 12. Matching Engine

### Engine Model

Start with one in-process off-chain central limit order book.

### Data Structures

- `TreeMap<price, FIFO queue>` for each side/outcome
- in-memory hot book
- Postgres append persistence for state changes

### Core Commands

- `placeOrder`
- `cancelOrder`
- `pauseMarket`
- `lockMarket`
- `snapshotBook`

### Matching Policy

- price-time priority
- deterministic fill ordering
- idempotent command handling by request id

### Realtime Delivery

Publish via Redis pub/sub or streams:
- top-of-book
- depth ladders
- recent trades
- ticker price
- market status
- resolution result

---

## 13. Hugging Face Ingest and Oracle

### Subject Registry

Background job to:
- validate submitted subject refs
- canonicalize names
- attach metadata
- classify subject type
- store ownership and org info

### Snapshot Pipeline

For each tracked subject:
- call Hub APIs on schedule
- normalize fields into stable internal metrics
- store raw JSON payload in object storage
- store normalized metrics in `hf_snapshots`

Use separate fetchers for:
- models
- datasets
- Spaces
- leaderboard / eval data

### Resolution Worker

At `resolveAt`:
1. lock market
2. get nearest valid snapshot after cutoff
3. evaluate resolver spec
4. write `market_resolutions`
5. create settlement journal
6. mark market resolved
7. broadcast final result

Fallback: if no valid snapshot and `missingDataRule = MANUAL_REVIEW`, queue admin review. Otherwise cancel.

---

## 14. Admin-Curated Workflow

### Submission Flow

User submits:
- market title draft
- entity refs
- metric
- date
- target threshold / comparator

Backend performs:
- entity validation
- resolver spec compilation
- ambiguity checks
- resolution preview

### Admin Review Tools

- queue of pending submissions
- resolver preview with sample fetched data
- publish scheduler
- pause / cancel controls
- override resolution with reason
- audit log viewer

---

## 15. Frontend Delivery

### Main Screens

- Home feed
- Event page
- Market page
- Portfolio
- Leaderboard
- Submission form
- Admin review
- Entity page for model / dataset / space / org

### Market Page Widgets

- title + rules
- probability / last price
- order book
- trade form
- price chart
- market history
- resolution source box
- related markets

---

## 16. Security and Operations

### Security Controls

- request signing for privileged admin actions
- idempotency keys on order placement
- rate limits on trading and submissions
- optimistic concurrency or row-level locking for wallet mutations
- full audit trail for resolution changes
- tamper-evident payload hash on oracle evidence

### Testing Strategy

Required:
- unit tests for matching
- property tests for accounting invariants
- simulation tests with random order flow
- replay tests for engine recovery
- resolver fixture tests from saved HF payloads
- end-to-end tests for market lifecycle

---

## 17. Real-Crypto Upgrade Path

### What Stays the Same

- UI
- market model
- admin workflow
- resolver/oracle
- event catalog
- most websocket and analytics code

### What Must Change

For real crypto, add or replace:
- wallet layer: external wallets or custodial accounts
- collateral management: stablecoin deposits / redemptions
- on-chain settlement contracts or regulated custodial settlement
- KYC / AML
- jurisdiction gating
- sanctions screening
- market surveillance
- anti-wash trading / spoofing detection
- tax / reporting support
- legal / compliance operations

### Settlement Adapter

```typescript
interface SettlementAdapter {
  reserveCollateral(userId: string, amount: Decimal): Promise<void>;
  releaseCollateral(userId: string, amount: Decimal): Promise<void>;
  settleTrade(fill: TradeFill): Promise<void>;
  redeemMarket(marketId: string, outcome: 'YES' | 'NO' | 'CANCEL'): Promise<void>;
}
```

Implementations:
- `PlayMoneySettlementAdapter`
- `CryptoSettlementAdapter`

### Real-Crypto Launch Options

**A. Offshore / non-U.S. crypto venue pattern** — closest to Polymarket's tokenized structure, requires careful legal analysis by target jurisdiction and geofencing.

**B. U.S. regulated event-contract route** — similar to Kalshi's CFTC-regulated Designated Contract Market model, heavier compliance burden.

**C. Hybrid launch** — play-money app publicly available first, then crypto in limited jurisdictions after legal clearance.

**Recommended: C**

---

## 18. Milestones

### Milestone 1 — Foundation and repo setup
- Stand up monorepo, CI/CD, environments, secrets handling, and local Docker stack
- Provision PostgreSQL, Redis, object storage, observability, and auth
- Define shared domain package for markets, orders, ledger, and resolver specs

**Exit criteria:** Engineers can run the full stack locally. Environments for dev/staging are live. Domain schemas are versioned and shared across services.

### Milestone 2 — Wallet and ledger core
- Implement user accounts and play-money wallets
- Build double-entry ledger and faucet issuance
- Add balance locking/unlocking for order reservation
- Add audit-safe transaction groups and idempotency keys

**Exit criteria:** Users can receive demo balance. Ledger balances reconcile exactly. Reservation and release flows are correct under retries.

### Milestone 3 — Market catalog and admin curation
- Build events, markets, categories, tags, and lifecycle states
- Ship user submission flow for proposed markets
- Ship admin review queue with approve/reject/edit/publish controls
- Validate all markets into structured resolver specs before publishing

**Exit criteria:** Admin can create and publish markets. User submissions enter review queue. No market can go live without a valid resolver spec.

### Milestone 4 — Matching engine and trading UX
- Implement off-chain CLOB with price-time priority
- Support limit orders, market orders, cancellations, and trade history
- Add market page with order book, trade ticket, and live updates
- Persist orders, trades, and positions

**Exit criteria:** Users can trade YES/NO shares on open markets. Engine passes deterministic replay tests. Real-time order book and trades stream correctly.

### Milestone 5 — Portfolio, charts, and leaderboards
- Build user portfolio and PnL views
- Add price history, market stats, and basic charts
- Add seasonal/global leaderboard
- Add watchlists and saved markets

**Exit criteria:** Users can see holdings and realized/unrealized PnL. Historical pricing renders correctly. Leaderboard updates from settled and open positions.

### Milestone 6 — Hugging Face ingest and oracle snapshots
- Implement subject registry for models, datasets, Spaces, orgs, and users
- Build scheduled ingest jobs using Hugging Face APIs
- Normalize stats into internal metric rows
- Store raw payloads and hashes in object storage

**Exit criteria:** Tracked subjects are snapshotted on schedule. Raw and normalized evidence is queryable. Resolver preview can read real snapshot data.

### Milestone 7 — Resolution and settlement
- Lock markets at cutoff
- Resolve from snapshot evidence using compiled resolver specs
- Write decision artifacts and settlement ledger entries
- Broadcast result and update positions/payouts

**Exit criteria:** End-to-end market lifecycle works from publish to payout. Every resolution is reproducible from stored evidence. Cancel and manual-review fallback paths work.

### Milestone 8 — Hardening and operations
- Add load testing, simulation trading, replay tooling, and failure recovery
- Add rate limits, abuse detection, admin audit logs, and monitoring dashboards
- Add backup/restore and incident runbooks

**Exit criteria:** System survives expected MVP concurrency. Recovery procedures are tested. Monitoring covers engine, ingest, resolver, and ledger health.

### Milestone 9 — Settlement abstraction for production launch
- Finalize `SettlementAdapter` boundary
- Keep MVP on `PlayMoneySettlementAdapter`
- Isolate wallet, collateral, and redemption semantics behind adapter contracts
- Ensure trading engine and oracle are settlement-agnostic

**Exit criteria:** Play-money settlement is fully implemented through adapter interface. No trading or oracle code depends directly on play-money wallet internals. Crypto path can be added without redesigning market/trading core.

### Milestone 10 — Real-crypto launch track
- Add stablecoin collateral support
- Add wallet connectivity or custodial account layer
- Add KYC/AML, sanctions screening, jurisdiction gating, and market surveillance
- Add on-chain or regulated settlement integration
- Conduct legal/compliance review by launch jurisdiction

**Exit criteria:** Production launch path is compliant for chosen jurisdictions. Stablecoin collateral and redemption flows pass audit. Market operations and surveillance are production-ready.

---

## 19. MVP Release Gate

Release publicly after Milestone 8.

Begin real-crypto implementation only after the MVP proves:
- sustained user activity
- stable oracle resolution
- acceptable abuse/risk profile
- legal viability in target jurisdictions

---

## 20. Recommended Next Steps

1. Compile contracts and run Foundry tests
2. Add full EIP-712 domain/typed-data parity tests
3. Wire Gelato task callbacks or worker-based polling
4. Add real provider SDKs and secret management
5. Complete The Graph mapping logic for winner/claim reconciliation
6. Run Prisma migrations against staging
7. Complete frontend API integration
8. Conduct legal localization and external audit
