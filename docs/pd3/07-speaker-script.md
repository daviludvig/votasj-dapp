# Speaker Script — 4 Parts, One Per Team Member

The course spec: a 10–15 minute video, full team pitching, ending in a live MVP demo, uploaded unlisted to YouTube. This script splits the video into **4 big parts, each led start-to-finish by one person**, following the slide deck in [06-slide-content.md](06-slide-content.md) in order — the live demo sits between slide 5 and slide 6, exactly where "Live demo follows" appears on screen. Nobody splits a slide with anyone else; whoever owns a part reads all of it. Read it twice before recording; adjust the wording to how you actually talk — a script read verbatim sounds read.

## Time budget

| Part | Speaker | Slides | Content | Target duration |
| ---- | ------- | ------ | ------- | ---------------- |
| 1 | **Davi** | 1–2 | Cover, elevator pitch | 0:00–1:00 (1 min) |
| 2 | **Lucas** | 3–4 | Market problem, market opportunity | 1:00–2:30 (1.5 min) |
| 3 | **Arthur** | 5 + live demo + 6 | Solution cue, the full MVP demo, team | 2:30–10:30 (8 min) |
| 4 | **Pedro** | 7–10 | Engineering traction, revenue, roadmap, ask/closing | 10:30–13:00 (2.5 min) |

Total ≈ 13:00, inside the 10–15 min window with room to spare. Parts 1, 2, and 4 are talking-head slides — don't stretch them with dead air to fill time. Part 3 is naturally the longest: reading transaction hashes and revert messages on screen takes real time, and the "hold for 3 seconds" rule in [08-live-demo-script.md](08-live-demo-script.md) means it shouldn't be rushed. If a take runs long, trim Part 4 first — the demo in Part 3 is what a reviewer can independently verify, so it does not get shortened.

---

## Part 1 — Davi (0:00–1:00)

**Screen:** Slide 1 (Cover), then Slide 2 (Elevator pitch).

Davi is on camera alone (or the whole team is visible if recording together, but Davi is the only one speaking in this part).

**Slide 1 — Cover:**

> "Hi, I'm Davi. This is VotaSJ — digital participatory budgeting for São José, Santa Catarina, built for INE5458 at UFSC. Over the next few minutes my teammates and I will walk through the problem, the solution, and then run our actual MVP live, on camera, from a fresh clone of our public repository."

**Slide 2 — Elevator pitch:**

> "In one sentence: a blockchain-anchored participatory budget where every citizen votes from their phone, and every vote can be independently recomputed by anyone — not just trusted. Two Solidity contracts, both at 100% test coverage. One command reproduces the whole cycle: `npm run demo`. And it's built for Polygon PoS — the same code runs local, on a testnet, or on mainnet without changes."

---

## Part 2 — Lucas (1:00–2:30)

**Screen:** Slide 3 (Market problem), then Slide 4 (Market opportunity).

**Slide 3 — Market problem:**

> "Here's the problem. Turnout in São José's participatory budget is under 2% of 180,000 eligible voters — fewer than 3,600 people decide how tens of millions of reais get spent. The physical process costs 300 to 500 thousand reais per cycle: assemblies, poll workers, a three-week manual tally. And the City Hall counts its own vote — every contested result ends in a fraud accusation nobody can prove or disprove."

**Slide 4 — Market opportunity:**

> "São José alone is worth about 220 thousand reais a year to us. Widen the lens to Greater Florianópolis — four cities, about 1.1 million voters — and it's 0.8 to 1.2 million reais a year. All of Santa Catarina state: 4 to 6 million. Every Brazilian city over 50,000 inhabitants that's legally required to run a participatory cycle: over 60 million reais a year, addressable with the same product."

---

## Part 3 — Arthur (2:30–10:30)

**Screen:** Slide 5 (Solution and demo cue), then a hard cut to terminal screen capture for the live demo, then back to Slide 6 (Team).

Arthur drives the keyboard and narrates alone for this entire part — no handoff mid-demo. This follows [08-live-demo-script.md](08-live-demo-script.md) exactly for the terminal portion.

**2:30–3:00 — Slide 5, Solution and demo cue:**

> "Five steps, one command: register, open the cycle, propose, vote, close and tally. Every step prints its own transaction hash, gas cost, and decoded event as it happens. And we don't just show the happy path — five illegal actions get attempted on purpose, live, and rejected on camera. Here's the live demo."

**Visual rule:** every transaction hash and revert message must stay on screen for at least 3 seconds. The audience should be able to pause and read it — that is the entire point of showing a terminal instead of a slide.

**3:00–3:30 — Setup:**

> "This is a clean clone of our public GitHub repository, nothing pre-built. I run `npm install`, then one command runs the entire cycle: `npm run demo`."

**3:30–5:00 — Deploy, register, open:**

