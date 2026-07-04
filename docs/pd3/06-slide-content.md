---
marp: true
theme: default
paginate: true
size: 16:9
---

<!-- Renderable Marp deck. Preview live in VS Code with the "Marp for VS Code"
extension, or export with `npx @marp-team/marp-cli docs/pd3/06-slide-content.md
-o docs/pd3/pitch-deck.html` (add `--pdf` for a PDF, requires a local Chromium
the first time it runs). Outline and per-slide rationale are in
05-pitch-deck-outline.md; this file is the actual slide content. -->

# VotaSJ

### Digital participatory budgeting for São José/SC — verifiable by anyone, trusted by no one alone

Davi Ludvig Longen Machado · Lucas Furlanetto Pascoali
Arthur Clasen de Melo · Pedro Henrique Tesman Mansani da Silva

INE5458 — Blockchain and Cryptocurrency Technologies · UFSC 2026/1
`github.com/daviludvig/votasj-dapp`

<!-- Speaker cue: state your names and the course out loud even though they're on screen — see 07-speaker-script.md. No accelerator logos, no fake awards. -->

---

## "A blockchain-anchored participatory budget where every citizen votes from their phone, and every vote can be independently recomputed by anyone — not just trusted."

- ✅ Two Solidity contracts, 100% test coverage
- ✅ One command reproduces the whole cycle: `npm run demo`
- ✅ Built for Polygon PoS — same code, local, testnet, or mainnet

---

## < 2% turnout

180,000 eligible voters in São José/SC.
Fewer than 3,600 decide how tens of millions of reais are spent.

- BRL 300–500k per cycle in physical-process cost (assemblies, poll workers, ~3-week manual tally)
- The City Hall counts its own vote — every contested result ends in an unfalsifiable fraud accusation

<!-- Visual: horizontal bar, 2% filled / 98% empty, no other decoration. -->

---

## BRL 60M+/yr addressable

| Tier | Voters | Revenue/yr |
| ---- | ------ | ---------- |
| São José/SC (anchor) | ~180k | ~BRL 220k |
| Greater Florianópolis (4 cities) | ~1.1M | BRL 0.8–1.2M |
| Santa Catarina state | ~5.5M | BRL 4–6M |
| Brazil, cities >50k inhabitants | ~85M | BRL 60M+ |

<!-- Source: PD2 short white paper, market-sizing table. -->

---

## Five steps, one command

`register → open cycle → propose → vote → close & tally`

```bash
npm run demo
```

Every step prints its transaction hash, gas cost, and decoded event. Five illegal actions are attempted on purpose — and rejected, on camera.

**Live demo follows.**

<!-- This is the slide where the video cuts to the terminal recording — see 08-live-demo-script.md. -->

---

## Team

**Davi Ludvig Longen Machado**
**Lucas Furlanetto Pascoali**
**Arthur Clasen de Melo**
**Pedro Henrique Tesman Mansani da Silva**

UFSC — INE5458, 2026/1

---

## 100% coverage, 43 tests, 0 hand-waving

- 43 automated tests, 100% statement/branch/function/line coverage — plus one test at **500 independent voters**, tally still checks out and gas per vote stays flat
- `npm run demo`: a self-checking, reproducible run that tries 5 illegal actions and asserts every one reverts
- CI runs lint + test + coverage + metrics + demo on every push — every report is a downloadable build artifact

<!-- Source: this repository, reports/demo-cycle-report.md and reports/contract-metrics.md, regenerate with `npm run demo` / `npm run metrics`. -->

---

## BRL 170–300k saved per cycle

- Annual subscription: BRL 180–250k / municipality
- Per-cycle setup fee: BRL 40k
- Existing process: BRL 300–500k/cycle → VotaSJ, all-in: BRL 90–160k/cycle
- **Citizens never pay**

---

## What's proven vs what's next

**Now (PD3, delivered)** — `VoterRegistry` + `ParticipatoryBudget`, 100% coverage, reproducible demo, CI-enforced

**Next** — gov.br identity relay · IPFS proposal pinning · `ExecutionTracker` for milestone accountability

**Then** — Public Polygon Amoy deployment, verified on Polygonscan · Citizen-facing PWA

**Later** — 3-of-5 multisig · 14-day timelock · zk vote privacy

---

## Don't trust the count — recompute it

**Ask:** an institutional pilot conversation with São José/SC and a BRL 400–600k seed envelope for the external audit, gov.br certification, and the field pilot.

```bash
npm run demo
```

`github.com/daviludvig/votasj-dapp`
