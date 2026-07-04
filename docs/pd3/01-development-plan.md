# PD3 Development Plan

> **Status: PD3 was submitted at the Minimum/local-network scope** (see [02-gap-analysis.md](02-gap-analysis.md)). Phase A below is done — two contracts, 43 tests, 100% coverage, a reproducible demo script — and is what the pitch deck in this same folder (start at [05-pitch-deck-outline.md](05-pitch-deck-outline.md)) presents. Phases B through E describe the backend, frontend, and public-testnet work that was **not** built for PD3 and remains the roadmap. This document is kept as-is (rather than rewritten after the fact) so the team can resume Phase B without re-deriving the plan; treat every "Amoy", "frontend", or "backend" reference below as future work, not as something the PD3 submission claims to have.

This is the phased plan from today to a full production-grade demo. It is built around one acceptance test: **every vital step of the cycle is demonstrable live and verifiable by a third party**. If at any point the team is forced to choose between a feature and verifiability, verifiability wins.

## 0. Goal restated

By the submission deadline we deliver:

- A **working VotaSJ deployment on Polygon Amoy** that anyone with the Amoy explorer URL can audit.
- A **frontend PWA** that drives the seven demo flows from the browser.
- A **10–15 min YouTube video** of the full team pitching, ending in a screen-recorded live demo of the seven flows.
- A **10-slide pitch deck** (or 5-slide collapse) PDF.
- The link plus the public GitHub repository as the final artifact.

## 1. Phases and acceptance gates

Each phase ends with a hard gate. We do not start the next phase until the gate is green.

### Phase A — Smart-contract floor (week 1)

**Objective:** ship the contract suite needed for the demo, deployed on Amoy and verified on Polygonscan.

**Tasks:**

- [ ] **Implement `ExecutionTracker.sol`** (currently absent from the repo). Minimal surface: `recordMilestone(proposalId, milestoneId, ipfsCid, kind)` with `kind ∈ {ContractSigned, WorkStarted, MilestoneReached, Completed}`, gated to the same admin/multisig as the rest. Emits `MilestoneRecorded(proposalId, milestoneId, ipfsCid, kind, timestamp)`.
- [ ] **Add a Hardhat test file `test/ExecutionTracker.test.js`** with at least 10 tests covering: admin-only, monotonic milestone IDs per proposal, event payload, revoke/correction flow if scoped in.
- [ ] **Tighten existing tests if needed** so the suite stays at ≥ 90 % coverage after the new contract lands.
- [ ] **Deployment script (`scripts/deploy.js`) updated** to deploy `VoterRegistry → ParticipatoryBudget → ExecutionTracker` in order, recording addresses to `deployments/amoy.json` (committed).
- [ ] **`.env.example` documented** with `AMOY_RPC_URL`, `DEPLOYER_PRIVATE_KEY`, and (if used) `POLYGONSCAN_API_KEY` placeholders.
- [ ] **Deploy to Amoy** from one team member's machine, fund the deployer with the Amoy faucet, and capture the three contract addresses.
- [ ] **Verify all three contracts on Polygonscan-Amoy** (`hardhat verify --network amoy <address> <constructor-args>`). Without verified source, reviewers cannot audit.

**Gate A:** `npm test` passes, `npm run coverage` ≥ 90 %, three contracts are deployed and verified on Amoy, addresses committed to `deployments/amoy.json`.

### Phase B — Backend stub and operational helpers (week 2)

**Objective:** the minimum off-chain backend the demo needs, with mocks where the real integration is out of scope for PD3.

**Tasks:**

- [ ] **Mock gov.br relay.** A small Node.js Express server in `backend/` exposing `POST /govbr/mock-login` that returns a signed assertion `{ cpf, name, govbr_confidence, signature }`. The signature is a fixed test key — _clearly labeled as a mock in the UI_. This is the artifact that the demo will use; the real gov.br integration is PD-future scope.
- [ ] **Credential-hash service.** `POST /credentials/issue` takes the gov.br assertion, computes `keccak256(cpf || municipality_code || cycle_salt || pepper)`, and returns the hash plus a wallet address (newly generated, custodial for demo purposes).
- [ ] **Register-voter trigger.** `POST /voters/register` calls `VoterRegistry.registerVoter(addr, credentialHash)` from the deployer key. The endpoint **returns the transaction hash and Polygonscan-Amoy URL** so the frontend can show it.
- [ ] **Proposal IPFS upload.** `POST /proposals/upload` takes the proposal text + budget breakdown, uploads to a public IPFS pinning service (Pinata free tier or local Kubo), returns the CID. The frontend then calls the contract with the CID.
- [ ] **Milestone IPFS upload.** Same pattern for execution-milestone evidence (photos, contract scans).
- [ ] **Health endpoint** at `GET /health` returning the deployed contract addresses, current cycle id, and chain id. The audit portal uses this to display the network status.

