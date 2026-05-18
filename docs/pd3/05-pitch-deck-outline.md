# PD3 Pitch Deck Outline

Course slides give two valid sizes: a 10-slide deck or a 5-slide collapse. We default to **10 slides** because the demo segment of the video reuses several of them as title cards; if at the very end the team needs to shrink, sections 7–10 collapse into one. The 5-slide mapping is given at the bottom.

## Design constraints (apply to every slide)

- Each slide is readable at 1080p YouTube playback (3-meter test).
- One headline per slide. No two-line headlines.
- At most 3 bullets per slide. If you need more, you need another slide.
- Brand: minimal. Black text on white, one accent color (suggested: a Florianópolis-green or a São José-blue). Logo is the project name; no stock photography.
- Numbers are bold and large. Reais figures are in BRL; gas figures in gas-units; only the cost-comparison slide converts both to absolute reais.

## 10-slide deck

### Slide 1 — Cover

- **VotaSJ — Trust, Counted Live**
- Subtitle: _Digital participatory budgeting for São José/SC_
- Authors (4 names, smaller), course code, semester.
- Project URL (GitHub) at the bottom in small type.
- _No logos of accelerators or fake awards._

### Slide 2 — Elevator pitch

A single sentence (max 18 words) at the center of the slide, plus three short qualifiers below.

> _"A blockchain-anchored participatory budget for São José/SC where every citizen can vote from their phone, and every vote can be independently verified."_

Three qualifiers:

- Built on Polygon PoS.
- gov.br for identity, IPFS for proposal content, public ledger for the count.
- One-third the cost of the current cycle.

### Slide 3 — Market problem and current state

- **Turnout < 2 %** of 180 000 eligible voters in São José/SC.
- **BRL 300–500k per cycle** in physical-process logistics.
- **A tally run, counted, and announced by the City Hall itself** — opposition fraud claims are routine and impossible to rebut.

One small visual: a horizontal bar showing 2 % participation against 98 % non-participation. Honest, not embellished.

### Slide 4 — Market opportunity

- **TAM:** ~340 Brazilian municipalities with >50k inhabitants legally required to run participatory cycles.
- **SAM:** ~80 with budgeted digital modernization.
- **SOM (36 months):** single-digit municipalities anchored on São José/SC.
- Three-year addressable revenue: BRL 800k–1.2M from Greater Florianópolis alone.

### Slide 5 — Solution and demo cue

This is the slide that pivots the deck into the live demo segment (in the video, the cut to screen-recording happens here).

- **Five on-chain steps:** register → propose → vote → close → execute.
- **Public audit portal** that anyone can open.
- A small numbered diagram of the five steps with arrows.
- Footer: "Live demo follows — Polygon Amoy, contracts at `<addresses>`".

### Slide 6 — Team

Four names, one bullet per person. From the long white paper:

- **Davi Ludvig Longen Machado** — smart-contract architecture, UUPS proxy, multisig.
- **Lucas Furlanetto Pascoali** — smart-contract security, gas profiling, CI gates.
- **Arthur Clasen de Melo** — off-chain backbone, gov.br relay, IPFS, subgraph.
- **Pedro Henrique Tesman Mansani da Silva** — PWA, wallet abstraction, accessibility flows.

Affiliations: UFSC INE, INE5458/2026.1. Photos optional.

### Slide 7 — Traction

- **Working MVP on Polygon Amoy** — three contracts deployed, source-verified on Polygonscan.
- **40-test Hardhat suite**, ≥ 90 % coverage, CI lint+coverage gates green.
- **~430k gas for a full citizen flow** (register + submit + vote + read).
- **Institutional partners in conversation:** UFSC Blockchain Lab, São José Planning Secretariat, TCE-SC.

### Slide 8 — Revenue model and unit economics

- **Annual subscription:** BRL 180–250k/municipality.
- **Per-cycle setup:** BRL 40k.
- **Unit economics:** existing process **BRL 300–500k/cycle** → VotaSJ **BRL 90–160k/cycle, all-in** → **net savings BRL 170–300k/cycle**.
- **Citizens never pay.**

### Slide 9 — Roadmap

Five horizontal phases on one slide:

- **Delivered (PD3):** three contracts on Amoy, frontend PWA, public audit portal.
- **2026-Q3:** field pilot in one São José administrative region (5–10k participants).
- **2026-Q4:** full city-wide cycle (~50k voters).
- **2027:** Greater Florianópolis expansion (Palhoça, Biguaçu, Florianópolis).
- **2027–2028:** zk-Semaphore vote anonymity by default.

### Slide 10 — The ask and closing

- **Ask:** institutional pilot agreement with São José/SC and a BRL 400–600k seed envelope for the first external audit, the gov.br integration certification, and the field-pilot cycle.
- **Payback:** one cycle.
- **Contact:** the four emails + the GitHub URL + the live frontend URL + the three contract addresses.
- **Closing line:** _"Trust, but verify — and now you actually can."_

## 5-slide collapse (only if the team has to shrink)

Per the course slides: combine `2+3`, combine `4+7`, combine `10+12+14` of the "best investor pitch deck" outline. Mapped to ours:

| 5-slide | Content |
| ------- | ------- |
| 1 | Cover + Elevator pitch (slides 1+2 of the 10-slide) |
| 2 | Problem + Market (slides 3+4) |
| 3 | Solution + Traction + Demo cue (slides 5+7) |
| 4 | Team + Roadmap (slides 6+9) |
| 5 | Revenue + Ask + Contact (slides 8+10) |

## What this deck deliberately does NOT include

- A "competition" slide. The status-quo physical process is the only competitor; the deck mentions it in slide 3 and moves on.
- A "financial projections" multi-year table. Slide 8's unit economics carries the financial story; a hockey-stick chart would be dishonest at this stage.
- A "we have an audit from <firm>" claim. The contracts are tested under the Hardhat suite; the external audit is on the roadmap, not in hand.
- Stock photography. Every visual is either a number, a real screenshot, or a simple diagram.

## What to export

- `pitch-deck.pptx` (or `.key`) — editable master kept in the team Google Drive.
- `pitch-deck.pdf` — committed at `docs/pd3/pitch-deck.pdf`.
- `pitch-deck-thumbnail.png` — single-slide PNG of slide 1, used as the YouTube thumbnail.
