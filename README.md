# VotaSJ — Digital Participatory Budgeting for São José/SC

Course **INE5458 — Blockchain and Cryptocurrency Technologies** — UFSC 2026/1

A decentralized voting platform for the São José/SC participatory budget. Every stage of the cycle (voter registration, proposal submission, voting, tallying) is recorded on a public blockchain (Polygon PoS), removing the central trusted authority and enabling open auditing by any citizen.

## Course Deliverables

| PD | Weight | Artifact | Due | Status |
| -- | ------ | -------- | --- | ------ |
| PD1 | 80% Business Canvas + 20% Blockchain Canvas | [docs/business-canvas.md](docs/business-canvas.md), [docs/blockchain-canvas.md](docs/blockchain-canvas.md) | 2026-04-29 | drafted |
| PD2 | Long white paper (≥ 8 pages, technical) + Short white paper (≤ 2 pages, business/user) | `docs/whitepaper-long.md`, `docs/whitepaper-short.md` | TBD | not started |
| PD3 | Pitch deck (5 or 10 slides) + 10–15 min team video + MVP demo, uploaded as unlisted YouTube link | `docs/pitch-deck.pdf`, `frontend/` | TBD | not started |

### What each PD expects (derived from the course slides in [sources/](sources/))

- **PD1 — Canvases.** Business Model Canvas (Osterwalder, 9 boxes) graded on completeness (0.3/box) and cross-block correlation (0.8/box); Blockchain Canvas (Sajida Zouarhi template: Problem, Solution, Entities, Divergence, Motivation, Network Peers, Transactions, Data, Type of Processing, Value, Network Dynamics, Points to Verify) graded on completeness only.
- **PD2 — Two white papers.** A _long_ one that is technically focused (≥ 8 pages) and must convince a reader of the project's technical feasibility and innovation; a _short_ one (≤ 2 pages) that is business/user focused and must convince both an investor and a user. The canvases from PD1 feed directly into these documents.
- **PD3 — Pitch + MVP.** A pitch deck (5-slide or 10-slide strategy from the course material) and a 10–15 minute recorded video of the full team pitching, ending in a live demo of the MVP (this repository). Uploaded as an unlisted YouTube video; the link plus the source code is the final deliverable.

## Repository Layout

```text
contracts/         Smart contracts (Solidity 0.8.24)
  VoterRegistry.sol         Eligible-voter registry
  ParticipatoryBudget.sol   Voting cycle (open, propose, vote, tally)
test/              Hardhat tests (ethers v6 + chai)
scripts/           Deployment scripts
docs/              Canvases, white papers, and diagrams
frontend/          (reserved for PD3 MVP demo)
sources/           Course slides (Canvas, White Paper, Pitch Deck lectures) — git-ignored
```

## Stack

- Solidity 0.8.24 + Hardhat 2.22
- ethers v6 + chai (tests)
- Polygon PoS (Amoy testnet for PD2/PD3)
- IPFS for proposal metadata
- gov.br (OIDC) for off-chain identity proof

---

## Running the project

### Prerequisites

- **Node.js 20 LTS.** Hardhat does not officially support Node 22+; newer versions work but print a warning. If you use `nvm`:

  ```bash
  nvm install 20
  nvm use 20
  ```

- **Git** and an editor.

### 1. Install dependencies

```bash
npm install
```

No keys or environment variables are required at this point — installation is fully offline after the initial `npm install`.

### 2. Run the test suite

```bash
npm test          # compiles + runs the full Hardhat test suite (~40 tests)
npm run coverage  # same suite under istanbul, writes ./coverage/
npm run lint      # solhint + eslint + markdownlint
```

`npm test` is the fastest way to exercise the whole flow (registration → open cycle → submit proposal → vote → tally). The same four checks (lint, compile, test, coverage) run on every push and pull request via GitHub Actions — see [.github/workflows/ci.yml](.github/workflows/ci.yml).

### 3. Run a local blockchain and deploy against it

In one terminal, start a local JSON-RPC node with 20 pre-funded test accounts:

```bash
npm run node
```

The node prints the accounts and their private keys — these are **publicly known test keys**, never use them on any real network. Leave this terminal running.

