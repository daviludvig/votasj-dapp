# PD3 Demo Runbook — Seven Vital Flows with Verification

This is the script for the live demo segment of the PD3 video and for any reviewer who wants to reproduce what the team showed. The runbook is structured as **seven flows**, each with:

1. **What happens on screen** — the visible action.
2. **What happens on-chain** — the transaction it produces.
3. **Verification artifact** — the public link or query that a third party can use to confirm the action.

A reviewer should be able to take this runbook, an Amoy block-explorer URL, and a browser, and re-run every flow against the live deployment, getting the same result.

## Pre-demo setup

Before the camera rolls:

- [ ] **Deployment addresses** committed at [deployments/amoy.json](../../deployments/amoy.json). This file does not exist yet — it is produced by the Phase A deploy. Format:

  ```json
  {
    "chainId": 80002,
    "network": "amoy",
    "voterRegistry": "0x…",
    "participatoryBudget": "0x…",
    "executionTracker": "0x…",
    "admin": "0x…",
    "deployedAt": "2026-06-15T…Z",
    "polygonscanBase": "https://amoy.polygonscan.com"
  }
  ```

- [ ] **Demo wallets** pre-funded with Amoy MATIC (deployer, 3 citizen wallets, paymaster).
- [ ] **Demo cycle parameters** set: `opensAt` in the very near future, `closesAt` 10 minutes after `opensAt`. Short window lets the demo show open → vote → close in one take.
- [ ] **Three demo proposals** drafted as Markdown files (title + description + budget + region), ready to be uploaded to IPFS during the demo.
- [ ] **Browser tabs open and arranged**: [1] frontend `/cycle`, [2] frontend `/audit`, [3] Polygonscan Amoy on the `ParticipatoryBudget` address, [4] IPFS gateway tab.
- [ ] **Verification artifact folder** at `docs/pd3/verification/` for storing the post-demo screenshots and tx hashes.

## Verification matrix (high level)

| Flow | Contract method | Event emitted | Verification artifact |
| ---- | --------------- | ------------- | --------------------- |
| 1. Voter registration | `VoterRegistry.registerVoter` | `VoterRegistered(voter, credentialHash)` | Polygonscan tx + decoded event |
| 2. Cycle open | `ParticipatoryBudget.openCycle` | `CycleOpened(cycleId, opensAt, closesAt, budgetWei)` | Polygonscan tx + `cycles(currentCycleId)` view |
| 3. Proposal submission | `ParticipatoryBudget.submitProposal` | `ProposalSubmitted(cycleId, proposalId, submitter, ipfsCid)` | Polygonscan tx + IPFS gateway resolving the CID |
| 4. Voting | `ParticipatoryBudget.vote` | `VoteCast(cycleId, proposalId, voter)` | Polygonscan tx + `hasVoted(cycleId, voter)` view + tally read |
| 5. Cycle close | `ParticipatoryBudget.closeCycle` | `CycleClosed(cycleId, winningProposalId, winningVotes)` | Polygonscan tx + decoded event |
| 6. Public audit | (read-only) | --- | Frontend `/audit` reproduced from Polygonscan event log |
| 7. Execution milestone | `ExecutionTracker.recordMilestone` | `MilestoneRecorded(proposalId, milestoneId, ipfsCid, kind, timestamp)` | Polygonscan tx + IPFS evidence resolving |

Every event listed above has an `event hash` (`topics[0]`). The runbook should include those hashes so the reviewer can query Polygonscan's `getLogs` endpoint directly. The team captures the hashes during Phase A deployment.

## Flow 1 — Voter registration

**On screen:**

1. Open frontend `/login`.
2. Click "Sign in with gov.br (DEMO)".
3. The mock relay returns a signed assertion for the demo CPF `123.456.789-09`.
4. The backend computes `credentialHash = keccak256(cpf || municipality_code || cycle_salt || pepper)` and shows the hash on screen (the CPF is _not_ shown).
5. The backend generates a custodial wallet for the citizen and triggers `VoterRegistry.registerVoter(addr, credentialHash)` from the deployer key.
6. Frontend displays "You are registered. Transaction: `<tx hash>` →".

**On-chain:**

- Transaction: `VoterRegistry.registerVoter(addr, credentialHash)` signed by deployer.
- Event: `VoterRegistered(voter, credentialHash)`.
- State change: `voters[addr].registered = true`, `totalVoters++`.

