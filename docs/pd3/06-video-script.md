# PD3 Video Script — 10 to 15 Minutes, Three Parts

The course spec is explicit: a 15-minute video, structured in three parts (canvas, white paper, MVP demo), with the full team pitching, uploaded as an unlisted YouTube link. This document is the minute-by-minute script and the recording setup. Read it twice before recording.

## Total budget

| Part | Duration | Owner |
| ---- | -------- | ----- |
| 0. Intro and team | 0:00–1:00 (1 min) | All four on screen |
| 1. Canvas walkthrough | 1:00–4:00 (3 min) | Davi or Arthur |
| 2. White paper highlights | 4:00–8:00 (4 min) | Lucas + Arthur |
| 3. MVP demo (the seven flows) | 8:00–14:00 (6 min) | Pedro driving, Davi narrating |
| 4. Wrap and ask | 14:00–15:00 (1 min) | All four |

Hard cap at 15:00. If the demo runs long, the team trims the canvas segment, not the demo.

## Recording setup (do this before the team meets to record)

- **Format:** 1080p, 30 fps. OBS Studio or QuickTime Screen Recording for the screen segments; webcam for the talking-head segments.
- **Three independent files**, one per segment, so any one segment can be re-shot:
  - `00-intro.mov` (intro + team)
  - `01-canvas-whitepaper.mov` (canvas + white paper)
  - `02-demo.mov` (live demo, screen-recorded)
- **Audio:** every team member uses a headset mic, not laptop mics. Test 5 seconds of audio at the start of each take.
- **Visible artifacts at all times during the demo:** wall-clock with seconds, the Polygonscan tab, the frontend tab, the IPFS gateway tab.
- **Final edit** combines the three segments with simple cross-fades. No background music; the demo audio is the credibility signal.

## Part 0 — Intro and team (0:00–1:00)

All four team members on camera (split-screen via the editor or a single shot if same room).

**Davi:** "We are the VotaSJ team — Davi, Lucas, Arthur, and Pedro — students of INE5458 at UFSC. VotaSJ is a blockchain-anchored participatory budgeting platform for São José, Santa Catarina. In the next 15 minutes we will walk through the project canvas, summarize the white paper, and run the live MVP on Polygon Amoy. Everything you see in the demo is reproducible from our public repository and the Amoy block explorer."

Optional: brief one-sentence intro per member ("I work on the smart contracts", "I work on security and tests", etc.) — only if the team has time inside the 1-minute budget.

## Part 1 — Canvas walkthrough (1:00–4:00)

Screen shows the PD1 Business Canvas image followed by the Blockchain Canvas image. Davi or Arthur narrates over each.

**Beat 1 (1:00–2:00) — Business Canvas:** "Our customer is São José City Hall on the buying side, and approximately 180 000 eligible citizens on the using side. Our value proposition is the only one that the existing process structurally cannot offer: a count that nobody has to trust because anyone can audit it. Revenue is a B2G SaaS subscription — between BRL 180k and 250k per year per municipality — plus a per-cycle setup fee. Citizens never pay."

**Beat 2 (2:00–3:00) — Blockchain Canvas:** "The trust problem is horizontal and political — citizens distrust the City Hall to count its own vote, the opposition distrusts the incumbent, and auditors distrust the speed of the process. Blockchain fits because there is no single trusted third party that all parties agree to. We use Polygon PoS, with administration on a multisig that splits authority between the City Hall, UFSC, and TCE-SC, and a 14-day timelock for any rule change. Reads are permissionless; writes are gated."

**Beat 3 (3:00–4:00) — Why blockchain (concretely):** "We considered three alternatives — a normal database, a database with cryptographic audit logs, and a PKI-only design — and each leaves the integrity guarantee dependent on the operator. A public L2 with an external validator set is the only candidate where the count survives an adversarial operator. Section 3 of the long paper details this."

## Part 2 — White paper highlights (4:00–8:00)

