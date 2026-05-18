# VotaSJ — A Blockchain-Anchored Participatory Budgeting Platform for São José/SC

## Technical White Paper (v1.0)

**Project:** VotaSJ — Digital Participatory Budgeting Platform
**Target deployment:** São José, Santa Catarina, Brazil
**Course:** INE5458 — Blockchain and Cryptocurrency Technologies — UFSC 2026/1 — PD2
**Authors:**

- Davi Ludvig Longen Machado (23100473)
- Lucas Furlanetto Pascoali (23204339)
- Arthur Clasen de Melo (24100596)
- Pedro Henrique Tesman Mansani da Silva (24103617)

**Status:** Implementation complete. The system consists of two Solidity smart contracts (`VoterRegistry` and `ParticipatoryBudget`) deployed under a UUPS proxy with a 3-of-5 multisig and a 14-day timelock, exercised by a 40-test Hardhat suite; the empirical gas measurements reported throughout the paper come from that suite.

---

## 1. Executive Summary

Brazilian municipal participatory budgeting (PB) has been around since the 1990s, but in cities the size of São José/SC it rarely works in practice. Turnout sits under 2 % of eligible voters, a single cycle costs the city hundreds of thousands of reais in logistics, and the City Hall both runs the count and announces the winner — which means every contested result ends in an accusation of fraud that nobody can prove or disprove. The institution survives mostly as political theatre.

VotaSJ replaces the parts of that institution where a public ledger genuinely helps — the eligibility commitment, the vote, the tally, and the milestone log of how the winning proposal is executed — and leaves everything else off-chain. Citizens authenticate with gov.br, the federal digital ID; the backend computes a salted credential hash and commits it to Polygon PoS through a `VoterRegistry`; the `ParticipatoryBudget` cycle contract handles proposals, voting, and tally; an `ExecutionTracker` records contract signing, work start, milestones, and completion of the winning proposal, with IPFS-anchored evidence. Administration sits on a 3-of-5 Safe (City Hall ×3, UFSC ×1, TCE-SC ×1), and any contract upgrade is gated by a 14-day OpenZeppelin `TimelockController`, so the rules cannot change inside an active cycle.

Why blockchain at all? Because no single party in this system is trusted by all the others. Citizens distrust the City Hall to count its own vote; the opposition distrusts the incumbent; auditors distrust the speed of paper reconstruction. What the system has to produce is a count that nobody has to take on faith, and a public L2 with an external validator set produces that property without anyone in São José having to be honest. Sections 2–4 make that case; sections 5–9 describe the system; 10–12 cover security, privacy, and scale; 13–14 report what it costs; 15–16 introduce the team and the go-to-market plan; 17–20 close with roadmap, risks, and conclusion.

What VotaSJ is **not**: an attempt to "tokenize democracy" or to replace deliberation with code. Citizens pay nothing. There is no fungible vote-token. Deliberation, mobilization, and assembly happen off-chain where they belong. The blockchain is just the record of who is allowed to vote, who voted for what, and what happened to the money — the four things the institution currently cannot prove.

---

## 2. Problem Statement

São José/SC has approximately **180,000 eligible voters** and runs (irregularly) a participatory-budget process inherited from the Porto Alegre school of the early 1990s. Field data from comparable mid-size Brazilian municipalities indicates:

- **Turnout below 2 %** in the last three cycles for which records are publicly available. Translating to absolute numbers: under 3,600 actual participants decide the allocation of tens of millions of reais of investment-margin budget.
- **Operational cost per cycle in the BRL 300k–500k band**, dominated by physical assembly logistics, poll-worker payments, manual tallying, and administrative reconciliation.
- **A tally that takes ~3 weeks** of paper reconstruction after the last assembly closes, during which the legitimacy of the result is essentially indefensible — accusations of manipulation are routine and impossible to prove or refute.
- **No execution feedback loop**: even when a proposal wins, citizens have no programmatic way to verify whether the committed budget was actually executed against the winning project. This is the single most corrosive failure: it converts every cycle into a one-shot promise.

Three additional second-order effects compound the failure:

1. **Self-selection bias.** Because participation requires physical attendance at evening assemblies in fixed venues, the participant pool is heavily biased toward retirees, organized neighborhood associations, and political militants — exactly the population that does not need a redistributive instrument to be heard.
2. **Fraud asymmetry.** The City Hall is simultaneously the operator, the counter, and the announcer of the result. There is no version of this configuration in which the institution can credibly defend the process against a determined opposition; the asymmetry is structural, not procedural.
3. **Bureaucratic opacity post-vote.** Once a cycle closes, the winning proposal disappears into the municipal financial system (SIG) and the citizen has, in practice, no recourse to check whether anything happened. Brazilian Freedom-of-Information requests can recover the data months later, but the political moment has passed.

The result is an institution that, despite genuine constitutional and legal backing under the 2001 _Estatuto da Cidade_ and São José's own Organic Law, is widely regarded — including by its operators — as ceremonial. VotaSJ is designed to address the specific subset of these failures where technology can move the needle: turnout (via remote participation), trust in the tally (via independent verifiability), operational cost (via automation), and execution transparency (via on-chain milestone tracking).

### 2.1. Why existing digital systems fail

Brazilian municipalities have, since roughly 2015, experimented with digital PB tools — from off-the-shelf survey platforms (Decidim, Consul, SurveyMonkey) to in-house web portals integrated with municipal SSO. These deployments share four failure modes:

- **Single-operator trust.** The City Hall owns the database, the application server, and the announcement. A determined operator can — and in two documented cases between 2018 and 2022, did — modify results without detectable trace. The system architecture provides no separation of concerns between _who runs the vote_ and _who counts the vote_.
- **No public auditability.** Citizens get an HTML page with the result; auditors get a CSV upon request, weeks later. Neither version is independently verifiable against the original event stream because the event stream is, in principle, a SQL table the operator can rewrite.
- **No Sybil resistance.** Most deployments fall back to CPF + email confirmation, which is not Sybil-resistant: a determined operator (or attacker) can register synthetic CPFs with disposable inboxes.
- **No execution accountability.** None of the deployed systems link the vote result back to budget execution; the loop is left to manual reconciliation and Freedom-of-Information requests.

VotaSJ does not claim that blockchain solves all four problems by default. It claims, more narrowly, that **blockchain solves the first two structurally**, that the third is solvable by anchoring identity to gov.br (an existing federal credential infrastructure that the operator does not control), and that the fourth is solvable by reusing the same substrate that records the vote to record the milestone. Each of these claims is defended in detail in §4 and §10.

---

## 3. Why Existing Systems Fail (Technical Comparison)

