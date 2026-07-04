# Q&A Prep

Anticipated questions from the professor, a classmate acting as a skeptical reviewer, or an actual investor role-play. Prepared answers below are meant to be said in the team's own words, not memorized verbatim — the goal is to never be caught flat-footed by a question the team should have already asked itself.

## "Your white paper describes a production-ready platform with a multisig, a timelock, an execution tracker, and institutional partners. None of that is in the demo. Why?"

This is the single most likely question, and the team should welcome it rather than dread it.

**Answer:** "The white papers describe the target production design — that's what a white paper is for. PD3 demonstrates the subset of that design we've actually built and can prove works: two contracts, `VoterRegistry` and `ParticipatoryBudget`, with 100% test coverage and a reproducible one-command demo. We chose to show less and prove all of it, rather than show more and ask you to trust the parts we can't verify live. The gap — multisig, timelock, `ExecutionTracker`, gov.br, IPFS, a public testnet deployment — is our actual roadmap, itemized with priority labels in [02-gap-analysis.md](02-gap-analysis.md), not a secret we're hoping nobody notices."

Do not get defensive about this. The gap analysis document already exists precisely to make this answer easy — point to it if pressed for detail.

## "How do I know your tests actually test anything, and aren't just checking that the code doesn't crash?"

**Answer:** "Two ways. First, every test asserts a specific, named revert reason — not just 'this call fails,' but 'this call fails with exactly this string,' which is the same string the contract's `require` statements use. Second, coverage is 100% across statements, branches, functions, and lines — which means every `if` and every `require` in both contracts has been exercised in both its pass and fail direction. You can run `npm run coverage` yourself on a clean clone and get the same number."

If asked to prove it live: run `npm test` and `npm run coverage` on camera or in the room.

## "What happens if someone votes twice, or an unregistered address tries to vote?"

**Answer:** "The contract rejects it, and our demo doesn't just claim that — it tries it. `npm run demo` actively attempts five illegal actions: double registration, an unregistered address submitting a proposal, an unregistered address voting, double voting, and closing a cycle before its deadline. All five are asserted to revert with the exact reason string the tests use. If any one of them didn't revert, the demo script itself would fail and exit non-zero — it's a live self-check, not a script we trust to only show the happy path."

## "Why isn't this deployed on a public testnet? Wouldn't that be more convincing?"

**Answer:** "It would add a network-availability dependency to the demo without changing the underlying claim. Every guarantee we show — one vote per address, deterministic tally, admin-gated cycle management — is a property of the Solidity code, and it behaves identically whether it's running on Hardhat's in-process network, `localhost`, Polygon Amoy, or Polygon mainnet. `hardhat.config.js` already has an `amoy` network entry and `scripts/deploy.js` is network-agnostic; deploying is a roadmap item that requires funding a wallet and running one command, not a code change. We prioritized proving correctness over adding a network dependency we'd have to keep funded and online for the reviewer."

## "Why gov.br / IPFS mocks instead of the real thing?"

**Answer:** "Both are off-chain systems outside the contracts' scope. The contracts are designed against a stable interface — a `bytes32` credential hash for eligibility, a string CID for proposal content — and that interface doesn't change whether the hash comes from a real signed gov.br assertion or, as in our demo, from `keccak256` of a label. Building the real relay and the real IPFS pinning pipeline is Phase B of our development plan ([01-development-plan.md](01-development-plan.md)) — it's integration work, not a risk to the on-chain guarantees we're demonstrating today."

## "What's the actual cost per vote, and how confident are you in that number?"

**Answer:** "We measured, not estimated: roughly 372,000 gas for one citizen's complete flow — register, submit a proposal, and vote — in this repository's own demo run (`reports/demo-cycle-report.md`, regenerate it yourself with `npm run demo`). That's an in-process measurement; the real number on Polygon Amoy or mainnet will vary with network gas price, but the gas _units_ the EVM charges for this exact bytecode won't meaningfully change between networks. We haven't yet re-measured on a live testnet, which is exactly why we're not quoting a reais-per-vote figure in this deck."

## "Who is your actual customer conversation with? Do you have a letter of intent?"

**Answer:** "No signed agreement exists yet — we have not claimed one. The 'ask' in our deck is explicitly for an institutional pilot _conversation_, not a confirmed partnership. Anything suggesting an existing partnership with São José City Hall, UFSC's Blockchain Lab, or TCE-SC should be read as the target production design in the white paper, not a claim we're standing behind today." (If the short white paper's "Traction" section is quoted back, acknowledge directly: "that paragraph describes the production target; we're correcting the framing for PD3 to only claim what's built.")

## "What's the single biggest risk to this actually working in production?"

**Answer:** "Institutional, not technical. The legal opinion on whether a digital, gov.br-authenticated vote satisfies São José's Organic Law requirements for a binding participatory-budget cycle, and the ANPD's position on hash-anchored eligibility under LGPD — both are listed as unresolved in [docs/pd1/blockchain-canvas.md](../pd1/blockchain-canvas.md) under 'Points to Verify.' The contract logic is the easy part; getting a City Hall's legal department comfortable with 'the chain never sees a CPF' is the actual bottleneck."

## "What would make you _not_ recommend a City Hall adopt this today?"

**Answer:** "As it stands today — two contracts and a local demo — a City Hall shouldn't run a binding cycle on this yet, and we wouldn't tell them to. The roadmap in slide 9 (gov.br integration, a public deployment, an external audit, the multisig) exists precisely because those are the gates between 'demonstrably correct contract logic' and 'safe to bind real budget decisions to.' We'd rather say that than oversell an MVP." This question rewards a direct answer — dodging it undermines the credibility the rest of the deck built.

## "Your short paper says payback is one cycle — is that actually right?"

**Answer:** "Only at the optimistic corner of the paper's own numbers. Seed ask is BRL 400 to 600 thousand, net savings per cycle is BRL 170 to 300 thousand — divide those and payback ranges from about 1.3 cycles at best case to 3.5 cycles at worst case, roughly 2 cycles at the midpoint. 'One cycle' is true only if you pick the lowest ask and the highest savings simultaneously. We'd rather say 'one and a half to two cycles, realistically' than repeat a best-case number as if it were the expectation." Full derivation in [10-business-metrics.md](10-business-metrics.md) — pull it up if asked to show the math.

## Quick reference: numbers to have memorized

| Claim | Number | Source |
| ----- | ------ | ------ |
| Test count | 43 (incl. a 500-voter scale test) | `npm test` |
| Coverage | 100% stmts/branches/funcs/lines | `npm run coverage` |
| Gas, full citizen flow | ≈ 372k gas (register + propose + vote) | `reports/demo-cycle-report.md` |
| Contract size | 4,612 B / 1,871 B (both well under the 24,576 B EIP-170 limit) | `npm run metrics` |
| Turnout today | < 2% of ~180,000 voters | [docs/pd1/blockchain-canvas.md](../pd1/blockchain-canvas.md) |
| Current process cost | BRL 300–500k/cycle | PD1 canvas + PD2 short paper |
| Target VotaSJ cost | BRL 90–160k/cycle, all-in | PD2 short paper |
| Subscription price | BRL 180–250k/yr per municipality | PD1 canvas + PD2 short paper |
| Seed ask | BRL 400–600k | PD2 short paper |
| Realistic payback | ≈ 1.3–3.5 cycles (not a flat "one cycle") | [10-business-metrics.md](10-business-metrics.md) |
| CAC payback | ≈ 1.4–2.0 months (if the BRL 30k CAC estimate holds) | [10-business-metrics.md](10-business-metrics.md) |
