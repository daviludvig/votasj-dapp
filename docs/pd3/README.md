# PD3 — Pitch, Video, and MVP Demonstration

This folder contains everything the team needs to plan, build, and deliver **Partial Delivery 3** for INE5458 — Blockchain and Cryptocurrency Technologies (UFSC 2026/1).

## What PD3 is (per the course slides)

- A **pitch deck** of 5 or 10 slides covering canvas, white paper, and MVP highlights.
- A **10–15 minute video** of the full team pitching, ending in a live MVP demo.
- The video is uploaded as an **unlisted YouTube link** and delivered together with the source code.

## Two non-negotiable properties of the demo

The submission must let any reviewer reproduce what they see.

1. **Demonstrability.** Every vital step of the cycle (registration → cycle open → proposal → vote → close → audit → milestone) is shown live, end-to-end, on a publicly accessible network.
2. **Verifiability and auditability.** Each step on screen has a verification path — a Polygon Amoy block explorer link, an event log entry, a subgraph query, or an IPFS CID — so a viewer can independently confirm the action happened. Nothing in the demo relies on "trust us" footage.

The development plan in this folder is organized around producing those two properties.

## Reading order

| # | Document | When to read |
| - | -------- | ------------ |
| 1 | [01-development-plan.md](01-development-plan.md) | Read first. Phased plan from today to submission, with hard gates between phases. |
| 2 | [02-gap-analysis.md](02-gap-analysis.md) | What the white papers claim vs what is actually in the repo, prioritized for PD3. |
| 3 | [03-demo-runbook.md](03-demo-runbook.md) | The seven demo flows, each with its verification artifact. The live demo follows this script. |
| 4 | [04-deliverables-checklist.md](04-deliverables-checklist.md) | Pre-flight checklist on submission day. |
| 5 | [05-pitch-deck-outline.md](05-pitch-deck-outline.md) | The 10-slide deck (with a 5-slide collapse fallback). |
| 6 | [06-video-script.md](06-video-script.md) | Minute-by-minute video script and recording setup. |

## How to use this folder

- Read **01** first to align the team on phases and gates.
- Use **02** to triage scope: every item is labeled `MUST` / `SHOULD` / `STRETCH`.
- Build against **03** as the acceptance test — if every flow in the runbook passes its verification check, the demo is ready.
- Use **04**, **05**, **06** in the final week to assemble the submission.

## Folder layout

```text
docs/pd3/
  README.md                      (this file)
  01-development-plan.md         phased plan + milestones + acceptance gates
  02-gap-analysis.md             whitepaper claims vs repo state, prioritized
  03-demo-runbook.md             7 demo flows with verification matrix
  04-deliverables-checklist.md   final-week checklist
  05-pitch-deck-outline.md       10-slide outline (+ 5-slide collapse)
  06-video-script.md             15-min video script
```