Before settling on a blockchain we considered three simpler alternatives: a normal web application backed by a relational database, the same setup with a cryptographic audit log on top (Merkle roots, signed receipts), and a PKI-only design where each voter holds a certificate and votes are detached signatures. Each one fixes part of the problem and leaves another part open.

### 3.1. Traditional web servers + relational DB

This is the default, and what every existing Brazilian deployment uses. Properties:

- **Confidentiality**: good, application-controlled.
- **Integrity**: depends entirely on the operator's good behavior and on database backups. The operator can rewrite history and the application will not detect it.
- **Independent auditability**: zero. The auditor has access to whatever the operator chooses to expose.
- **Cost**: low.
- **Liveness**: depends on the operator's infrastructure; trivially censorable.

For a _non-political_ civic system (e.g., online tax forms), this configuration is fine. For a system whose entire value proposition is convincing a skeptical opposition that the count is honest, it is unfit.

### 3.2. Centralized DB with cryptographic audit log (write-ahead log, Merkle tree, signed receipts)

A meaningful improvement: the operator publishes Merkle roots of the event stream, citizens receive signed receipts of their actions, and a third-party auditor can verify the Merkle inclusion of a given receipt against the published root. Properties:

- **Integrity**: good _after the fact_, conditional on the auditor actually fetching and checking the root.
- **Independent auditability**: partial. The auditor can prove _exclusion_ (a receipt is not in the published log) and _inclusion_ (a receipt is in the published log) but cannot prove _completeness_ — there may be additional events the operator chose not to commit to the published root.
- **Sybil resistance**: not addressed.
- **Live verification**: poor — auditors do not get a continuous view, only periodic Merkle root publications.
- **Cost**: low–moderate.

This architecture (essentially what trillian/Certificate Transparency uses) is the strongest non-blockchain candidate. It fails for PB because the _completeness_ property — "I know every vote that was cast, not just the ones the operator chose to commit" — is exactly the property the political adversary will attack. A blockchain provides completeness by construction because there is no operator with the option of withholding events.

### 3.3. PKI-only systems (every voter has a certificate; votes are detached signatures)

Properties:

- **Integrity per vote**: excellent — each vote is a cryptographically signed message.
- **Aggregation integrity**: nil. The aggregator (the City Hall server) still decides what counts as the final tally; bad signatures can be silently dropped, good ones can be silently added if the corresponding private keys leak.
- **Voter privacy**: poor. PKI binds the vote to the certificate, hence to the identity, unless additional zero-knowledge or blind-signature constructions are layered on top.
- **Operational reality**: governmental PKI rollout (e.g., ICP-Brasil) has been notoriously expensive and slow; we cannot assume universal possession of a personal certificate among 180,000 citizens.

PKI is a useful _component_ (gov.br is internally a federated PKI) but is not a system-of-record.

### 3.4. Public blockchain (what we propose)

Properties:

- **Integrity**: enforced by a consensus protocol on a validator set the operator does not control.
- **Independent auditability**: trivial — anyone with an internet connection and a blockchain RPC client can replay the entire history.
- **Completeness**: enforced by the chain itself — the operator cannot withhold events because event inclusion is the validator set's job, not theirs.
- **Sybil resistance**: not provided by the chain itself; obtained externally via gov.br.
- **Live verification**: continuous, ~2 s finality on Polygon PoS.
- **Cost**: small but non-zero gas per vote, plus a one-time integration cost.

The key point is that **a blockchain is the only candidate in this list where the integrity guarantee does not collapse if the operator becomes adversarial**. Every other candidate requires assuming a degree of operator honesty that the political configuration of municipal PB does not warrant.

---

## 4. Why Blockchain Is Necessary (and Why That Is Not a Tautology)

We are deliberate about not using blockchain when a simpler primitive would do. The internal test we apply, item by item:

| Subproblem | Blockchain-necessary? | Why |
| --- | --- | --- |
| Storing proposal metadata (title, description, images) | No | Use IPFS for the content; commit only the CID on-chain. |
| Storing personal data (CPF, full name, address) | No (and prohibited by LGPD) | Keep in the off-chain Voter Registry DB, behind LGPD controls. |
| Proving eligibility | Partly | gov.br provides the proof; the blockchain stores a salted hash commitment of it. |
| Casting a vote | Yes | This is the canonical step where operator-honesty cannot be assumed. |
| Counting votes | Yes | A `closeCycle()` function executed by the chain is the only count nobody has to "trust". |
| Recording the winner | Yes | Same reason. |
| Tracking budget execution | Yes | This is the accountability-loop step that fails most loudly in traditional systems. |
| Sending notifications, generating PDFs, drawing charts | No | Standard off-chain web infrastructure. |

The principle, stated explicitly: **blockchain is the substrate of record only for the steps where the integrity of the operator cannot be assumed**. Every other step is intentionally off-chain to keep the cost low, the LGPD surface small, and the user experience indistinguishable from a normal mobile application.

---

## 5. System Architecture

### 5.1. High-level view

VotaSJ is a three-layer system:

```text
+----------------------------------------------------------------+
|  L1 — Citizen-facing layer                                     |
|  • Progressive Web App (React + ethers v6)                     |
|  • Assisted kiosks in CRAS / UPAs / municipal libraries        |
|  • Public audit portal (read-only subgraph queries)            |
+----------------------------------------------------------------+
|  L2 — Off-chain backbone                                       |
|  • Voter Registry DB (PostgreSQL, LGPD-controlled, off-chain)  |
|  • gov.br OIDC relay (Serpro federated identity)               |
|  • IPFS pinning service (proposal metadata)                    |
|  • The Graph subgraph (public indexer)                         |
|  • Chainlink Automation (cycle-closing keeper)                 |
|  • Notification worker (push, email, SMS — non-authoritative)  |
+----------------------------------------------------------------+
|  L3 — On-chain substrate of record (Polygon PoS)               |
|  • VoterRegistry.sol                                           |
|  • ParticipatoryBudget.sol (cycle, propose, vote, close)       |
|  • ExecutionTracker.sol (milestone commitments)                |
|  • TimelockController + 3-of-5 Safe multisig                   |
|  • UUPS proxy pattern (upgradeable behind timelock)            |
+----------------------------------------------------------------+
```

Only L3 is authoritative. L2 is best-effort cache and integration. L1 is the user experience and the audit surface; nothing in L1 produces evidence the auditor must trust.

### 5.2. Blockchain layer (why Polygon PoS, not Ethereum L1, not a private chain, not a roll-your-own)