Screen shows the long white paper PDF, scrolling slowly. Lucas and Arthur split the narration.

**Beat 1 (4:00–5:00) — Smart-contract design (Lucas):** "Two contracts on-chain plus an execution tracker. The `VoterRegistry` stores eligibility commitments, the `ParticipatoryBudget` runs the cycle state machine, and the `ExecutionTracker` records milestones of the winning proposal. The cycle is a three-state machine — Pending, Open, Closed. We bound the number of proposals per cycle at 500 so the tally fits under Polygon's block gas limit. The full implementation notes are in section 6.5 of the paper."

**Beat 2 (5:00–6:00) — Identity flow (Arthur):** "Citizens authenticate with gov.br, the Brazilian federal identity provider. The backend computes a salted hash of the CPF that includes a per-cycle pepper. The chain never sees a CPF — only the hash. This is the LGPD compliance posture: hash-anchored eligibility, no personal data on-chain, and a per-cycle pepper that breaks long-term linkability."

**Beat 3 (6:00–7:00) — Threat model and operational runbook (Lucas):** "Three threat classes — adversarial City Hall, external attacker, vote buyer. The multisig blocks unilateral admin action; the 14-day timelock blocks rule changes during an active vote; the gov.br federation blocks Sybil at the source. Section 13.1 of the paper has a one-page operational runbook with the eight stages of a cycle and who owns each."

**Beat 4 (7:00–8:00) — Cost (Arthur):** "Current physical process: 300 to 500 thousand reais per cycle. VotaSJ: 90 to 160 thousand per cycle, all-in, including the external smart-contract audit budget. Net savings of 170 to 300 thousand per cycle to the buyer, before counting the political value of an unimpeachable result. The per-vote gas cost on Polygon is roughly USD 0.005 — three orders of magnitude below the existing process."

## Part 3 — MVP demo (8:00–14:00)

**Screen capture only.** Pedro drives the keyboard and mouse; Davi narrates. This segment follows [03-demo-runbook.md](03-demo-runbook.md) flow by flow. Each flow gets approximately 50 seconds.

> **Visual rule:** every transaction hash must remain on screen for at least 3 seconds. The audience must be able to pause the video, copy the hash, and look it up on Polygonscan. This is the entire point of the verifiability story.

**8:00–8:50 — Flow 1: Registration**

Davi: "We start with a citizen registering. The frontend redirects to a mock gov.br endpoint — clearly labeled DEMO in the UI — and the backend signs a credential hash. The hash is committed to the `VoterRegistry`. Here is the transaction." _(Polygonscan tab shown.)_ "The event log on Polygonscan shows the citizen's wallet address and the credential hash. The contract's `isRegistered` read returns true. No CPF is anywhere on-chain."

**8:50–9:40 — Flow 2: Cycle open**

Davi: "An administrator — in the production design, the 3-of-5 multisig; in this demo, our single deployer key — opens a cycle. Open-cycle parameters are the open and close timestamps and the budget. The contract emits `CycleOpened`. The cycle is now Open and accepting proposals." _(Polygonscan tx + decoded event shown.)_

**9:40–10:30 — Flow 3: Proposal submission**

Davi: "Three different registered citizens submit three proposals. Each proposal's content — title, description, budget breakdown — is pinned to IPFS. The chain stores only the CID. Here is the IPFS gateway resolving the CID — the content is public, addressable by its hash, and immutable." _(IPFS gateway tab shown with proposal content; Polygonscan tab with `ProposalSubmitted` event.)_

**10:30–11:20 — Flow 4: Voting**

Davi: "Each of our demo citizens votes. The contract enforces one vote per voter per cycle through the `hasVoted` mapping; trying to vote a second time reverts. The frontend's `/cycle` page updates in real time as votes land. The vote counts here are reads from the contract — the frontend has no privileged source."