> Narrate as the script deploys both contracts, registers three citizens, and opens a cycle — point at the credential hash, the transaction hashes, and the gas cost for each action as they scroll past. "And here — the script tries to register the same citizen twice. Watch: it reverts, on purpose, with the exact reason our tests expect. This isn't a happy-path demo; it's checking its own guard rails live."

**5:00–6:00 — Proposals:**

> "Three citizens submit three real participatory-budget-style proposals — a plaza renovation, LED lighting, a health-post renovation. Each is pinned to a CID; the contract stores only the hash and the submitter address. Now we try submitting from an address with no registry entry — rejected."

**6:00–7:00 — Voting:**

> "Each citizen votes once. Watch the vote count and the event log. Now the script tries to vote twice from the same address — rejected, `Budget: already voted` — and tries voting from an unregistered address — rejected again."

**7:00–8:00 — Close and tally:**

> "It tries to close the cycle before the deadline — rejected. Then, after the window elapses, anyone can close it — here, the contract computes the winner by itself and emits the result. No off-chain tally, no spreadsheet."

**8:00–9:30 — The evidence artifact:**

> "Every one of these steps just got written to `reports/demo-cycle-report.md` — transaction hash, gas cost, decoded event, for every action, including which illegal actions were correctly rejected. This exact command runs in our CI pipeline on every push, on both Ubuntu and Windows, and the report is a downloadable build artifact. You don't have to take our word for any of this."

**9:30–10:30 — Slide 6, Team:**

> Cut back to Slide 6. "That's what the code does. This is who built it: Davi, Lucas, Arthur, and Pedro, from UFSC's INE5458."

---

## Part 4 — Pedro (10:30–13:00)

**Screen:** Slide 7 (Engineering traction), Slide 8 (Revenue model), Slide 9 (Roadmap), Slide 10 (Ask and closing).

**Slide 7 — Engineering traction:**

> "What you just saw isn't the whole proof. 43 automated tests, 100% statement, branch, function, and line coverage — including one test with 500 independently generated voters, where the tally still checks out and gas per vote stays flat. `npm run demo` is a self-checking run: it tries five illegal actions and asserts every one reverts. And CI runs lint, test, coverage, metrics, and the demo itself on every single push — every report is a downloadable build artifact, not a claim you have to trust."

**Slide 8 — Revenue model:**

> "The business side: an annual subscription of 180 to 250 thousand reais per municipality, plus a 40-thousand-real per-cycle setup fee. The existing process costs 300 to 500 thousand reais per cycle; VotaSJ, all-in, costs 90 to 160 thousand. Citizens never pay — this is a B2G product."

**Slide 9 — Roadmap:**

> "What's delivered right now, for this course submission: `VoterRegistry` and `ParticipatoryBudget`, 100% coverage, a reproducible demo, CI-enforced. What's next: the gov.br identity relay, IPFS proposal pinning, and an execution tracker for milestone accountability. After that: a public Polygon Amoy deployment, verified on Polygonscan, and a citizen-facing app. Later: the 3-of-5 multisig, a 14-day timelock, and zk-based vote privacy."

**Slide 10 — Ask and closing:**

> "Our ask is an institutional pilot conversation with São José/SC, and a seed envelope of 400 to 600 thousand reais for the external audit, gov.br certification, and the field pilot. Don't trust the count — recompute it. The command is `npm run demo`. Thank you."

End card, 5 seconds: GitHub URL (`github.com/daviludvig/votasj-dapp`).

---

## Editing notes

- One second of black between the 4 parts, no background music — the terminal audio (or narration over it) is the credibility signal.
- Caption every transaction hash and contract address as a lower-third during Part 3; the built-in terminal font is too small at 1080p.
- Each speaker's name appears as a lower-third the first time they talk.
- Do not speed up the demo footage in Part 3 — the point is that the verification happens in real time.
- Because each part has exactly one owner, the 4 parts can be recorded as 4 independent takes/files and edited together — a bad take in Part 2 does not require re-recording Part 1, 3, or 4.

## Pre-record checklist

- [ ] `npm install` runs clean from a fresh clone on the recording machine.
- [ ] `npm run demo` has been rehearsed at least twice by Arthur; he knows which lines print when.
- [ ] Terminal font large enough to read at 1080p (18pt+ recommended).
- [ ] Screen recording software tested for 5 seconds before the real take.
- [ ] Headset mic for every speaker, not laptop mics.

## Post-record actions

- [ ] Edit the 4 parts together in order.
- [ ] Upload as **Unlisted** to YouTube (not Private).
- [ ] Review auto-generated captions for major errors in Part 3 (technical terms and revert strings are the likely misses).
- [ ] Add a YouTube description: one-line pitch, GitHub URL, and a note that `npm run demo` reproduces exactly what's shown.
- [ ] Link the YouTube URL from [04-deliverables-checklist.md](04-deliverables-checklist.md) and the submission email.
