# Gathering Results

This document defines how we determine whether the MVP works as a prediction-market product, whether the Hugging Face oracle is reliable enough for settlement, and whether the system justifies a real-crypto production track.

---

## 1. Product Success Criteria

The MVP is successful if users can:
- discover interesting Hugging Face-related markets easily
- understand market rules and resolution sources
- place trades without confusion
- trust that outcomes settle fairly
- return frequently enough to create real market activity

### User Activity KPIs

- daily active users
- weekly active traders
- new users who place first trade within 24 hours
- 7-day and 30-day retention
- average markets viewed per session
- average trades per active trader

### Market Quality KPIs

- percent of listed markets that receive at least one trade
- percent of listed markets that receive at least 10 traders
- average time from publish to first trade
- average daily volume per market
- spread width by market
- percent of markets with healthy two-sided liquidity

### Submission Quality KPIs

- submission-to-approval rate
- percent of submissions rejected for ambiguity
- median admin review time
- percent of markets requiring manual resolution override

---

## 2. Trading-System Success Criteria

The trading engine is successful if it is correct, fast, and replayable.

### Reliability KPIs

- successful order placement rate
- successful cancellation rate
- trade execution latency p50 / p95 / p99
- websocket update latency
- engine recovery time after restart
- percent of books successfully reconstructed from persisted events

### Accounting KPIs

- ledger reconciliation success rate
- number of unreconciled transaction groups
- balance drift incidents
- settlement job idempotency success rate
- count of failed or partial payouts

### Suggested MVP Thresholds

| Metric | Target |
|---|---|
| Order acceptance success rate | > 99.5% |
| p95 trade execution latency | < 250 ms |
| WebSocket fanout latency p95 | < 1 s |
| Ledger reconciliation mismatches | 0 tolerated in production |
| Settlement correctness on test fixtures | 100% |

---

## 3. Oracle and Resolution Success Criteria

Because the product depends on Hugging Face data, this is the most important operational section.

### Oracle KPIs

- snapshot job success rate by source type
- average snapshot freshness by tracked subject tier
- percent of markets resolvable automatically
- percent of resolutions requiring manual intervention
- time from scheduled resolution to final settlement
- number of disputed or flagged settlements
- number of failed source fetches per day

### Evidence Quality KPIs

- percent of resolutions with raw payload stored
- percent of resolutions with payload hash and normalized record present
- percent of resolutions reproducible from stored evidence
- percent of outcomes with fully generated decision trace

### Suggested MVP Thresholds

| Metric | Target |
|---|---|
| Automatic resolution rate | > 95% |
| Evidence completeness | 100% |
| Reproducible settlement rate | 100% |
| Manual override rate | < 5% |
| Average settlement delay after cutoff | < 10 minutes for normal markets |

---

## 4. Market-Forecast Quality

Even though the MVP is play-money, the markets should still produce useful collective forecasts.

### Measures

- Brier score on binary outcomes
- calibration by probability bucket
- closing-price accuracy vs opening-price accuracy
- trader cohort performance by experience level
- impact of liquidity depth on forecast accuracy

### Evaluation Approach

For every resolved market:
1. take opening implied probability
2. take midpoint implied probability 24h before close
3. take final implied probability before lock
4. compare each against realized outcome
5. compute calibration curves and Brier scores

---

## 5. Content and Category Evaluation

### Segment Performance By

- models vs datasets vs Spaces
- threshold vs comparison vs rank vs state-change markets
- short-dated vs long-dated markets
- creator/org markets vs repo-specific markets
- benchmark/leaderboard markets vs simple downloads/likes markets

### Questions to Answer

- Which categories get the most volume?
- Which categories settle most cleanly?
- Which categories cause the most ambiguity?
- Which categories create the best retention?

These findings should drive the next market-template roadmap.

---

## 6. Abuse and Trust Evaluation

Prediction markets fail quickly if users think markets are spammy, unfair, or manipulated.

### Track

- suspicious self-trading rate
- concentrated-volume markets
- spoofing-like cancellation behavior
- market-creator abuse reports
- number of admin interventions per 100 markets
- number of markets paused for integrity reasons

### Success Target

- most markets resolve without dispute
- abuse signals are visible early
- moderation workload remains manageable

---

## 7. Operational Review Cadence

### Daily

- ingest failures
- unresolved markets due today
- failed settlement jobs
- ledger reconciliation
- top abuse alerts

### Weekly

- liquidity and spread review
- category performance
- user retention and activation
- admin review backlog
- top market templates by engagement

### Monthly

- full oracle postmortem review
- forecast accuracy review
- infrastructure cost review
- roadmap update based on real usage
- crypto-launch readiness check

---

## 8. MVP Go / No-Go for Real-Crypto Track

Do not move to real crypto just because the MVP launches successfully.

Move only if these conditions are met over a sustained period:
- oracle resolution is consistently reliable
- ledger and settlement are error-free
- abuse and market-integrity controls are effective
- enough markets achieve healthy liquidity
- users return for forecasting value, not only novelty
- legal review confirms a viable launch structure

### Recommended Promotion Gates

- at least 90 days of stable MVP operations
- automatic resolution rate above target
- no unresolved ledger discrepancies
- strong retention among active traders
- meaningful volume across multiple market categories
- clear jurisdiction and compliance strategy for crypto launch

---

## 9. Post-Production Reporting Outputs

### Internal Dashboards

- trading health
- market health
- oracle health
- resolution auditability
- user funnel and retention
- moderation workload
- crypto-readiness score

### Per-Market Settlement Report

Each resolved market generates a report containing:
- market rule text
- compiled resolver spec
- source snapshot ID
- raw evidence link
- normalized metric values
- final decision trace
- payout totals
- override flag if any

---

## 10. Final Acceptance Test

The system can be considered successful when:
- users can propose, discover, and trade Hugging Face markets smoothly
- most markets settle automatically from stored evidence
- all balances reconcile exactly
- forecast prices become meaningfully informative before resolution
- moderation effort stays bounded
- the platform demonstrates enough integrity and reliability to justify adding a production crypto settlement adapter later