_Show 5 vote-cast events on Polygonscan, then the second-vote attempt failing with the `Budget: already voted` revert reason._

**11:20–12:10 — Flow 5: Cycle close**

Davi: "After the close timestamp, anyone can call `closeCycle()` — the production design uses Chainlink Automation, the demo uses a manual call to keep the camera focused. The contract iterates the proposals, picks the winner, and emits `CycleClosed`. Here is the event — winning proposal id, winning vote count. There is no off-chain tally; the result is whatever the chain says it is."

**12:10–13:00 — Flow 6: Public audit**

Davi: "This `/audit` page is the verifiability surface. Every event from the cycle — opened, three proposed, five voted, closed — is here, with a Polygonscan deep-link per event. Now I open Polygonscan directly, in a separate fresh tab, and pull the contract's logs." _(Fresh Polygonscan tab; the same events appear.)_ "Same data. If our team disappeared tomorrow, every reviewer with an internet connection could rebuild this page from the chain."

**13:00–14:00 — Flow 7: Execution milestone**

Davi: "The winning proposal moves to execution. The City Hall — in our demo, the admin — records milestones: contract signed, work started, with photographic evidence pinned to IPFS. Here is the contract-signed milestone." _(Tx shown, IPFS evidence resolves.)_ "And work-started." _(Second tx.)_ "The citizen who voted for this proposal can now verify, on-chain, without filing a Freedom-of-Information request, that the budget is actually being executed. This is the accountability loop the existing institution does not close."

## Part 4 — Wrap and ask (14:00–15:00)

All four on camera again.

**Davi:** "What you saw is on Polygon Amoy. The contracts are source-verified on Polygonscan. The frontend is public. The seven flows in our demo runbook are reproducible by any reviewer with an internet connection."

**Lucas:** "What remains for production is institutional, not technical: a legal opinion on binding digital voting under the São José Organic Law, the ANPD position on hash-anchored eligibility, and the operational readiness of the City Hall as our anchor customer."

**Arthur:** "We are asking for an institutional pilot agreement with São José/SC and a seed envelope of BRL 400 to 600 thousand for the first external audit, the gov.br integration certification, and the pilot cycle. The first paid contract closes 12 months after disbursement; payback is one cycle."

**Pedro:** "Trust, but verify — and now you actually can. Thank you."

End card on screen for 5 seconds: GitHub URL, live frontend URL, three contract addresses, four emails.

## Editing notes

- Use one second of black between segments, not music.
- Caption every transaction hash, contract address, and IPFS CID on screen as a lower-third — easier to read than the small text inside the Polygonscan UI.
- The team member's name and role appears as a lower-third the first time they speak.
- Do **not** speed up the demo footage. The point of the demo is that the verification is real-time and reproducible.

## Pre-record dry-run checklist

The team runs through this once before the real recording session:

- [ ] All four wallets funded with Amoy MATIC.
- [ ] Deployer wallet ≥ 0.5 MATIC.
- [ ] Pinata or local IPFS pinning healthy.
- [ ] Frontend at the public URL loads in incognito.
- [ ] Polygonscan-Amoy responsive on the contract addresses.
- [ ] Backend health endpoint returns the right contract addresses.
- [ ] Demo cycle params written down so they can be retyped quickly if a take fails.
- [ ] Three demo proposals' Markdown drafts ready in the clipboard manager.
- [ ] One milestone evidence file ready for upload (a PDF of a fake "Contrato assinado").

## Post-record actions

- [ ] Edit the three segments together.
- [ ] Upload as `Unlisted` to YouTube (not Private — Private requires manual invite per viewer).
- [ ] Caption review: auto-generated captions are acceptable; correct any major error in the demo segment.
- [ ] Add YouTube description: short paper one-liner, live frontend URL, GitHub URL, three contract addresses.
- [ ] Add the YouTube link to [04-deliverables-checklist.md](04-deliverables-checklist.md) and to the submission email.