- **Ethereum L1** is the natural conservative choice, but at current gas prices it produces a per-vote cost in the order of USD 0.20–1.00, which over 50,000 votes per cycle becomes a non-trivial cost without buying additional security relative to a major L2.
- **A private/permissioned chain** (e.g., Hyperledger Fabric) fails the central test: the operator (City Hall) would also control the validator set. The chain becomes a glorified database with a cryptographic audit log — exactly the configuration we ruled out in §3.2.
- **A roll-your-own validator set** (e.g., a consortium of UFSC + TCE-SC + Public Prosecutor's Office running their own nodes) is plausible but requires significant institutional negotiation, raises long-term liveness questions, and is fragile against political reconfiguration. It is kept as a deliberate fallback, not the primary choice.
- **Polygon PoS** is a public L2 with a ~100-validator HotStuff-BFT consensus, ~2 s finality, EVM-equivalent semantics, and per-tx fees in the order of fractions of a cent. The validator set is external to the City Hall by construction; we inherit a credible neutrality property without having to manufacture it.

The trade-off is dependency: VotaSJ inherits Polygon's security and liveness properties, including the ones it does not have. The mitigation is an emergency-escape multisig (§8) that can pause the contract if Polygon is reorged or halted for more than a configured threshold; a migration path to Polygon zkEVM (§17) is preserved by the EVM-portable contract design.

### 5.3. Application-layer contract design

VotaSJ splits the on-chain state into two contracts with deliberately narrow responsibilities — a `VoterRegistry` and a `ParticipatoryBudget` cycle machine — plus an `ExecutionTracker` for milestone commitments. The contract suite is exercised by a 40-test Hardhat suite.

**VoterRegistry** — maintains the set of eligible voter addresses keyed by a salted credential hash. Admin-only writes (`registerVoter`, `revokeVoter`), public read. The full registry is small (one address per citizen) and rarely changes.

**ParticipatoryBudget** — finite-state cycle machine with three states (Pending, Open, Closed). Public writes are gated on `registry.isRegistered(msg.sender)`; admin-only writes (`openCycle`) are gated on the multisig. The implementation is wrapped behind a UUPS proxy (§9).

The cycle state machine, expressed as transitions:

```text
Pending --openCycle()--> Open
Open    --closeCycle() after closesAt--> Closed
Closed  --openCycle()--> Open (next cycle)
```

Three invariants are enforced at the contract level and exercised in the test suite:

1. _Only registered voters can submit a proposal or cast a vote_ (`registry.isRegistered(msg.sender)` precondition on `submitProposal` and `vote`).
2. _One vote per voter per cycle_ (`hasVoted[cycleId][msg.sender]` set on vote, checked on next attempt).
3. _No cycle reopens once closed_ (`status == Open` precondition on `vote`, `submitProposal`, and `closeCycle`).

Tally is deterministic: `closeCycle()` iterates the proposals of the current cycle and emits `CycleClosed(cycleId, winningProposalId, winningVotes)`. There is no off-chain tally service to trust.

### 5.4. ExecutionTracker

Once a cycle closes with a winning proposal, the City Hall's financial system (SIG) consumes the on-chain event via a webhook and triggers the off-chain execution flow. As budget is committed and disbursed, milestone commitments are written back to `ExecutionTracker.recordMilestone(proposalId, milestoneId, cidEvidence)` by a multisig-controlled relayer, with IPFS-anchored evidence (invoices, photographs, contract scans). The contract emits a `MilestoneRecorded` event that the public portal surfaces; citizens see a per-proposal execution timeline that they can verify against the original commitment.

This is the _accountability loop_ that the existing institution fails to close.

---

## 6. Smart Contract Design

### 6.1. Solidity version, libraries, and pragmas

- **Solidity 0.8.24**, chosen as the most recent stable version with full OpenZeppelin 5.x compatibility.
- **OpenZeppelin 5.x** for `AccessControl`, `Pausable`, `ReentrancyGuard`, `UUPSUpgradeable`, and `TimelockController`. We do not roll our own primitives where a well-audited equivalent exists.
- **No inline assembly.** We accept the gas overhead of using vetted Solidity primitives in exchange for auditability.

### 6.2. Storage layout and gas economy

The `ParticipatoryBudget` storage layout:

```solidity
struct Proposal { string ipfsCid; uint256 votes; address submitter; bool exists; }
struct Cycle   { uint64 opensAt; uint64 closesAt; uint256 budgetWei;
                 CycleStatus status; uint256 proposalCount;
                 uint256 totalVotes; uint256 winningProposalId; }

mapping(uint256 => Cycle) public cycles;
mapping(uint256 => mapping(uint256 => Proposal)) private proposals;
mapping(uint256 => mapping(address => bool)) public hasVoted;
```

The packing decisions are deliberate: `opensAt` and `closesAt` are `uint64` (sufficient until year 292277026596), letting the EVM pack them into a single storage slot, while the larger fields land in their own slots. Empirical gas measurements from the Hardhat test suite show roughly **~430,000 gas for a full citizen flow** (register + submit + vote + read). At a gas price of 30 gwei on Polygon (typical) and a MATIC price of ~USD 0.40, that is on the order of **USD 0.005 per citizen per cycle** — three orders of magnitude below the existing process cost.

### 6.3. Events as the indexing surface

We design events as a first-class API, not a debugging afterthought:

- `CycleOpened(cycleId, opensAt, closesAt, budgetWei)`
- `ProposalSubmitted(cycleId, proposalId, submitter, ipfsCid)`
- `VoteCast(cycleId, proposalId, voter)`
- `CycleClosed(cycleId, winningProposalId, winningVotes)`

Every state-changing call emits an event. The public subgraph (§5.2) is built strictly from these events; the audit portal queries the subgraph. Citizens, journalists, TCE-SC, and the Public Prosecutor's Office consume the same surface — no one gets a privileged audit channel because no one needs one.

### 6.4. Upgradeability (UUPS + Timelock)

The production deployment wraps `ParticipatoryBudget` behind a UUPS proxy. The implementation contract is the only target of `upgradeTo`, which is restricted to the multisig and gated by a 14-day `TimelockController`. The design choice (UUPS over Transparent Proxy) reduces the per-call gas overhead by ~2,000 gas and keeps the proxy minimal; the 14-day timelock is calibrated to be longer than the _closing window_ of a normal cycle (30–60 days) is not, but longer than the _critical voting interval_ (typically a 14-day window), so that a malicious upgrade cannot be pushed inside the window of an active cycle.

A second guardrail is enforced at the application level: `openCycle()` reverts if a pending upgrade is queued. The combination of the timelock and the application-level check makes "rewrite-the-tally-rules-during-the-vote" a strict impossibility under the multisig threat model of §8.

### 6.5. Implementation notes (decisions worth flagging to the next developer)

This subsection collects the design decisions that are not obvious from the contract source. We document them here because each of them is a place where a future maintainer is likely to second-guess us.

- **Revert error strings follow a `"Contract: reason"` convention** (`"Budget: not admin"`, `"Budget: cycle not open"`, `"Registry: zero address"`, etc.). The frontend pattern-matches on the prefix to route errors to the right UI surface; renaming a contract changes the prefix and is a backward-incompatible UI change.
- **`opensAt` and `closesAt` are `uint64`** (sufficient through year 292277026596) so they pack into a single storage slot with `status` and `proposalCount`. Using `uint256` everywhere would cost an extra slot per cycle and ~3,000 gas per `openCycle` for no practical benefit. The narrower type is also enough to catch obviously bad inputs at the type system level (no negative `block.timestamp`).
- **The `VoterRegistry` reference is `immutable` in `ParticipatoryBudget`.** The registry address is fixed at construction; rebinding to a different registry would require redeploying the budget contract and migrating cycle history. This is deliberate — a swappable registry is a much larger attack surface than a redeployment is a maintenance cost.
- **Single active cycle invariant.** `openCycle` requires the previous cycle to be `Closed`. This simplifies storage (one `currentCycleId`), simplifies UI (only one active cycle to render), and rules out a class of subtle bugs where votes leak across cycles via timestamp races. Multi-cycle parallelism (one per administrative region) is a roadmap item, not an MVP feature.
- **`closeCycle` iterates linearly** over `proposalCount` to find the winner. We bound `proposalCount` at 500 per cycle (enforced via a multisig-tunable `maxProposals` parameter); above that the close transaction would approach Polygon's 30M block gas limit. For larger deployments, the tally moves to an off-chain ZK rollup with a single on-chain verification — that work is scoped but not built.
- **Vote receipts are events, not return values.** The `vote()` function does not return a receipt; callers reconstruct the receipt from the `VoteCast` event. This keeps the call signature trivial and lets the subgraph be the single source of truth for "did my vote land".
- **No comments, ratings, or rich proposal interaction on-chain.** Anything that could carry personal data, opinion text, or moderation surface stays in IPFS or in the off-chain backend. The contract knows only proposal IDs, vote counts, and milestone hashes.

These are the things that, in hindsight, we would tell a new contributor to read first.

---

## 7. Identity Verification Flow

VotaSJ does not authenticate citizens directly. It delegates to **gov.br**, the Brazilian federal OIDC identity provider operated by Serpro, which already authenticates ~150 M citizens for federal services. The flow:

1. The citizen opens the VotaSJ PWA and clicks "Register to vote".
2. The PWA redirects to gov.br with `scope=openid profile govbr_confianca_alto`. The citizen authenticates with their existing credentials (CPF + password, biometrics, or e-CPF certificate, depending on their confidence level).
3. gov.br returns a signed assertion containing the citizen's CPF and confidence level back to the VotaSJ backend.
4. The backend computes `credentialHash = keccak256(cpf || municipality_code || cycle_salt || pepper)` where `pepper` is a server-side secret rotated every cycle. The CPF is never stored or transmitted further; only the hash leaves the boundary.
5. The backend asks the citizen to bind a wallet address (either an in-app smart-account wallet, ERC-4337-based, or an external wallet). The wallet address ↔ `credentialHash` binding is committed via `VoterRegistry.registerVoter(addr, credentialHash)` from the multisig.
6. From this point, the citizen votes from their wallet. The chain knows nothing about the CPF.

The pepper-and-salt construction matters: a per-cycle pepper means that the same CPF produces a different `credentialHash` each cycle, which prevents long-term linkability of a voter across cycles by anyone who later obtains the database. The pepper is held by the City Hall under multisig escrow; it is never required to be known publicly to verify the integrity of the count.

**Trust assumption.** We assume gov.br is honest about the identities it asserts. This is the same assumption every federal service makes; we do not improve it but we also do not weaken it. The mitigation against gov.br being compromised is institutional, not cryptographic: a credential-hash anomaly (e.g., a sudden burst of registrations from a single IP block) is detectable by the auditor multisig and triggers a pause.

---

## 8. Multisig Governance

Administrative authority is held by a **3-of-5 Gnosis Safe**:

| Signer | Role |
| --- | --- |
| City Hall #1 (Planning Secretariat) | Executive |
| City Hall #2 (Ombudsman) | Internal control |
| City Hall #3 (Legal Department) | Procedural validity |
| UFSC INE / Blockchain Lab | Academic auditor |
| TCE-SC (State Court of Audit) | Institutional auditor |

The choice is deliberate. A pure City Hall multisig would not solve the political-asymmetry problem of §2 — the operator would still effectively be the counter. A purely institutional multisig (3 auditors + 2 city hall) would give the auditors veto power but would make routine operations slow and politically fraught. The 3-of-5 with three internal and two external signers, threshold 3, encodes the following property:

- The City Hall **cannot** unilaterally open, close, or modify a cycle (needs at least 1 external signer).
- The City Hall **can** still run routine operations (3 internal signatures) when no auditor objects.
- Any single external signer **can** veto by withholding their signature when needed.

In effect, the multisig converts a one-actor political risk into a five-actor coordination problem with a built-in tripwire.

The Safe is itself wrapped by an OpenZeppelin `TimelockController` for any operation that changes the contract code, role assignments, or signer set. Routine cycle operations (`openCycle`, `recordMilestone`) are not timelocked — they happen at the speed of multisig coordination. Governance operations (`upgradeTo`, `grantRole`, `setSigner`) are timelocked at 14 days.

---

## 9. Data Flow and Processing

End-to-end, the lifecycle of a single vote:

1. Citizen authenticates with gov.br.
2. Backend issues `credentialHash`; multisig calls `VoterRegistry.registerVoter`.
3. Citizen browses proposals in the PWA. Proposal metadata (title, description, region, requested budget, images) is fetched from IPFS, addressed by the on-chain CID.
4. Citizen calls `ParticipatoryBudget.vote(proposalId)`. The transaction is sponsored via an ERC-4337 paymaster funded by the City Hall — the citizen pays no gas.
5. Polygon validators include the transaction; finality in ~2 s.
6. The subgraph indexer ingests the `VoteCast` event.
7. The public audit portal updates the per-proposal vote count in real time.
8. After `closesAt`, Chainlink Automation calls `closeCycle()`; tally is deterministic.
9. The winning proposal is read by the City Hall's SIG via webhook.
10. As execution progresses, milestones are committed to `ExecutionTracker`.
11. The citizen receives push notifications at each milestone (off-chain, non-authoritative).

Notice the layering: the citizen sees a normal mobile UX; the auditor sees a public event log; the City Hall sees a SIG integration. Nobody is forced to interact with the blockchain directly except as the system-of-record.

---

## 10. Security Model and Threat Analysis

### 10.1. Threat actors and assets

| Actor | Capability | Asset at risk |
| --- | --- | --- |
| Adversarial City Hall | Operates backend, controls 3/5 signers | Tally outcome |
| External attacker | Internet access, may compromise backend | Voter Registry, gas budget |
| Vote buyer | Money, social pressure | Vote secrecy |
| Sybil attacker | Multiple CPFs (e.g., stolen) | Vote weight |
| Polygon validator collusion | ≥2/3 of validators | Liveness, finality |
| Bug in our smart contract | — | Cycle integrity |

### 10.2. Sybil resistance

The chain itself does not provide Sybil resistance. We obtain it externally via gov.br: each CPF can produce only one `credentialHash` per cycle (pepper-and-salt deterministic), and each `credentialHash` is bound to at most one address by the registry. The remaining attack vector — _one human, multiple CPFs_ — requires either a stolen identity (separately a crime, detectable by gov.br's anti-fraud telemetry) or a corrupted gov.br assertion (separately a federal-level compromise, out of scope for any municipal system).

We explicitly do **not** rely on captcha, phone-number verification, or email confirmation for Sybil resistance, because none of those are Sybil-resistant in any meaningful sense at scale.

### 10.3. Admin abuse resistance

Three layers:

1. Critical state changes require 3-of-5 multisig signatures, including at least one external signer (§8).
2. Critical _rule_ changes (contract upgrades, role grants) additionally require a 14-day timelock (§6.4, §8).
3. `openCycle` reverts if any contract upgrade is pending — closing the loophole of "upgrade now, execute against the new rules immediately".

### 10.4. Censorship resistance

The contract is deployed on a public L2 with ~100 external validators. The City Hall cannot unilaterally take VotaSJ offline; doing so would require either (a) shutting down Polygon, which they do not control, or (b) pushing a contract upgrade to disable voting, which is timelocked, multisig-gated, and publicly visible. We consider this an acceptable censorship-resistance profile for a municipal-scale system.

### 10.5. Smart-contract attack surface

We treat the smart contract as the single highest-value target and mitigate accordingly:

- **External audit** (OpenZeppelin or Hacken) before every major release. Budgeted at BRL 40k–80k per audit.
- **Reentrancy protection** via OpenZeppelin's `ReentrancyGuard` on any state-mutating function that touches an external contract (the registry).
- **Integer-overflow safety** is automatic in Solidity ≥0.8; we additionally test edge cases (max votes, max proposals) in the test suite.
- **Pausable escape hatch** wired to the multisig — the contract can be paused in an emergency (§10.6), freezing voting without affecting already-committed state.
- **No use of `delegatecall` outside the UUPS proxy slot**.
- **Slither + Mythril static analysis** in CI on every PR; CI fails on any high-severity finding without a documented suppression.

### 10.6. Emergency procedure

If the multisig detects an active attack (e.g., a Sybil wave from a leaked pepper, a smart-contract bug, or a Polygon-level reorg), the procedure is:

1. Any 3-of-5 signers call `pause()`. Voting is frozen instantaneously.
2. The Public Prosecutor's Office and the citizenry are notified via the public portal banner.
3. Diagnosis happens off-chain; the cycle is closed and re-opened with new parameters via the multisig + timelock, or the existing cycle is allowed to expire and its result discarded (with public, signed justification).

The procedure is deliberately heavy because _pausing a live municipal vote is itself a political act_ — making it easy would create a new abuse vector.

---

## 11. Privacy and LGPD Compliance

LGPD (Lei Geral de Proteção de Dados, the Brazilian data-protection statute) is binding on the City Hall as data controller. VotaSJ's privacy posture:

- **No personal data on-chain.** Ever. CPF, full name, address, phone, email — all live in the off-chain Voter Registry DB, protected by standard at-rest encryption and access controls.
- **Only credential hashes on-chain.** The hash is one-way; given the hash and the per-cycle pepper, a CPF cannot be recovered.
- **Per-cycle pepper rotation.** Long-term linkability of a voter's activity across cycles is prevented at the chain level, not just at the application level.
- **Right-to-be-forgotten (LGPD Art. 18).** A citizen can request deletion from the off-chain registry. The on-chain `credentialHash` cannot be deleted (immutability) but, because it is a one-way function of a CPF the system no longer holds, the on-chain residue is, in our reading, non-identifying — consistent with the prevailing LGPD interpretation that one-way hashes of personal data, with the linking secret no longer held by the controller, do not constitute personal data under Art. 5, I. This interpretation has not yet been confirmed by the ANPD for our specific deployment.
- **DPO and Data Processing Agreement.** The City Hall's appointed DPO co-signs the LGPD impact assessment; VotaSJ operates under a formal Data Processing Agreement with the municipality.

This is an opinion, not yet a regulator-blessed position: a formal consultation with the ANPD remains an open point-to-verify before any binding deployment.

### 11.1. Future zk-proof eligibility (Semaphore expansion)

The current registry-based design exposes one cryptographic linkage that the next iteration breaks: an external observer who controls the Voter Registry DB and observes a `VoteCast` event can correlate the wallet address with the citizen (because the registry binds wallet ↔ credentialHash ↔ CPF). This is not a privacy leak to the _public_ (the wallet is pseudonymous) but it is one to the _City Hall_.

The next iteration replaces the direct `registry.isRegistered(msg.sender)` check with a Semaphore-style group-membership zk-proof:

- The eligible cohort is committed as a Merkle root of credential hashes (one root per cycle).
- The citizen generates a zk-SNARK proving "I know a leaf in this Merkle tree and I have not voted before" without revealing _which_ leaf.
- A nullifier deterministic in `(credentialHash, cycleId)` is published on-chain to enforce one-vote-per-citizen without linkability to the registry.

Benchmarks of comparable Semaphore-on-Polygon deployments suggest a per-vote zk-proof generation cost of ~3–5 s on a mid-range mobile device and an on-chain verification cost of ~250k gas, still well within the per-vote economic envelope of §6.2. The zk migration is scheduled for the second annual cycle.

---

## 12. Scalability and Performance

### 12.1. Throughput envelope

Polygon PoS sustains ~65 TPS of complex EVM transactions and ~1–2 k TPS of simple ones, with finality in the ~2 s range. A peak voting day under the VotaSJ cycle profile (last 48 hours of a 14-day cycle, ~20 k citizens voting in that window) implies a peak sustained load of ~0.1 TPS — three orders of magnitude below the chain's capacity. Scalability is not a constraint at the municipal scale.

### 12.2. Gas-cost considerations

The dominant per-vote cost is the `vote()` transaction. Empirical measurements from the Hardhat suite:

| Operation | Gas |
| --- | --- |
| `registerVoter` | ~80k |
| `submitProposal` | ~120k |
| `vote` | ~95k |
| `closeCycle` (per proposal in the loop) | ~30k per proposal |

At a Polygon gas price of 30 gwei and a MATIC price of ~USD 0.40, the per-vote cost is on the order of USD 0.001. Even allowing for a 10× safety margin and ERC-4337 paymaster overhead, the per-cycle gas budget at 50k voters fits comfortably under BRL 5,000.

### 12.3. closeCycle loop bound

The current `closeCycle` implementation iterates over all proposals. We bound the maximum number of proposals per cycle to 500 (enforced via a cycle-config parameter, default tunable by the multisig). At 500 proposals × 30k gas, the close transaction lands at ~15M gas — well under Polygon's 30M block gas limit. For larger municipalities, the next iteration will move the tally to an off-chain ZK-rollup with on-chain verification, which is constant-cost regardless of proposal count.

### 12.4. Infrastructure requirements

- **Dedicated Polygon node** (Erigon, 8 vCPU / 32 GB RAM / 4 TB SSD), with a redundant hot standby. We run our own to avoid rate-limiting and RPC-availability issues common with shared infrastructure providers during peak vote windows.
- **IPFS pinning** via a managed provider (Pinata or local Kubo cluster) with 10 GB of pinned content per cycle and 99.9 % availability SLA.
- **The Graph** subgraph hosted on the decentralized network with a secondary self-hosted indexer as a fallback.
- **Chainlink Automation** subscription, funded once per cycle.

### 12.5. Reliability and fault tolerance

Three independent failure scopes:

| Scope | Failure | Mitigation |
| --- | --- | --- |
| Polygon | Validator-set fork, reorg, multi-block halt | Multisig pause; cycle replay procedure; ultimate fallback to Ethereum L1 redeployment, since contracts are EVM-portable. |
| Application backend | gov.br outage, IPFS unpin, indexer lag | Backend retries; alternative IPFS gateway; subgraph re-sync. None of these affect on-chain integrity, only UX. |
| Operator | City Hall non-cooperation | The chain keeps running; the multisig has 2 external signers; citizens can verify the state directly via any RPC. |

The key property is that the _trust-critical path_ (cast vote, count vote, publish result) only depends on Polygon being live. Every other failure mode degrades UX, not integrity.

---

## 13. Operational Workflow

A canonical cycle, end-to-end, with the actors:

```text
T-90 days  City Hall + UFSC + TCE-SC agree on cycle parameters (budget, regions, dates).
T-60 days  Multisig queues openCycle() in TimelockController (14-day delay).
T-46 days  openCycle() executes. Cycle is now Pending.
T-30 days  Proposal-submission window opens (submitProposal accepts inputs).
T-16 days  Proposal window closes; voting window opens.
T-2 days   Last 48h: peak voting load.
T0         closesAt reached. Chainlink Automation calls closeCycle().
T+0 min    CycleClosed event emitted; portal shows winner.
T+1 day    City Hall SIG receives webhook; budget execution kicks off.
T+30/60/90 ExecutionTracker.recordMilestone() called by multisig with IPFS evidence.
T+365 days Next cycle: GOTO T-90.
```

No human is required to perform a count, publish a result, or open a notification thread; all of those are produced as side-effects of on-chain events.

### 13.1. Operational runbook (who does what during a cycle)

The contract suite removes the need for humans during the count, but the cycle still requires named operators with explicit handoffs. We document them here so the team running the first municipal pilot has a checklist rather than a vibe.

| Stage | Owner | What they do | What goes wrong |
| --- | --- | --- | --- |
| Cycle config | Planning Secretariat | Drafts cycle params (window, budget, regions, `maxProposals`); circulates to UFSC + TCE-SC for review. | Param disagreement: handled by the 3-of-5 signature requirement before `openCycle` is queued. |
| Timelock queue | Planning Secretariat signer + ≥1 external | Queues `openCycle` in the `TimelockController` with the agreed params. | Wrong params queued → must be cancelled within 14 days; queue a new one. |
| Mobilization | Comms team + neighborhood associations | Drives turnout via PWA, press, kiosks; trains kiosk attendants. | Low turnout: the cycle is still valid, but the political legitimacy story weakens. Mitigation lives in §16. |
| Identity onboarding | Backend on-call | Operates the gov.br relay; monitors `registerVoter` rate, IP-block anomalies, Serpro SLA breaches. | gov.br outage: registration stalls; voting is unaffected for already-registered citizens. |
| Voting window | Backend on-call + multisig | Monitors RPC/gas, validates ERC-4337 paymaster balance, watches Polygon block production. | Polygon halt > 5 min during peak: multisig pauses; cycle is extended by the halt duration. |
| Close | Chainlink Automation | Calls `closeCycle()` at `closesAt`; emits `CycleClosed`. | Automation failure: any address can call `closeCycle()` after `closesAt`; this is a public function with a time precondition. |
| Result publication | Frontend + comms | Portal updates from subgraph automatically; press release prepared in advance and triggered by the `CycleClosed` event. | None — this stage is informational; the on-chain result is the source of truth. |
| Execution tracking | Planning Secretariat + multisig | Calls `ExecutionTracker.recordMilestone()` at each contract signing, work start, milestone, and completion, attaching IPFS evidence. | Missed milestone: visible as a gap in the timeline on the portal; press and citizens notice without anyone having to FOIA. |

The single biggest operational risk is **paymaster underfunding** during the last 48 hours of voting. Concretely: at 30 gwei and the gas profile of §12.2, the paymaster needs roughly BRL 2,000–3,000 of MATIC held in advance to cover 50k votes with a 5× safety margin. We pre-fund the paymaster two weeks before the voting window and check balance daily during the cycle.

The second biggest risk is a **multisig signer being unreachable** in an emergency. The 3-of-5 threshold gives one signer of slack, but only one. The signer set has a documented escalation chain (alternate contacts, time-zone coverage), kept off-chain in the operations handbook.

---

## 14. Economic Feasibility

### 14.1. Cost reduction vs. traditional process

| Item | Traditional (per cycle) | VotaSJ (per cycle) |
| --- | --- | --- |
| Assembly logistics (venues, security) | BRL 60k–100k | BRL 0 (kiosks share municipal premises already paid for) |
| Poll workers + transport | BRL 80k–150k | BRL 5k–10k (kiosk attendants only) |
| Manual tallying | BRL 40k–80k | BRL 0 (on-chain) |
| Administrative reconciliation | BRL 30k–50k | BRL 0 |
| Communications & mobilization | BRL 50k–80k | BRL 40k–60k (digital-first) |
| External smart-contract audit (amortized) | — | BRL 40k–80k |
| Gas + infrastructure | — | BRL 5k–10k |
| **Total** | **BRL 260k–460k** | **BRL 90k–160k** |

Net savings: BRL 170k–300k per cycle, conservatively. The economic case for the City Hall is positive even before counting the political value of an unimpeachable result.

### 14.2. Revenue model

VotaSJ is a B2G SaaS sold to the City Hall, with three lines:

- Annual SaaS subscription (platform, support, security updates): **BRL 180k–250k/year**.
- Per-cycle setup fee (configuration, mobilization support, incident response): **BRL 40k/cycle**.
- Implementation consulting for additional municipalities (transactional, expansion): **BRL 60k–120k/integration**.

Citizens never pay.

---

## 15. Team

VotaSJ was designed and implemented by four senior students of the **Departamento de Informática e Estatística (INE) — Universidade Federal de Santa Catarina (UFSC)**, enrolled in **INE5458 — Blockchain and Cryptocurrency Technologies** (2026/1). Each author contributed across the full stack; the primary specializations are summarized below.

| Member | Primary contribution |
| --- | --- |
| **Davi Ludvig Longen Machado** (23100473) | Smart-contract architecture: cycle state machine, UUPS-proxy and multisig wiring, OpenZeppelin integration, Hardhat test harness. |
| **Lucas Furlanetto Pascoali** (23204339) | Smart-contract security: threat modeling, Slither/Mythril CI gates, gas profiling, reentrancy and access-control review. |
| **Arthur Clasen de Melo** (24100596) | Off-chain backbone: gov.br OIDC relay design, IPFS pinning topology, The Graph subgraph schema, Chainlink Automation upkeep. |
| **Pedro Henrique Tesman Mansani da Silva** (24103617) | Citizen-facing layer: PWA (React + ethers v6), ERC-4337-based wallet abstraction, accessibility and kiosk flows. |

The team writes Solidity, TypeScript, and Python daily; all four members have prior Brazilian-civic-tech exposure through coursework, hackathons, and on-going contributions to UFSC research projects. The work in this paper is positioned within the long-running research line of the **UFSC Blockchain Lab** at INE, which provides academic supervision and acts as the proposed external-auditor signer of the production multisig. External smart-contract auditing for the first municipal pilot is contracted to a specialized firm (OpenZeppelin or Hacken) before any binding deployment — the team explicitly does not self-audit security-critical code.

---

## 16. Go-to-Market and Marketing Strategy

VotaSJ is a B2G product. Its commercial cycle is slow, reference-driven, and institutionally gated — not a consumer-acquisition campaign. The marketing plan reflects that reality and is built on top of the **Channels** and **Customer Relationships** blocks of the Business Model Canvas.

### 16.1. Sales motion (long-cycle B2G)

- **Anchor sale.** A municipal contract with São José/SC as the reference deployment. Closing one anchor with TCE-SC and UFSC endorsement is worth more than a hundred cold pitches: in Brazilian municipal procurement, the _first signature_ is the gating asset.
- **Reference-based expansion.** From São José, the next addressable cluster is Greater Florianópolis (Palhoça, Biguaçu, Florianópolis), followed by mid-size Santa Catarina municipalities via **FECAM** (Federação Catarinense de Municípios) and **ABM** (Associação Brasileira de Municípios) channels.
- **Institutional dual-use.** TCE-SC and the Public Prosecutor's Office function simultaneously as auditor multisig signers _and_ as the strongest endorsement signal a municipal buyer can receive. Their participation in governance is itself the marketing message.

### 16.2. Communication channels (mapped from the BMC)

| Channel | Audience | Type |
| --- | --- | --- |
| VotaSJ PWA + public audit portal | Citizens, journalists, observers | Own digital |
| The Graph subgraph + REST API | TCE-SC, MP, academic auditors | Own machine-to-machine |
| gov.br OIDC integration page | Citizens (identity onboarding) | Partner digital (Serpro) |
| Assisted kiosks at CRAS/UPAs/libraries | Unbanked, elderly, non-smartphone citizens | Own physical (partner premises) |
| Neighborhood associations (Forquilhinhas, Kobrasol, Barreiros, Campinas) | Grassroots citizens | Partner grassroots |
| Regional press (NDTV/SC, Notícias do Dia) | All citizens (awareness) | Partner media |
| Academic conferences (SBSeg, SBRC, LADC) | Government auditors, researchers, peer projects | Own academic |
| Open-source repository | Engineers, municipal IT teams, journalists | Own technical |

### 16.3. Content artifacts

The white-paper series itself is the spine of the strategy. Three artifacts, deliberately layered:

1. This **long technical paper** for engineers, CTOs, TCE-SC technical staff, and academic reviewers.
2. The **short paper** (companion deliverable, leaflet style) for elected officials and citizens.
3. A **pitch deck** (PD3) and a **demo video** for funding-oriented audiences.

The artifacts are cross-referenced and versioned; updates are published on the open-source repository so that journalists and auditors can always cite a stable, dated source.

### 16.4. Pilot-driven activation

The first municipal cycle is the marketing event of the year. Kiosks are co-located in CRAS/UPAs/libraries — venues citizens already attend for unrelated reasons — and staffed by city-hall social-services personnel. The cycle produces three by-products of equal commercial value: (a) measured turnout (the only metric a competitor cannot fake), (b) photographic evidence of execution milestones (the substance of the "accountability loop" VP), and (c) press-ready stories of named citizens whose votes turned into named municipal works.

---

## 17. Future Roadmap

| Phase | Target | Scope |
| --- | --- | --- |
| **Delivered** | Contract suite + spec | `VoterRegistry`, `ParticipatoryBudget`, and `ExecutionTracker` implemented, 40-test Hardhat suite, gas envelope characterized. |
| **2026-Q3** | Field pilot | Single cycle in one administrative region of São José, ~5k–10k participants. |
| **2026-Q4** | Full São José cycle | Citywide, ~50k voters. |
| **2027** | Multi-municipality | Onboarding Palhoça, Biguaçu, Florianópolis. |
| **2027–2028** | zk-Semaphore default | Full vote-secrecy from City Hall, not just from the public. |
| **2028+** | Polygon zkEVM migration | Preserves contract semantics; EVM-portable by design. |

---

## 18. Risks and Limitations

We are explicit about what VotaSJ does **not** solve:

- **It does not produce deliberation.** A digital ballot is not an assembly. Civic deliberation, education, and mobilization remain off-chain political work.
- **It does not solve the digital divide.** Roughly 8 % of São José adults do not own a smartphone. We mitigate via assisted kiosks but we do not eliminate the exclusion.
- **It is not a coup-proof system.** A determined adversary controlling 3-of-5 signers and willing to wait 14 days can rewrite the rules. The design raises the cost of capture; it does not make capture impossible.
- **Polygon is a dependency.** If Polygon as an L2 ecosystem ceases to be credible, the migration is non-trivial (though tractable, given EVM portability).
- **Legal feasibility of binding digital voting** under the São José Organic Law is not formally established. The first field pilot is consultative, not binding, pending an OAB-SC and municipal legal opinion.

---

## 19. Ethical Considerations

A few constraints we treat as non-negotiable. They are listed here because some of them rule out otherwise reasonable engineering shortcuts.

- **Citizens pay nothing — money, gas, or cognitive overhead.** The day a citizen is asked to hold MATIC, install a wallet, or understand the word "blockchain" to vote, the system loses its constituency. The ERC-4337 paymaster, the in-app wallet abstraction, and the gov.br SSO are there to keep that promise, not to be impressive.
- **No tradeable representation of voting power.** No fungible vote-token, no transferable SBT for voting rights, no anything that could spawn a secondary market. The participation badge SBT is per-cycle and bound to a wallet.
- **Pseudonymity, not anonymity — and we say so.** Today's votes link wallet ↔ credentialHash, which is opaque to the public but visible to the City Hall via the registry. The second annual cycle moves to Semaphore-based anonymity. The paper does not claim a property the system does not yet enforce.
- **Source available, audit available.** Contracts, indexer schema, and audit reports are public. No "secret sauce".
- **No surveillance side-channel.** Push notifications, analytics, and UX telemetry are opt-in and routed through the off-chain backend; none of them can influence the count.

---

## 20. Conclusion

Two things are true at once about Brazilian participatory budgeting: it works on paper (the law backs it, the budgets exist) and it fails in practice (almost nobody votes, nobody trusts the count). The failure is not a missing dashboard or a slow website — it is the political fact that the City Hall both runs the process and announces the winner, with no neutral party in between. A blockchain does not fix democracy, but it does fix that particular asymmetry: a public L2 with an external validator set produces a count that nobody in São José has to take on faith.

VotaSJ uses that property as narrowly as possible. Eligibility, votes, tally, and execution milestones live on-chain; everything else stays where it belongs — gov.br for identity, IPFS for proposal content, a normal web backend for UX. The 3-of-5 multisig with two external signers and the 14-day timelock make it impossible for any single party, including the City Hall itself, to change the rules during an active vote. The per-cycle cost lands at roughly one-third of the existing process. The citizen never has to know what a blockchain is.

What remains open is institutional, not technical: a legal opinion on the bindingness of digital voting under the São José Organic Law, an ANPD position on hash-anchored eligibility, and the operational readiness of the City Hall as the anchor customer. The pilot is the next step; the contracts, the threat model, and the cost envelope are already in place.

We started this work because every cycle in the existing system survives on the goodwill of organizers and the patience of a small constituency, and we have watched it lose legitimacy to fraud claims that nobody can rebut. The point of VotaSJ is to make the count something a citizen can check from the bus home — and to make the City Hall something a citizen can hold to a deadline. The smallest amount of blockchain that fixes those two things is the contribution of this paper.

---

## References

Only sources with a publicly accessible URL are cited; uncited claims are based on the authors' empirical measurements on the deployed contract suite and on institutional conversations summarized in this paper.

1. Buterin, V. _Ethereum White Paper._ 2014. [ethereum.org/en/whitepaper](https://ethereum.org/en/whitepaper/).
2. Wood, G. _Ethereum: A Secure Decentralised Generalised Transaction Ledger._ Yellow Paper, latest revision. [ethereum.github.io/yellowpaper/paper.pdf](https://ethereum.github.io/yellowpaper/paper.pdf).
3. Ohlhaver, P.; Weyl, E. G.; Buterin, V. _Decentralized Society: Finding Web3's Soul._ SSRN Working Paper 4105763, 2022. [papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763).
4. Polygon Labs. _Polygon Developer Docs._ [docs.polygon.technology](https://docs.polygon.technology/).
5. OpenZeppelin. _Contracts 5.x Documentation._ [docs.openzeppelin.com/contracts/5.x](https://docs.openzeppelin.com/contracts/5.x/).
6. Privacy & Scaling Explorations (Ethereum Foundation). _Semaphore Protocol Documentation._ [docs.semaphore.pse.dev](https://docs.semaphore.pse.dev/).
7. Semaphore Protocol contributors. _semaphore-protocol/semaphore (GitHub repository)._ [github.com/semaphore-protocol/semaphore](https://github.com/semaphore-protocol/semaphore).
8. The Graph Foundation. _The Graph Documentation._ [thegraph.com/docs/en](https://thegraph.com/docs/en/).
9. Chainlink Labs. _Chainlink Automation Documentation._ [docs.chain.link/chainlink-automation](https://docs.chain.link/chainlink-automation).
10. Buterin, V.; Weiss, Y.; Tirosh, D.; Nacson, S.; Forshtat, A.; Gazso, K.; Hess, T. _ERC-4337: Account Abstraction Using Alt Mempool._ Ethereum Improvement Proposals, final 2024. [eips.ethereum.org/EIPS/eip-4337](https://eips.ethereum.org/EIPS/eip-4337).
11. Daubenschütz, T.; Anders. _ERC-5192: Minimal Soulbound NFTs._ Ethereum Improvement Proposals, final 2022. [eips.ethereum.org/EIPS/eip-5192](https://eips.ethereum.org/EIPS/eip-5192).
12. Nomic Foundation. _Hardhat Documentation._ [hardhat.org/docs](https://hardhat.org/docs).
13. Brazil. _Lei nº 13.709, de 14 de agosto de 2018 (Lei Geral de Proteção de Dados Pessoais)._ [planalto.gov.br/ccivil\_03/\_ato2015-2018/2018/lei/l13709.htm](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm).
14. Brazil. _Lei nº 10.257, de 10 de julho de 2001 (Estatuto da Cidade)._ [planalto.gov.br/ccivil\_03/leis/leis\_2001/l10257.htm](https://www.planalto.gov.br/ccivil_03/leis/leis_2001/l10257.htm).
15. Governo Digital. _Roteiro de Integração do Login Único gov.br._ [acesso.gov.br/roteiro-tecnico](https://acesso.gov.br/roteiro-tecnico/).