**Gate B:** the backend runs locally with `npm run backend`, all four endpoints are exercised by an integration test, and a manual run of the seven demo flows succeeds end-to-end against the Amoy deployment.

### Phase C — Frontend PWA (weeks 2–4, in parallel with B)

**Objective:** a citizen-facing PWA that performs the seven demo flows and a public audit portal that anyone can open without a wallet.

**Stack:** React + Vite + ethers v6, TypeScript, Tailwind (or plain CSS — minimal time on visual polish). Single-page app with five routes.

**Routes / screens:**

- [ ] **`/login`** — single "Sign in with gov.br (mock)" button → backend `/govbr/mock-login` → backend `/credentials/issue` → frontend stores wallet privkey in localStorage with a clear warning banner that this is a demo wallet.
- [ ] **`/cycle`** — current cycle status (Pending / Open / Closed), countdown to `opensAt` / `closesAt`, list of proposals with their live vote count read from the chain. Public, no login required.
- [ ] **`/propose`** — proposal submission form (title, description, requested budget, region, optional photo). On submit: backend `/proposals/upload` → frontend calls `ParticipatoryBudget.submitProposal(cid)` → shows transaction hash with Polygonscan link.
- [ ] **`/vote`** — list of proposals with "Vote" button, calls `ParticipatoryBudget.vote(id)`, shows tx hash + Polygonscan link. Disables itself once `hasVoted` is true.
- [ ] **`/audit`** — public read-only event feed: every `VoteCast`, `ProposalSubmitted`, `CycleOpened`, `CycleClosed`, `MilestoneRecorded` event from the contract, with timestamps and Polygonscan deep-links. **This is the verifiability surface; this is the most important screen.**
- [ ] **Admin tab** (visible only when wallet is admin) — buttons for `openCycle`, `closeCycle`, `recordMilestone`. Useful for the demo even though in production the multisig replaces this.

**Gate C:** all five routes work against the Amoy deployment. A reviewer with no access to the team can open `/audit` in a browser, paste any tx hash into Polygonscan, and reproduce the event payload.

### Phase D — Demo rehearsal and verification matrix (week 5)

**Objective:** run the demo end-to-end at least three times before recording, with the verification matrix from `03-demo-runbook.md` checked at every step.

**Tasks:**

- [ ] **Dry run #1** — single team member runs all seven flows. Goal: catch broken paths and Amoy gas-funding gaps. Refill deployer + paymaster wallets as needed.
- [ ] **Dry run #2** — full team, screen-share through Meet/Discord. Goal: nail down who-shows-what and the verbal handoffs.
- [ ] **Dry run #3** — recorded but unpublished, watched by the team. Goal: timing, transition cuts, audio quality.
- [ ] **Verification artifacts captured** — screenshots of Polygonscan event logs for the demo cycle, IPFS gateway URLs that resolve, the audit portal feed at three timestamps. These go in `docs/pd3/verification/` as evidence the demo is auditable.

**Gate D:** the verification matrix is fully green; every flow produces an artifact that survives outside the demo session.

### Phase E — Pitch deck, video recording, submission (week 6)

**Tasks:**

- [ ] **Pitch deck finalized** following [05-pitch-deck-outline.md](05-pitch-deck-outline.md) and [06-slide-content.md](06-slide-content.md). Exported to PDF, committed at `docs/pd3/pitch-deck.pdf`.
- [ ] **Video recorded** following [07-speaker-script.md](07-speaker-script.md) and [08-live-demo-script.md](08-live-demo-script.md). Three parts (canvas → white paper → MVP demo) totaling 10–15 minutes. Uploaded as **unlisted** to YouTube.
- [ ] **Final repository sweep** — `npm run lint`, `npm test`, and a fresh `git clone` test from a different machine. The reviewer should be able to clone, install, and run the test suite without help from us.
- [ ] **Submission package** — repository URL + YouTube link + brief cover email pointing the reviewer at [03-demo-runbook.md](03-demo-runbook.md) so they can independently re-run the flows.

**Gate E:** YouTube link works, repository is reviewer-clonable, the runbook can be executed against the Amoy deployment by someone outside the team.

## 2. Three scope levels (pick one before starting Phase A)

