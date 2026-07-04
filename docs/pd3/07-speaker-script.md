# Speaker Script — 10 to 15 Minutes

The course spec: a 10–15 minute video, full team pitching, ending in a live MVP demo, uploaded unlisted to YouTube. This is the minute-by-minute spoken track, synced to the slides in [06-slide-content.md](06-slide-content.md) and the terminal run in [08-live-demo-script.md](08-live-demo-script.md). Read it twice before recording; adjust the wording to how each person actually talks — a script read verbatim sounds read.

## Time budget

| Part | Duration | Owner | Slides / screen |
| ---- | -------- | ----- | ---------------- |
| 0. Intro and team | 0:00–1:00 | All four | Slide 1 |
| 1. Canvas walkthrough | 1:00–4:00 | Davi or Arthur | Slides 3, 4 + PD1 canvas images |
| 2. White paper highlights and the honesty checkpoint | 4:00–7:30 | Lucas + Arthur | PD2 white paper PDF + slide 9 |
| 3. Live MVP demo | 7:30–13:30 | Pedro driving, Davi narrating | Slide 5 → terminal |
| 4. Wrap and ask | 13:30–15:00 | All four | Slides 8, 10 |

Hard cap at 15:00. If anything runs long, trim Part 1 — the demo is the part a reviewer can independently verify, so it does not get shortened.

## Part 0 — Intro and team (0:00–1:00)

All four on camera.

**Davi:** "We are the VotaSJ team — Davi, Lucas, Arthur, and Pedro — students of INE5458 at UFSC. VotaSJ is a blockchain-anchored participatory budgeting platform for São José, Santa Catarina. In the next few minutes we'll walk through the canvas and white paper, and then run our actual MVP live, on camera, from a fresh clone of our public repository."

## Part 1 — Canvas walkthrough (1:00–4:00)

Screen shows the PD1 Business Canvas, then the Blockchain Canvas.

**Beat 1 (1:00–2:00) — Business Canvas:** "Our buyer is São José City Hall; the roughly 180,000 eligible citizens are the side whose participation the buyer is purchasing. Our value proposition is the one thing the current process cannot offer structurally: a count that nobody has to trust, because anyone can recompute it. Revenue is a B2G SaaS subscription — BRL 180 to 250 thousand a year per municipality — plus a per-cycle setup fee. Citizens never pay."

**Beat 2 (2:00–3:00) — Blockchain Canvas:** "The trust problem here is horizontal and political: citizens don't trust the City Hall to count its own vote, the opposition doesn't trust the incumbent, and there's no existing neutral party with both the legitimacy and the technical capacity to run the process in real time. A public blockchain fits because no single party has to be the trusted third party."

**Beat 3 (3:00–4:00) — Why blockchain, concretely:** "We compared a plain database, a database with cryptographic audit logs, and a PKI-only design — in every one of those, integrity still depends on whoever operates the database. A public ledger with an external validator set is the only option where the count survives an adversarial operator. That comparison is in section 3 of our long white paper."

## Part 2 — White paper highlights and the honesty checkpoint (4:00–7:30)

Screen shows the long white paper, scrolling slowly.

**Beat 1 (4:00–5:00) — Contract design (Lucas):** "Two contracts are live in this repository today: `VoterRegistry`, which stores eligibility as a credential hash — never a CPF — and `ParticipatoryBudget`, which runs the cycle as a three-state machine: Pending, Open, Closed. One vote per address per cycle, enforced on-chain, tally computed deterministically when the cycle closes."

**Beat 2 (5:00–6:00) — Identity flow, as designed (Arthur):** "Citizens are meant to authenticate through gov.br, Brazil's federal identity provider. The chain is designed to never see a CPF — only a salted hash. That off-chain relay is not built yet; in the demo you're about to see, we simulate it with a plain string label, which is exactly the interface the real relay will fill in."

**Beat 3 (6:00–7:00) — The honesty checkpoint (Lucas):** "Our white paper describes the production target: a 3-of-5 multisig, a 14-day timelock, an `ExecutionTracker` for budget accountability, a public Polygon Amoy deployment. None of that is built yet — and we want to say that plainly rather than let a demo imply otherwise. What you're about to see is the part that is built: two contracts, fully tested, that anyone can run and verify without trusting us."