**Verification:**

- Click the tx-hash link → Polygonscan Amoy → decoded event shows the citizen address and the credential hash.
- In the Read tab of the contract, call `isRegistered(addr)` → returns `true`.
- In the Read tab, call `totalVoters` → matches the demo count.

**Demo narration:** "The chain knows the citizen is eligible to vote. It does not know who the citizen is — only that someone holds a credential hash that gov.br signed. The City Hall cannot register a synthetic voter without a matching gov.br assertion."

## Flow 2 — Cycle opening (admin)

**On screen:**

1. Switch to the admin tab in the frontend.
2. Click "Open cycle" with the pre-filled params (opensAt, closesAt, budgetWei).
3. Wallet (deployer) signs the transaction; frontend shows tx-hash link.
4. After ~2 seconds (Amoy finality), the `/cycle` route updates: cycle is now Open.

**On-chain:**

- Transaction: `ParticipatoryBudget.openCycle(opensAt, closesAt, budgetWei)`.
- Event: `CycleOpened(cycleId, opensAt, closesAt, budgetWei)`.
- State change: `currentCycleId++`, `cycles[currentCycleId].status = Open`.

**Verification:**

- Click the tx hash → Polygonscan → decoded event payload visible.
- Read tab: `cycles(currentCycleId)` → struct fields show Open status and the opensAt/closesAt timestamps.
- The frontend reads from the same source the reviewer reads from.

## Flow 3 — Proposal submission (citizen)

**On screen:**

1. The first citizen (already registered in Flow 1) navigates to `/propose`.
2. Fills the form: title, description, budget requested, region. Optionally attaches a photo.
3. On submit: backend uploads `{title, description, budget, region, photo}` to IPFS via Pinata. The CID is shown on screen.
4. Frontend calls `submitProposal(cid)`. Tx hash + Polygonscan link displayed.
5. The proposal appears on `/cycle` with vote count = 0.

Repeat for two more citizens with different proposals so the demo has at least 3 proposals to vote on.

**On-chain:**

- Transactions: 3× `submitProposal(cid)`.
- Events: 3× `ProposalSubmitted(cycleId, proposalId, submitter, ipfsCid)`.
- State change: 3× `proposalCount++`, proposal struct stored.

**Verification:**

- Each tx hash on Polygonscan with the decoded CID.
- Paste the CID into `https://ipfs.io/ipfs/<cid>` (or the Pinata gateway) → the proposal content resolves.
- Read tab: `getProposal(cycleId, proposalId)` returns the CID and 0 votes.

**Demo narration:** "Proposal content lives on IPFS, addressed by its hash. The chain stores only the CID and the submitter. Anyone can resolve the CID; nobody can change it without breaking the link."

## Flow 4 — Voting

**On screen:**

1. Each demo citizen (we use at least 3, ideally 5) navigates to `/vote`.
2. Picks a proposal. Clicks "Vote". The custodial wallet signs.
3. Frontend shows the tx hash. The vote count on `/cycle` increments live.
4. Citizens who try to vote a second time see "You already voted" — the button is disabled and the contract reverts if forced.

**On-chain:**

- Transactions: N × `vote(proposalId)`.
- Events: N × `VoteCast(cycleId, proposalId, voter)`.
- State change: `hasVoted[cycleId][voter] = true`, `proposal.votes++`, `cycle.totalVotes++`.

**Verification:**

- Each `VoteCast` event on Polygonscan with the voter address.
- Read tab: `hasVoted(cycleId, voter)` → `true` for every demo voter.
- Read tab: `getProposal(cycleId, proposalId)` → the vote count matches the on-screen tally.

**Demo narration:** "One voter, one vote, one cycle. The mapping `hasVoted[cycle][address]` is the on-chain enforcement; there is no way to vote twice without a different registered address, and a different registered address requires a different gov.br assertion."

## Flow 5 — Cycle close

**On screen:**

1. The presenter waits for `closesAt` to elapse (or skips ahead by setting a short window during pre-demo setup).
2. Anyone — the demo presses it from the admin tab to keep the camera focused — calls `closeCycle()`.
3. The frontend shows the tx hash. The `/cycle` view flips to Closed and highlights the winner.

**On-chain:**