The whitepaper is ambitious. PD3 has a hard deadline. The team picks one of three scope levels on day 1 and writes that choice into the top of [02-gap-analysis.md](02-gap-analysis.md).

| Level | Scope summary | Demo says |
| ----- | ------------- | --------- |
| **Minimum** | `VoterRegistry` + `ParticipatoryBudget` deployed and verified on Amoy. `ExecutionTracker` mocked off-chain. Frontend covers register → propose → vote → close → audit (5 of the 7 flows). gov.br is a mocked button. | "Vital flows on a public network, verifiable on Polygonscan, with the execution-tracking layer scoped for the next iteration." |
| **Target** _(recommended)_ | Above plus `ExecutionTracker.sol` deployed and verified, frontend covers all 7 flows including milestone recording, public audit feed live. Still mocked gov.br, no Safe/timelock, single admin EOA. | "End-to-end participatory cycle with execution accountability, all on-chain, verifiable by any third party. Production roadmap: real gov.br, multisig, timelock." |
| **Stretch** | Target plus a 3-of-5 Safe on Amoy as admin, a `TimelockController` for upgrades, a subgraph indexing all events, and Chainlink Automation closing the cycle. | "Production governance pattern in place; only the gov.br federal integration and the external audit remain before binding deployment." |

**Recommendation:** target Minimum or Target. Stretch is honest about its dependencies — Chainlink and Safe on Amoy can fail in ways that consume a team-week — and PD3 is graded on what the reviewer can verify, not on what the architecture diagram claims.

## 3. Owner suggestions (based on the Team section of the long white paper)

These are starting assignments; the team should adjust after a single conversation.

| Person | Phase A | Phase B | Phase C | Phase D | Phase E |
| ------ | ------- | ------- | ------- | ------- | ------- |
| **Davi (smart-contract architecture)** | `ExecutionTracker.sol` + UUPS wrapper (Stretch); Amoy deploy + Polygonscan verify | --- | Contract-binding plumbing in the frontend (ethers v6 client) | Lead dry runs | Pitch deck — slides 3, 4 |
| **Lucas (smart-contract security)** | New test file; coverage gate; Slither/Mythril CI | Integration tests against Amoy | --- | Verification matrix capture | Pitch deck — slide 7 (traction / security) |
| **Arthur (off-chain backbone)** | --- | All five backend endpoints; Pinata setup; subgraph if Stretch | `/audit` event-feed implementation | --- | Pitch deck — slides 5, 6 |
| **Pedro (frontend / UX)** | --- | Help with mock-gov.br endpoint shape | All five frontend routes; wallet abstraction | Storyboard recording flow | Video editing; YouTube upload |

## 4. Risk register (start watching from day 1)

| Risk | Mitigation |
| ---- | ---------- |
| Amoy faucet rate-limits the deployer | Pre-fund the wallet across multiple faucets (Polygon, QuickNode, Alchemy). Keep a running balance ≥ 1 MATIC. |
| RPC provider throttles us during the demo | Have two RPC URLs in `.env` (Alchemy + public Polygon RPC), with a one-line fallback in the frontend. |
| Pinata free tier expires content | Pin the demo CIDs from a backup local Kubo node and include the multi-addr in the runbook. |
| MetaMask UX confuses the demo audience | The demo uses a _custodial demo wallet_ generated by the backend, not MetaMask. The audience sees a sign-in button, not a wallet pop-up. The "real MetaMask" path is documented in the runbook for reviewers but is not the live demo. |
| Video re-record needed at the last moment | Record in three independent ~5 min segments so any one can be retaken without re-recording the others. |
| Team member unavailable in the final week | The owner table is a suggestion, not a contract. Phases B and C are written so any two people can finish them. |

## 5. Day-1 checklist

Once the team agrees on this plan, the following must be done on day 1:

- [ ] Pick a scope level (Minimum / Target / Stretch) and write it into the top of [02-gap-analysis.md](02-gap-analysis.md).
- [ ] Create an Amoy deployer wallet, fund it, write the address into `deployments/amoy.json` (the file does not exist yet — create it).
- [ ] Create a Polygonscan API key (free, takes 2 minutes) and add to `.env.example`.
- [ ] Create a Pinata account (free tier) or stand up a local Kubo node; document credentials in the team password manager (not in the repo).
- [ ] Create a shared Google Drive folder for the deck and the video draft.
- [ ] Create a project board with the tasks from sections 1.A–1.E above. GitHub Projects or a Linear board both work.

After day 1, Phase A starts.