In a second terminal, deploy the contracts to the local node:

```bash
npm run deploy:local
```

The deploy script prints the addresses of `VoterRegistry` and `ParticipatoryBudget`. Because the local node is deterministic, the first deployment always lands on the same addresses.

### 4. Interact with the contracts

From a third terminal, open an interactive console attached to the local node:

```bash
npx hardhat console --network localhost
```

Example of a full cycle inside the console — registration, opening a cycle, submitting a proposal, voting, and closing:

```javascript
const registry = await ethers.getContractAt("VoterRegistry", "<REGISTRY_ADDRESS>");
const budget   = await ethers.getContractAt("ParticipatoryBudget", "<BUDGET_ADDRESS>");
const [admin, alice, bob] = await ethers.getSigners();

await registry.registerVoter(alice.address, ethers.keccak256(ethers.toUtf8Bytes("govbr:alice")));
await registry.registerVoter(bob.address,   ethers.keccak256(ethers.toUtf8Bytes("govbr:bob")));

const now = (await ethers.provider.getBlock("latest")).timestamp;
await budget.openCycle(now + 1, now + 3600, ethers.parseEther("100"));

await budget.connect(alice).submitProposal("ipfs://QmExample");
await budget.connect(alice).vote(1);
await budget.connect(bob).vote(1);

// fast-forward past the cycle deadline
await network.provider.send("evm_increaseTime", [3600]);
await network.provider.send("evm_mine");

await budget.closeCycle();
(await budget.cycles(1)).winningProposalId;  // -> 1n
```

> REPL tip: do not start a line with `.` in the Node REPL — it is interpreted as a REPL command (`.help`, `.exit`). Keep method chains on a single line.

### 5. Deploy to Polygon Amoy (public testnet)

For any deployment to a real network you need two secrets:

- **RPC URL** of a Polygon Amoy node.
- **Private key** of a deployer account, funded with test MATIC.

Neither is checked into the repo. Create a `.env` file at the repository root (it is in `.gitignore`):

```bash
cp .env.example .env
```

Then fill in the two variables:

| Variable | How to obtain |
| -------- | ------------- |
| `AMOY_RPC_URL` | Free public endpoint: `https://rpc-amoy.polygon.technology` — works without signup but is rate-limited and occasionally unreliable. For production use, get a dedicated endpoint at [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/) — free tier, sign up with email, create an app targeting `Polygon Amoy`, copy the HTTPS URL. |
| `DEPLOYER_PRIVATE_KEY` | Create a fresh wallet in MetaMask (or `openssl rand -hex 32`), export the private key. **Use a throwaway account, not a wallet that ever touched real funds.** Then fund it with test MATIC from the [Polygon Amoy faucet](https://faucet.polygon.technology/) — paste the wallet address, pick Amoy, request. You get ~0.2 test MATIC per request, enough for many deployments. |

After filling in `.env`:

```bash
npm run deploy:amoy
```

This sends two real transactions to Amoy and prints the deployed addresses. They can be inspected at [amoy.polygonscan.com](https://amoy.polygonscan.com/).

### Keys summary

| Context | Keys needed |
| ------- | ----------- |
| `npm test` | None — in-process network. |
| `npm run node` + `npm run deploy:local` | None — Hardhat generates 20 test accounts with publicly known keys. |
| `npm run deploy:amoy` | `AMOY_RPC_URL` and `DEPLOYER_PRIVATE_KEY` in `.env`. |
| Polygon mainnet | Out of scope for the discipline — do not deploy there. |

---

## Contributing

All changes land on `main` via pull request from a feature branch — no direct pushes. Commit conventions, branch naming, and how to apply GitHub branch-protection rules are in [CONTRIBUTING.md](CONTRIBUTING.md).

## MVP scope (PD1)

- Single admin (City Hall) — the 3-of-5 multisig arrives in PD2.
- Plaintext voting (transparent) — zk-SNARK vote privacy arrives in PD2.
- Simple-majority tally — alternative schemes (quadratic, per-region) arrive in PD3.

These simplifications are intentional for the first delivery; the rationale and evolution roadmap are documented in [docs/blockchain-canvas.md](docs/blockchain-canvas.md) under _Points to verify_.
