# HF-Arenas Legal Lexicon Guide

> **Classification:** Internal Policy — All Contributors Must Follow  
> **Purpose:** Regulatory Semantic Shield — Numerai Legal Loophole Implementation  
> **Scope:** UI copy, documentation, marketing, API error messages, smart-contract NatSpec

---

## 1. Why This Exists

HF-Arenas is a **Decentralised Data Verification Protocol**, not a prediction market or
gambling platform. The distinction is not merely cosmetic — it is the legal and regulatory
foundation of the project. Consistent, disciplined vocabulary:

1. Frames the product within the *data-as-a-service* legal paradigm (cf. the Numerai
   "Erasure" model) rather than the commodity-derivatives space regulated by the CFTC.
2. Ensures the dual-mode architecture (Testnet Sandbox / Mainnet Settlement) is clearly
   communicated to users, removing any impression of unregulated financial wagering.
3. Reduces surface area for regulatory scrutiny by describing user actions in terms of
   **information attestation** and **collateral allocation**, not gambling.

---

## 2. Mandatory Vocabulary Table

| ❌ Prohibited Term | ✅ Approved Institutional Term | Context |
|---|---|---|
| Bet / Wager | **Stake** / **Allocate** / **Attest** | User action in the protocol |
| Prediction Market | **Data Verification Protocol** / **Information Market** | Product category |
| Odds | **Probability Yield** / **Confidence Weight** | Outcome pricing |
| Bettor / Gambler | **Data Provider** / **Researcher** / **Attestor** | User identity |
| Winnings / Payout | **Accuracy Bounty** / **Data Yield** | Rewards distribution |
| Gambling / Speculation | **Data Attestation** / **Collateral Allocation** | Activity description |
| Place a bet | **Submit an attestation** / **Allocate collateral** | On-boarding copy |
| Resolve the market | **Resolve the data hypothesis** / **Settle the protocol epoch** | Settlement copy |
| Win / Lose | **Correct attestation** / **Incorrect attestation** | Resolution messaging |
| Play money | **Testnet XP** / **Sandbox credits** | Tournament mode |
| Real money | **Mainnet USDC** / **Settlement collateral** | Real mode |

---

## 3. Mode Labels

The dual-mode UI toggle **must** use the following labels:

| Mode | Correct Label | Prohibited Label |
|---|---|---|
| Testnet / Tournament | **Testnet Sandbox (XP)** | "Play Money", "US Tournament", "Demo Mode" |
| Mainnet / Settlement | **Mainnet Settlement (USDC)** | "Real Money", "Global", "Live Mode" |

---

## 4. Smart Contract NatSpec Conventions

All new or modified Solidity functions must include a `@dev` NatSpec comment mapping the
function to its institutional lexicon equivalent. Example:

```solidity
/// @notice Allocate collateral to a data hypothesis outcome.
/// @dev Institutional lexicon: "placeBet" → "stakeCollateral" / "allocateToHypothesis".
function placeBet(...) external { ... }

/// @notice Returns the probability-yield weight for a given outcome.
/// @dev Institutional lexicon: "getOdds" → "getProbabilityYield" / "getConfidenceWeight".
function getOdds(...) external view returns (uint256) { ... }
```

Public function names and event names are **preserved as-is** for ABI and on-chain
compatibility. Only NatSpec and off-chain copy are updated.

---

## 5. UI / Frontend Copy Rules

- The word **"bet"** must never appear in button labels, headings, or body copy.
- The word **"odds"** should be replaced with **"probability"** or **"confidence weight"**.
- Market preview cards should use phrases like:
  - *"Submit attestation"* (not *"Place bet"*)
  - *"Confidence weight: 67%"* (not *"Odds: 67%"*)
  - *"Accuracy Bounty: 2.4×"* (not *"Payout: 2.4×"*)
- The mode-switch toggle must always display the full label:
  **"Testnet Sandbox (XP)"** and **"Mainnet Settlement (USDC)"**.

---

## 6. Documentation & Marketing Rules

- README and `docs/` files must refer to the protocol as a **Data Verification Protocol**
  or **Information Market**, never as a "prediction market" in the context of user
  financial activity.
- Investor materials may use "prediction market" as a *category* shorthand for context,
  but must immediately qualify it: *"…a data verification and attestation protocol
  (commonly categorised as an information market)."*
- Cold outreach emails and pitch decks must use the dual-mode framing from the outset.

---

## 7. Enforcement

Any pull request that introduces prohibited terminology (as listed in §2) into UI copy,
documentation, or marketing materials will be **rejected at review**. Smart contract
function names are exempt from this rule (ABI stability takes precedence), but *must*
carry the correct institutional NatSpec as described in §4.

---

*Maintained by: HF-Arenas Core Protocol Team*  
*Last updated: 2026-04-01*
