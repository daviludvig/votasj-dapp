# PD3 Demo Runbook — Five Vital Flows, Verified Locally

> **Scope note (read this first):** PD3 is delivered against the repository as it exists today — two audited-by-tests Solidity contracts (`VoterRegistry`, `ParticipatoryBudget`) exercised on a local EVM. There is no frontend, no backend, no gov.br integration, and no public testnet deployment yet; those are the roadmap items tracked in [01-development-plan.md](01-development-plan.md) and [02-gap-analysis.md](02-gap-analysis.md). This runbook documents the demo the team can actually run and any reviewer can actually reproduce **today**, with no dependency on a third-party service staying online. The pitch deck and video script that consume this runbook live in this same folder — start at [05-pitch-deck-outline.md](05-pitch-deck-outline.md).

## Two non-negotiable properties of the demo

1. **Demonstrability.** Every vital step of the cycle (register → open → propose → vote → close/tally) is shown live, end-to-end, with real transactions against a real EVM (Hardhat's built-in network, or `localhost` if the reviewer starts `npm run node` first — same contracts, same behavior).
2. **Verifiability.** Each step has a verification path a third party can run **without asking the team for anything**: the same `npm run demo` command produces the same transaction sequence and event log, and `npm test` / `npm run coverage` independently confirm every guard rail. Nothing in the demo relies on "trust us" footage.

## The single command that is the demo

```bash
npm run demo
```

This runs [`scripts/demo-cycle.js`](../../scripts/demo-cycle.js): it deploys both contracts, registers three citizens, opens a cycle, submits three real participatory-budget proposals, casts votes, closes the cycle, and reads the final tally straight back from the contract. It also **actively attempts five illegal actions** (double registration, an unregistered address submitting a proposal, an unregistered address voting, double voting, and closing early) and asserts that each one reverts with the exact reason string documented in the test suite. If any guard rail fails to trip, the script exits non-zero — the demo is a live self-check, not just a scripted happy path.

Every run writes a fresh, timestamped, human-readable report to `reports/demo-cycle-report.md` (and a machine-readable twin at `reports/demo-cycle-report.json`), listing every transaction hash, block number, gas cost, and decoded event. A committed example of this exact output is at [evidence/sample-demo-report.md](evidence/sample-demo-report.md) — regenerate it yourself and compare line by line.

This same command runs in CI on every push and pull request, **on both Ubuntu and Windows runners** (see the `demo` job in [.github/workflows/ci.yml](../../.github/workflows/ci.yml)), and each run's report is uploaded as a build artifact. Anyone can open the Actions tab on GitHub, pick any run, and download that run's evidence report without running anything locally. The `test` job additionally runs across Node 20 and 22, and `coverage` fails the build outright if any category drops below 100% — these are gates, not just reports.

## Flow-by-flow verification matrix

| Flow | Contract method | Event emitted | Verification |
| ---- | ---------------- | ------------- | ------------- |
| 1. Voter registration | `VoterRegistry.registerVoter` | `VoterRegistered(voter, credentialHash)` | `registry.isRegistered(addr)` reads `true`; `registry.totalVoters()` increments; a second registration of the same address reverts with `"VoterRegistry: already registered"`. |
| 2. Cycle open | `ParticipatoryBudget.openCycle` | `CycleOpened(cycleId, opensAt, closesAt, budgetWei)` | `budget.cycles(currentCycleId)` reads status `Open` (`1`) with the same timestamps passed in. |
| 3. Proposal submission | `ParticipatoryBudget.submitProposal` | `ProposalSubmitted(cycleId, proposalId, submitter, ipfsCid)` | `budget.getProposal(cycleId, proposalId)` returns the same CID and submitter; submission from an unregistered address reverts with `"Budget: submitter not registered"`. |
| 4. Voting | `ParticipatoryBudget.vote` | `VoteCast(cycleId, proposalId, voter)` | `budget.hasVoted(cycleId, voter)` reads `true`; the per-proposal vote count in `getProposal` increments by exactly one; a second vote from the same address reverts with `"Budget: already voted"`. |
| 5. Cycle close and tally | `ParticipatoryBudget.closeCycle` | `CycleClosed(cycleId, winningProposalId, winningVotes)` | `budget.cycles(cycleId).winningProposalId` matches the event; a reviewer can independently recompute the winner by reading every proposal's vote count and taking the maximum — the contract does nothing the reviewer cannot redo by hand. Closing before `closesAt` reverts with `"Budget: cycle still running"`. |

Every one of these checks is also encoded as an automated test in [test/ParticipatoryBudget.test.js](../../test/ParticipatoryBudget.test.js) and [test/VoterRegistry.test.js](../../test/VoterRegistry.test.js) — 43 tests, 100% statement/branch/function/line coverage (`npm run coverage`). The demo script is the narrated version of the same guarantees; the test suite is the exhaustive version.

## Running the demo live (for the recording or for a reviewer)

1. `npm install` — no keys, no accounts, no external services required.
2. `npm run demo` — completes in under two seconds on a laptop. Everything prints to the terminal as it happens: contract addresses, every transaction hash, every gas cost, every decoded event, and a final tally read straight from the chain.
3. Open `reports/demo-cycle-report.md` — the same run, saved. This is the file to paste into the pitch deck's "traction" slide and to attach to the PD3 submission as the evidence artifact.
4. Optional — to show the flows against a network that persists across two terminals (closer to how a real deployment behaves), run `npm run node` in one terminal and `npm run demo:local` in another; the exact same script targets `localhost` instead of the in-process network. The step-by-step console walkthrough in the root [README.md](../../README.md#6-interact-with-the-contracts) shows the manual, un-scripted version of the same flow for anyone who wants to type the calls themselves.
5. `npm test` additionally prints a gas-cost table for every contract method (written to `reports/gas-report.txt`), and `npm run metrics` reports lines of code, per-function complexity, and deployed bytecode size against the 24,576-byte EIP-170 limit (written to `reports/contract-metrics.md`). These are the structural counterpart to the behavioral evidence above — proof the contracts are small and simple, not just that they pass their own tests.

## What this demo deliberately does not claim

- **No public testnet.** The contracts are network-agnostic (see `hardhat.config.js`'s `amoy` network entry and `scripts/deploy.js`); deploying to Polygon Amoy only requires funding a deployer wallet and running `npm run deploy:amoy`. It has not been done for this delivery. If it happens before submission, this section gets a Polygonscan link and nothing else about the runbook changes — the flows and verification matrix above are identical on Amoy.
- **No gov.br, no IPFS, no frontend.** The `credentialHash` in the demo is a `keccak256` of a label string (`"govbr:ana"`), not a real gov.br assertion; proposal content is referenced by a plausible-looking but non-resolving IPFS URI. Both are exactly what the long white paper specifies as the _interface_ the chain expects — the off-chain systems that produce real values for these fields are future work, tracked in [02-gap-analysis.md](02-gap-analysis.md).
- **No `ExecutionTracker` milestone tracking.** Not built. Documented as `MUST (Target scope)` in the gap analysis; out of scope for this delivery.

## What can go wrong during the live recording (and what to do)

| Symptom | Cause | Recovery |
| ------- | ----- | -------- |
| `npm run demo` throws a guard-rail assertion error | An intentional revert did not fire, or fired with the wrong reason — i.e., a real regression | Do not paper over it on camera. Re-run `npm test` to isolate which contract behavior changed, fix it, re-run the demo. This is exactly the kind of thing the script exists to catch before a reviewer does. |
| Node version warning on startup | Hardhat officially supports Node 20 LTS; newer versions print a warning but still work | Ignore the warning, or run `nvm use 20` first. |
| Terminal window too small to read on 1080p playback | — | Zoom the terminal font before recording; re-run `npm run demo` as many times as needed, output is deterministic in structure (values like tx hashes differ per run — that is expected and fine to point out on camera). |
