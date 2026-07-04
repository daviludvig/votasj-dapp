# PD3 — Pitch, Video, and MVP Demonstration

This folder contains everything for **Partial Delivery 3** for INE5458 — Blockchain and Cryptocurrency Technologies (UFSC 2026/1): the development plan and gap analysis, the demo runbook, and the pitch deck itself (outline, slide copy, speaker script, live-demo script, Q&A prep, business metrics, and a committed evidence sample). One folder, no split between planning docs and deck material — if you just need to assemble the deck or rehearse the video, jump straight to document 5 below.

## What PD3 is (per the course slides)

- A **pitch deck** of 5 or 10 slides covering canvas, white paper, and MVP highlights.
- A **10–15 minute video** of the full team pitching, ending in a live MVP demo.
- The video is uploaded as an **unlisted YouTube link** and delivered together with the source code.

## What was actually delivered

PD3 is submitted at the **Minimum / local-network scope**: the on-chain layer (`VoterRegistry` + `ParticipatoryBudget`), a 43-test Hardhat suite at 100% coverage, and a reproducible end-to-end demo script (`npm run demo`). There is no frontend, backend, gov.br integration, or public testnet deployment in this delivery — see [02-gap-analysis.md](02-gap-analysis.md) for the full claims-vs-reality inventory and [03-demo-runbook.md](03-demo-runbook.md) for exactly what is demonstrated and how a reviewer verifies it independently.

## Two non-negotiable properties of the demo

1. **Demonstrability.** Every vital step of the cycle (register → open → propose → vote → close/tally) is shown live, end-to-end, with real transactions.
2. **Verifiability.** Each step has a verification path a third party can run without asking the team for anything — `npm run demo`, `npm test`, and `npm run coverage` are all anyone needs. Nothing in the demo relies on "trust us" footage.

## Reading order

| # | Document | When to read |
| - | -------- | ------------ |
| 1 | [01-development-plan.md](01-development-plan.md) | Phased roadmap from the PD3 baseline to a full production demo (frontend, backend, Amoy). Phase A is done; B–E are future work. |
| 2 | [02-gap-analysis.md](02-gap-analysis.md) | What the white papers claim vs what is actually in the repo, prioritized, with the chosen PD3 scope stated at the top. |
| 3 | [03-demo-runbook.md](03-demo-runbook.md) | The five demo flows actually shown, each with its verification path. The live demo follows this script. |
| 4 | [04-deliverables-checklist.md](04-deliverables-checklist.md) | Pre-flight checklist on submission day, split into required-now vs roadmap items. |
| 5 | [05-pitch-deck-outline.md](05-pitch-deck-outline.md) | The 10-slide outline (with a 5-slide collapse). Start here to assemble the deck. |
| 6 | [06-slide-content.md](06-slide-content.md) | The pitch deck itself, as a renderable **Marp** presentation — open it in VS Code with the Marp extension, or export it (see "Rendering the Marp decks" below). |
| 7 | [07-speaker-script.md](07-speaker-script.md) | Minute-by-minute spoken track for the 10–15 min video. |
| 8 | [08-live-demo-script.md](08-live-demo-script.md) | Exact terminal commands and narration for the on-camera `npm run demo` segment. |
| 9 | [09-qa-prep.md](09-qa-prep.md) | Anticipated questions — including the white-paper-vs-reality gap — with prepared, honest answers. |
| 10 | [10-business-metrics.md](10-business-metrics.md) | LTV/CAC, payback derivations, and a check of the white paper's "payback is one cycle" claim against its own numbers. |
| 11 | [11-results-presentation.md](11-results-presentation.md) | A separate **Marp** deck — not the investor pitch, a technical results/evidence deck: tests, coverage, gas, structural metrics, the 500-voter scale test, and CI. |
| — | [evidence/](evidence/) | A committed sample of the demo's evidence report, so the deck's numbers are checkable without running anything. |

## Rendering the Marp decks

Documents **06** and **11** are [Marp](https://marp.app/) markdown — plain text with a `marp: true` front matter block, previewable as real slides.

- **Live preview while editing:** install the "Marp for VS Code" extension, open either file, and toggle the Marp preview pane.
- **Export to HTML** (no extra setup):

  ```bash
  npx @marp-team/marp-cli@latest docs/pd3/06-slide-content.md -o docs/pd3/pitch-deck.html
  npx @marp-team/marp-cli@latest docs/pd3/11-results-presentation.md -o docs/pd3/results-presentation.html
  ```

- **Export to PDF or PPTX:** add `--pdf` or `--pptx` to either command above. The first run downloads a local Chromium (via `@marp-team/marp-cli`'s bundled Puppeteer) to render the pages — this can take a few minutes and needs an internet connection once; HTML export needs neither.

## Ground rule for the pitch-deck documents (5–10)

**Say only what the repository can prove today.** The white papers describe the target production design: a UUPS proxy, a 3-of-5 multisig, an `ExecutionTracker` contract, gov.br integration, IPFS pinning, a public Amoy deployment, institutional partnerships. **None of that is built.** What exists and is proven is: two Solidity contracts, a 43-test Hardhat suite at 100% coverage, a one-command reproducible end-to-end demo (`npm run demo`), and a CI pipeline that re-runs all of it on every push. Documents 5–10 are written to that reality; see [09-qa-prep.md](09-qa-prep.md) for how to answer the obvious follow-up question about the gap.

## How to use this folder

1. Read **01** first to align on phases and gates; use **02** to see the chosen scope and what's roadmap vs delivered.
2. Build against **03** as the acceptance test for the live demo.
3. Assemble the deck from **05** and **06**, rehearse with **07**, record the demo following **08**, and skim **09** right before recording so nobody freezes on a predictable question.
4. Use **04** as the final pre-flight checklist.
5. After recording, regenerate `reports/demo-cycle-report.md` one final time and refresh [evidence/sample-demo-report.md](evidence/sample-demo-report.md) so the committed sample matches what's in the video.

## Folder layout

```text
docs/pd3/
  README.md                      (this file)
  01-development-plan.md         phased plan + milestones + acceptance gates
  02-gap-analysis.md             whitepaper claims vs repo state, prioritized
  03-demo-runbook.md             5 demo flows with verification matrix (current scope)
  04-deliverables-checklist.md   final-week checklist
  05-pitch-deck-outline.md       10-slide outline (+ 5-slide collapse)
  06-slide-content.md            the pitch deck — renderable Marp presentation
  07-speaker-script.md           minute-by-minute video script
  08-live-demo-script.md         terminal run-of-show for the live demo segment
  09-qa-prep.md                  anticipated questions with prepared answers
  10-business-metrics.md         LTV/CAC, payback derivations
  11-results-presentation.md     technical results deck — renderable Marp presentation
  evidence/
    sample-demo-report.md        committed sample of npm run demo's output
    sample-demo-report.json      machine-readable twin
```
