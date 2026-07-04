# Pitch Deck Outline

The course material (see [sources/](../../sources/)) gives two valid sizes: a 10-slide deck or a 5-slide collapse. We default to **10 slides** because the video reuses several of them as title cards; if the team needs to shrink at the last moment, the collapse mapping is at the bottom and requires no new content.

The slide content in [06-slide-content.md](06-slide-content.md) is a real, renderable [Marp](https://marp.app/) presentation, not just reference text — see "Rendering the Marp decks" in [README.md](README.md) for how to preview or export it.

## Design constraints (apply to every slide)

- Each slide is readable at 1080p YouTube playback (3-meter test).
- One headline per slide. No two-line headlines.
- At most 3 bullets per slide. If you need more, split into another slide.
- Minimal brand: black text on white, one accent color. Logo is the project name; no stock photography.
- Numbers are bold. BRL figures stay in BRL; gas figures stay in gas units. Do not silently convert gas to reais — the course grades on honesty, not showmanship.
- **Every number on every slide must be traceable** to either this repository (tests, coverage, gas from the demo report) or to the PD1 canvases / PD2 white papers (market sizing, revenue model — the team's own prior research, cited as such). Nothing invented for the deck.

## 10-slide deck

### Slide 1 — Cover

- **VotaSJ**
- Subtitle: _Digital participatory budgeting for São José/SC — verifiable by anyone, trusted by no one alone_
- Four author names, course code (INE5458), semester (2026/1)
- GitHub repository URL, small type, bottom of slide
- No accelerator logos, no fake awards

### Slide 2 — Elevator pitch

One sentence, max ~20 words, centered:

> _"A blockchain-anchored participatory budget for São José/SC where every citizen votes from their phone, and every vote can be independently recomputed by anyone — not just trusted."_

Three qualifiers below it:

- Two Solidity contracts, both under 100% test coverage.
- One command reproduces the entire cycle end-to-end: `npm run demo`.
- Built for Polygon PoS; runs identically local, testnet, or mainnet.

### Slide 3 — Market problem and current state

Sourced from [docs/pd1/blockchain-canvas.md](../pd1/blockchain-canvas.md) and the PD2 short paper:

- **Turnout below 2%** of ~180,000 eligible voters in São José/SC.
- **BRL 300–500k per cycle** in physical-process logistics (assemblies, poll workers, ~3-week manual tally).
- **The City Hall counts its own vote** — every contested result ends in an unfalsifiable accusation.

One honest visual: a horizontal bar, 2% vs 98% non-participation.

### Slide 4 — Market opportunity

From the PD2 short paper's sizing table:

- **Anchor:** São José/SC, ~180k voters, ~BRL 220k/yr.
- **Regional:** Greater Florianópolis, 4 cities, ~1.1M voters, BRL 0.8–1.2M/yr.
- **State:** Santa Catarina, ~5.5M voters, BRL 4–6M/yr.
- **National TAM:** ~340 Brazilian municipalities >50k inhabitants, ~85M voters, BRL 60M+/yr.

### Slide 5 — Solution and demo cue

The slide that pivots into the live demo (the video cuts to screen recording right after this slide).

- **Five on-chain steps, one command:** register → open → propose → vote → close/tally, run end-to-end by `npm run demo`.
- **Every action is verifiable**, not announced: transaction hash, gas cost, and decoded event for every step; five illegal actions are attempted and asserted to fail.
- A small numbered diagram of the five steps.
- Footer: _"Live demo follows — `npm run demo`, this repository, right now."_

### Slide 6 — Team

Four names, no role breakdown — it doesn't change what the demo proves:

- **Davi Ludvig Longen Machado**
- **Lucas Furlanetto Pascoali**
- **Arthur Clasen de Melo**
- **Pedro Henrique Tesman Mansani da Silva**

UFSC — INE5458, 2026/1.

### Slide 7 — Engineering traction (honest version)

This slide replaces a generic "traction" slide — there is no market traction yet, and claiming any would contradict what the demo shows. What is real and checkable:

- **43 automated tests, 100%** statement / branch / function / line coverage (`npm run coverage`) — including one test at 500 independently generated voters.
- **A one-command, self-checking demo** (`npm run demo`) — deploys, runs a full cycle, and actively asserts that five illegal actions all correctly revert.
- **CI enforces all of it on every push, on both Ubuntu and Windows**: lint, compile, test (Node 20 and 22), a 100%-coverage gate, structural metrics, and the demo itself, with every report published as a build artifact.
- **Measured, not estimated:** ≈ 372k gas for one citizen's full flow (register + submit + vote); both contracts under 20% of Ethereum's 24,576-byte deployment-size limit — see [evidence/sample-demo-report.md](evidence/sample-demo-report.md) and `npm run metrics`, regenerate either anytime.

### Slide 8 — Revenue model and unit economics

From the PD2 short paper (unchanged — this is a business assumption, not a technical claim):

- **Annual subscription:** BRL 180–250k/municipality.
- **Per-cycle setup:** BRL 40k.
- **Unit economics:** existing process **BRL 300–500k/cycle** → VotaSJ **BRL 90–160k/cycle, all-in** → net savings **BRL 170–300k/cycle**.
- **Citizens never pay.**

### Slide 9 — Roadmap

What is genuinely next, in order, each item tied to a concrete artifact:

- **Now (PD3, delivered):** `VoterRegistry` + `ParticipatoryBudget`, 100% test coverage, reproducible demo, CI-enforced.
- **Next:** gov.br identity relay, IPFS proposal pinning, `ExecutionTracker` for milestone accountability.
- **Then:** public Polygon Amoy deployment, source-verified on Polygonscan; citizen-facing PWA.
- **Later:** 3-of-5 multisig administration, 14-day timelock, zk-based vote privacy (Semaphore).

### Slide 10 — The ask and closing

- **Ask:** an institutional pilot conversation with São José/SC and a seed envelope (per the PD2 short paper: BRL 400–600k) to fund the external audit, gov.br certification, and the field pilot — the roadmap items on slide 9, not what slide 7 already proves.
- **Contact:** GitHub repository URL.
- **Closing line:** _"Don't trust the count. Recompute it — the command is `npm run demo`."_

## Appendix slides (hidden, unhide only in Q&A)

Per the course material's own guidance ("keep hidden appendix slides for Q&A; never delete, only hide"), build these but do not present them unless asked:

- **Structural metrics** — LOC, per-function complexity, bytecode size vs the EIP-170 limit (`npm run metrics`, [03-demo-runbook.md](03-demo-runbook.md) evidence section).
- **LTV/CAC and payback derivation** — see [10-business-metrics.md](10-business-metrics.md). Includes a direct check of the white paper's "payback is one cycle" claim against its own stated ranges — reveal this one specifically if anyone probes the revenue numbers.

## 5-slide collapse (only if the team must shrink)

| 5-slide | Content |
| ------- | ------- |
| 1 | Cover + elevator pitch (slides 1+2) |
| 2 | Problem + market opportunity (slides 3+4) |
| 3 | Solution + demo cue + engineering traction (slides 5+7) |
| 4 | Team + roadmap (slides 6+9) |
| 5 | Revenue + ask + contact (slides 8+10) |

## What this deck deliberately does not include

- A "competition" slide — the status-quo physical process is the only competitor, mentioned in slide 3 and left there.
- A multi-year financial hockey-stick chart — slide 8's unit economics carries the financial story honestly; a growth chart would be fabricated at this stage.
- Any claim of an external audit, a live testnet deployment, institutional partnerships, or a multisig in production — none of that exists yet. See slide 9 for what is roadmap, and [09-qa-prep.md](09-qa-prep.md) if asked about the white paper's more ambitious claims.
- Stock photography. Every visual is a number, a real terminal screenshot, or a simple diagram.

## What to export

- `pitch-deck.pdf` — `npx @marp-team/marp-cli@latest docs/pd3/06-slide-content.md --pdf -o docs/pd3/pitch-deck.pdf`, committed at `docs/pd3/pitch-deck.pdf` (the `.html` preview build is git-ignored and regenerable; the PDF is the actual submission artifact and should be committed).
- `pitch-deck-thumbnail.png` — a PNG of slide 1: `npx @marp-team/marp-cli@latest docs/pd3/06-slide-content.md --images png -o docs/pd3/pitch-deck-thumbnail.png`, used as the YouTube thumbnail.
- If the team prefers editing in Google Slides / Keynote / PowerPoint instead of Marp, copy the text out of [06-slide-content.md](06-slide-content.md) — the headings and bullets paste in directly.
