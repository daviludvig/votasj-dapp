# Blockchain Canvas — VotaSJ

**Project:** VotaSJ — Digital Participatory Budgeting for São José/SC
**Author:** Davi Ludvig Longen Machado (23100473)
**Course:** INE5458 — Blockchain and Cryptocurrency Technologies — UFSC 2026/1
**Delivery:** PD1 (input for the PD2 white paper)

Structure follows the Blockchain Canvas template by Sajida Zouarhi (CC BY-NC-SA, theblockchaincanvas.com), as presented in the course slides.

---

## Row 1 — Conceptual framing

### Problem

_Describe the problem you are trying to solve._

Municipal participatory budgets in Brazil suffer from four linked problems:

- **Low turnout** (< 2% of eligible voters) because participation requires attending in-person night-time assemblies.
- **Distrust in the tally**: results are computed and published by the City Hall itself, an interested party, with no independent audit.
- **High operational cost** of physical ballots, poll workers, and manual tallying (estimated BRL 300k–500k per cycle in a mid-size municipality).
- **Post-vote opacity**: citizens cannot verify whether the winning project was actually executed with the committed budget.

### Solution

_Describe the proposed solution._

A permissionless-read, permissioned-write public blockchain application on Polygon PoS where:

- Eligibility proof (gov.br + municipal residence) is validated off-chain and committed on-chain as a credential hash.
- Proposals, votes and tally run as smart-contract transactions — tamper-evident and publicly auditable in real time.
- Budget execution milestones of winning proposals are recorded on-chain as well, closing the accountability loop.

### Entities

_Specify the quantity and diversity of the entities._

| Entity | Count | Nature |
| ------ | ----- | ------ |
| Eligible citizens | ~180,000 (São José/SC) | Many, heterogeneous, anonymous |
| City Hall (Planning Secretariat) | 1 | Single operator, interested party |
| UFSC (INE / Blockchain Lab) | 1 | Academic auditor |
| TCE-SC (State Court of Audit) | 1 | Institutional auditor |
| Public Prosecutor's Office | 1 | Legal auditor |
| Validator set (Polygon PoS) | ~100 | External, open public network |

The system must reconcile a single powerful entity (City Hall) with a large anonymous population (citizens) under the eye of independent auditors — a classic "multi-sided untrusted" configuration.

### Divergence

_Status of trust among entities — disputes, central authority, trusted third party?_

- Citizens **do not trust** the City Hall to tally its own participatory-budget process honestly, nor to honor the winning proposal.
- The City Hall **does not fully trust** the citizenry either: risks of ballot stuffing, identity fraud, and vote buying are real.
- There is **no existing neutral third party** with the legitimacy and technical capacity to run the process — TCE-SC audits after the fact, not in real time.
- Dispute pattern: every cycle ends with accusations from opposition councilors of "manipulated results", without the ability to prove or disprove them.

Blockchain fits because the trust problem is _horizontal and political_: there is no single entity all parties agree to delegate to.

### Motivation

_What do end users / peers have to gain? How to discourage attacks or malicious behavior?_

**Gains per actor:**

- Citizen: direct, low-effort digital participation; verifiable proof that their vote was counted; transparent follow-up on execution.
- City Hall: lower operational cost, higher turnout (stronger political legitimacy of the result), defense against opposition fraud claims.
- Auditors (UFSC / TCE-SC): real-time, cryptographically verifiable audit trail instead of paper reconstruction.

**Attack discouragement:**

- Sybil / ballot stuffing: blocked by gov.br-backed eligibility proof (one CPF → one credential hash → one vote).
- Admin abuse: cycle parameters require a 3-of-5 multisig (City Hall + UFSC + TCE-SC); upgrades are behind a 14-day timelock — malicious change during an active cycle is impossible.
- Vote buying: individual vote secrecy via zk-proof of eligibility (PD2) removes the ability to "prove" who voted for what.
- Censorship / downtime: public L2 infrastructure (Polygon) means the City Hall cannot unilaterally take the system offline during a cycle.

---

## Row 2 — Operational design

### Network Peers

_Who are they? What are their rights?_

| Peer | On-chain right |
| ---- | -------------- |
| Eligible citizen (wallet + gov.br credential) | Submit proposal (1), cast vote (1 per cycle), read all state |
| City Hall multisig signer (3-of-5 with UFSC/TCE) | Open cycle, set budget/deadlines, register execution milestones |
| Auditor (UFSC / TCE-SC multisig signer) | Co-sign admin operations, technical veto |
| Public observer (any wallet) | Read-only, no write rights |
| Polygon validator | External — provides consensus and finality, not a VotaSJ role |

Writes are permissioned (via the registry); reads are fully permissionless — anyone can audit.

### Transactions

_Describe the transactions performed on the blockchain._

1. `VoterRegistry.registerVoter(addr, credentialHash)` — onboarding of an eligible citizen.
2. `VoterRegistry.revokeVoter(addr, reason)` — removes eligibility (death, loss of residence, fraud).
3. `ParticipatoryBudget.openCycle(opensAt, closesAt, budgetWei)` — starts a cycle (multisig).
4. `ParticipatoryBudget.submitProposal(ipfsCid)` — citizen submits a proposal, metadata pinned in IPFS.
5. `ParticipatoryBudget.vote(proposalId)` — one vote per citizen per cycle.
6. `ParticipatoryBudget.closeCycle()` — deterministic tally, winner emitted via event.
7. `ExecutionTracker.recordMilestone(...)` (PD3) — on-chain commitment of execution progress.