**Beat 4 (7:00–7:30) — Cost (Arthur):** "The current physical process runs 300 to 500 thousand reais per cycle. Our target, all-in including a future external audit, is 90 to 160 thousand — a net savings of 170 to 300 thousand reais per cycle, before counting the political value of a result nobody can credibly dispute."

## Part 3 — Live MVP demo (7:30–13:30)

**Screen capture only**, terminal at a readable font size. Pedro drives the keyboard; Davi narrates. This follows [08-live-demo-script.md](08-live-demo-script.md) exactly.

> **Visual rule:** every transaction hash and revert message must stay on screen for at least 3 seconds. The audience should be able to pause and read it. That is the entire point of showing a terminal instead of a slide.

**7:30–8:00 — Setup:** Davi: "This is a clean clone of our public GitHub repository, nothing pre-built. We run `npm install`, then one command runs the entire cycle: `npm run demo`."

**8:00–9:30 — Deploy, register, open:** Davi narrates as the script deploys both contracts, registers three citizens, and opens a cycle — pointing out the credential hash, the transaction hashes, and the gas cost for each action as they scroll past. "And here — the script tries to register the same citizen twice. Watch: it reverts, on purpose, with the exact reason our tests expect. That's not a happy-path demo; it's checking its own guard rails live."

**9:30–10:30 — Proposals:** "Three citizens submit three real participatory-budget-style proposals — a plaza renovation, LED lighting, a health-post renovation. Each is pinned to a CID; the contract stores only the hash and the submitter address. Then we try submitting from an address with no registry entry — rejected."

**10:30–11:30 — Voting:** "Each citizen votes once. Watch the vote count and the event log. Now the script tries to vote twice from the same address — rejected, `Budget: already voted` — and tries voting from an unregistered address — rejected again."

**11:30–12:30 — Close and tally:** "It tries to close the cycle before the deadline — rejected. Then, after the window elapses, anyone can close it — here, the contract computes the winner by itself and emits the result. No off-chain tally, no spreadsheet."

**12:30–13:30 — The evidence artifact:** "Every one of these steps just got written to `reports/demo-cycle-report.md` — transaction hash, gas cost, decoded event, for every action, including which illegal actions were correctly rejected. This same command runs in our CI pipeline on every single push to the repository, and the report is a downloadable build artifact. You do not have to take our word for any of this."

## Part 4 — Wrap and ask (13:30–15:00)

All four on camera again.

**Davi:** "What you saw is real: two contracts, fully tested, running end-to-end on a public, reproducible command. Nothing about the demo required trusting us."

**Lucas:** "What's next is the roadmap on this slide — gov.br, IPFS pinning, the execution tracker, and then a public Amoy testnet deployment with the multisig our white paper describes."

**Arthur:** "We're asking for an institutional pilot conversation with São José/SC and a seed envelope of 400 to 600 thousand reais for the external audit, the gov.br integration, and the field pilot. Payback is one cycle."

**Pedro:** "Don't trust the count — recompute it. The command is `npm run demo`. Thank you."

End card, 5 seconds: GitHub URL, `npm run demo`.

## Editing notes

- One second of black between segments, no background music — the terminal audio (or narration over it) is the credibility signal.
- Caption every transaction hash and contract address as a lower-third; the built-in terminal font is too small at 1080p.
- Each speaker's name and role appears as a lower-third the first time they talk.
- Do not speed up the demo footage — the point is that the verification happens in real time.

## Pre-record checklist

- [ ] `npm install` runs clean from a fresh clone on the recording machine.
- [ ] `npm run demo` has been rehearsed at least twice; the team knows which lines print when.
- [ ] Terminal font large enough to read at 1080p (18pt+ recommended).
- [ ] Screen recording software tested for 5 seconds before the real take.
- [ ] Headset mic for every speaker, not laptop mics.

## Post-record actions

- [ ] Edit the segments together.
- [ ] Upload as **Unlisted** to YouTube (not Private).
- [ ] Review auto-generated captions for major errors in the demo segment (technical terms and revert strings are the likely misses).
- [ ] Add a YouTube description: one-line pitch, GitHub URL, and a note that `npm run demo` reproduces exactly what's shown.
- [ ] Link the YouTube URL from [04-deliverables-checklist.md](04-deliverables-checklist.md) and the submission email.