- Transaction: `closeCycle()` (callable by anyone after `closesAt`).
- Event: `CycleClosed(cycleId, winningProposalId, winningVotes)`.
- State change: `cycle.status = Closed`, `cycle.winningProposalId = <id>`.

**Verification:**

- The decoded event on Polygonscan shows the winning proposal and its vote count.
- A reviewer can compute the winner themselves from the per-proposal `votes` reads — and arrive at the same result.

**Demo narration:** "There is no off-chain tally. The contract iterates the proposals, takes the maximum, and emits the result. Any party with an RPC client and the contract address can recompute the same number; nobody has to trust the City Hall's announcement."

## Flow 6 — Public audit

**On screen:**

1. Open `/audit` in the browser. The page shows the full event feed for the current cycle: 1 cycle-opened, 3 proposal-submitted, N vote-cast, 1 cycle-closed.
2. Each row links to Polygonscan; the team clicks one to show the raw event.
3. Open a fresh browser window (camera shows this is an _unrelated session_) and navigate directly to Polygonscan's Logs tab on the contract.
4. The same events appear there.

**Verification:**

- The frontend `/audit` page is just a reader of the public chain — it has no privileged source. A reviewer can reproduce the page entirely from Polygonscan's API.
- The team includes a one-line `curl` example in the runbook so a reviewer can `curl https://api-amoy.polygonscan.com/api?module=logs&action=getLogs&address=<address>&topic0=<event_hash>` and confirm.

**Demo narration:** "This page is the proof, not the announcement. If the team disappeared tomorrow, every reviewer with an internet connection could rebuild it from the chain. The City Hall does not have a privileged audit channel because nobody needs one."

## Flow 7 — Execution milestone

**On screen:**

1. Switch back to the admin tab. The winning proposal is highlighted on `/cycle`.
2. Click "Record milestone" → kind = `ContractSigned`, evidence = a scanned-PDF or photo uploaded to IPFS.
3. Tx hash shown. The proposal's execution timeline updates with the new milestone.
4. Repeat once more with kind = `WorkStarted` to show progression.

**On-chain:**

- Transactions: 2× `ExecutionTracker.recordMilestone(proposalId, milestoneId, ipfsCid, kind)`.
- Events: 2× `MilestoneRecorded(proposalId, milestoneId, ipfsCid, kind, timestamp)`.

**Verification:**

- Each milestone on Polygonscan with the IPFS CID in the payload.
- Pasting the CID into the IPFS gateway resolves to the uploaded evidence (PDF, photo).
- The `/audit` event feed picks up the new events the same way it picked up votes.

**Demo narration:** "This is the accountability loop. The same chain that recorded the vote now records what happened with the budget. The citizen who voted for this proposal can verify, without filing a Freedom-of-Information request, that the contract was signed and the work started."

## Post-demo

Right after the recording stops, capture and commit:

- All transaction hashes from the demo cycle into [docs/pd3/verification/tx-hashes.md](verification/tx-hashes.md) (create the file in Phase D).
- Screenshots of the Polygonscan event log for each flow into [docs/pd3/verification/](verification/).
- The IPFS CIDs and the gateway URLs that resolved during the demo.

The PD3 submission email points the reviewer at this folder so they can spot-check any of the seven flows after the fact.

## What can go wrong during the live demo (and what to do)

| Symptom | Cause | Recovery |
| ------- | ----- | -------- |
| Tx pending > 10 s | Amoy congestion or low gas price | Bump gas price in the frontend's ethers config; have a "retry" button visible. |
| Wallet "insufficient funds" | Deployer / paymaster low on MATIC | Pre-funded reserves in a second wallet; the runbook has a one-line top-up command. |
| Polygonscan slow to index | Indexer lag | The frontend reads directly from RPC, not Polygonscan. Show the read in the contract's Read tab instead. |
| IPFS gateway 404 | Pinata replication slow | Have a backup gateway URL ready (`https://cloudflare-ipfs.com/ipfs/<cid>`). Mention the multi-gateway property on camera. |
| Frontend crash | bad state mid-demo | The seven flows are independent: skip to the next one and recover later. The demo is judged on the verification, not on UI polish. |

The runbook does not assume nothing breaks. It assumes that when something breaks, the team can fall back to a transaction-by-transaction walkthrough on Polygonscan and still hit every verification point.