Volume estimate: ~50k tx per cycle (peak during last 48h); 1 cycle/year initially.

### Data

_What data goes through the blockchain? Volume (low/high). Criticality (low/high)._

| Data | On-chain? | Volume | Criticality |
| ---- | --------- | ------ | ----------- |
| Credential hash (keccak256 of gov.br payload) | Yes | Low (one per citizen) | High |
| Proposal IPFS CID + submitter | Yes | Low | High |
| Proposal full metadata (title, description, budget, region, images) | No — IPFS | Medium | Medium |
| Vote (voter address, proposal id, cycle id) | Yes | High (~50k/cycle) | Critical |
| Tally result (winner, total votes) | Yes | Low | Critical |
| Personal data (CPF, full name, address) | **Never** | — | — (LGPD) |
| Execution milestones | Yes | Low | High |

Criticality of votes is **critical**: the whole proposition rests on vote integrity. IPFS metadata is medium because a missing CID can be re-pinned, but a corrupted vote cannot be reverted.

### Type of Processing

_Distributed storage (logs) or distributed calculation (conditions, contracts)? Oracles?_

Both, with a clear split:

- **Distributed calculation** (smart-contract logic): voter eligibility check, one-vote-per-cycle enforcement, tally computation, cycle-state machine (Pending → Open → Closed).
- **Distributed storage** (event log): immutable audit trail of every registration, vote, and closure.
- **Oracles:**
  - **gov.br** (identity) — off-chain → on-chain via a relayer signed by the City Hall multisig.
  - **Chainlink Automation** — triggers `closeCycle()` at `closesAt` without human intervention, removing a manual-action dependency.

### Value

_Is the system based on / does it use a value system linking the blockchain to the real world?_

No fungible / speculative token. The "value" anchored on-chain is **civic** and **institutional**, not monetary:

- **Credential SBT (ERC-5192)** on registration — non-transferable proof of municipal citizenship for voting purposes.
- **Participation badge SBT** per cycle — permanent, non-transferable record of civic engagement.
- **Budget commitment (wei amount)** recorded in the cycle — symbolic of the BRL value of the participatory budget; the actual funds move off-chain through the municipal financial system (SIG), synchronized via webhook when a cycle closes.

A fungible vote-token is explicitly ruled out: monetizing votes would invalidate the whole premise.

---

## Row 3 — Network rules

### Network Dynamics

_Rules for verification and validation of transactions. Rule for consensus._

- **Consensus layer**: Polygon PoS — HotStuff-based BFT with ~100 public validators and ~2s finality. We inherit it; we do not build our own.
- **Application-layer validation** (enforced inside the smart contract, before the consensus layer ever sees the tx):
  - `registerVoter` — only admin (multisig), non-zero address, not already registered, non-empty credential.
  - `submitProposal` — cycle must be Open, sender must be a registered voter, CID non-empty.
  - `vote` — cycle Open, inside `[opensAt, closesAt)`, sender registered, has not voted in this cycle, target proposal exists.
  - `openCycle` — `opensAt < closesAt`, `closesAt > now`, previous cycle Closed.
  - `closeCycle` — only after `closesAt`, computes max(votes) deterministically.
- **Upgrade rule**: UUPS proxy behind a 14-day timelock — no upgrades during an active cycle.
- **Admin rule**: 3-of-5 multisig (City Hall ×3, UFSC ×1, TCE-SC ×1). No single signer can open, close, or modify a cycle alone.

---

## Points to Verify (off-chain)

_Information or theories that still need validation for the solution to work._

- **Legal feasibility of binding voting via blockchain.** Current participatory-budget practice in São José relies on assemblies — producing a formal legal opinion (OAB-SC and the municipal legal department) confirming that a digital process with gov.br identity satisfies the municipal Organic Law is required before a real pilot.
- **Integration with gov.br.** The plan assumes a signed assertion from gov.br can be replayed by a relayer as an on-chain credential commitment. The exact flow, rate limits, and Serpro SLA need to be validated with Serpro's API team.
- **LGPD opinion.** Even with only hashes on-chain, the municipal DPO must confirm that committing a CPF-derived hash does not constitute personal-data processing requiring explicit consent beyond the voter registration step.
- **zk-proof of eligibility (PD2).** The commit-reveal scheme for MVP is understood; the Semaphore / zk-SNARK circuit for full vote privacy still needs prototyping and benchmarking on Polygon Amoy.
- **Real turnout in a digital process.** The >5% target is a hypothesis extrapolated from other civic-tech deployments; needs to be validated in the PD3 pilot.
- **Accessibility for unbanked / non-smartphone citizens.** The assisted-kiosk channel is part of the model; operational feasibility (staff, location, device custody) must be negotiated with the City Hall's social-services department.
- **Gas-cost budgeting.** Empirical measurement from the local Hardhat simulation (~430k gas for a full citizen flow) needs to be re-measured on Polygon Amoy under realistic gas-price conditions before signing a contract that promises a cost per vote.
