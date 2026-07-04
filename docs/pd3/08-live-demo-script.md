# Live Demo Script — Terminal Run-of-Show

The technical companion to Part 3 of [07-speaker-script.md](07-speaker-script.md). This is what Pedro actually types and what appears on screen, mapped to what Davi says. The underlying flows and their verification are specified in [03-demo-runbook.md](03-demo-runbook.md); this document is the recording-day checklist and cue sheet.

## Before recording

1. `git clone` the repository into a clean directory — recording from a fresh clone, on camera, is itself evidence that nothing is staged or faked.
2. `npm install` (do this **before** hitting record, it is not interesting to watch and eats the time budget).
3. Increase the terminal font to at least 18pt. Use a light or high-contrast color scheme — small colored text on black is hard to read on compressed YouTube video.
4. Do one silent rehearsal run of `npm run demo` immediately before recording, so the team knows the exact line count and timing. Every run produces different transaction hashes (fresh in-memory chain each time) but the same structure — that is expected and worth saying on camera if anyone asks.
5. Have [03-demo-runbook.md](03-demo-runbook.md) open on a second monitor for the presenter, not on the recorded screen.

## The run

```bash
npm run demo
```

That is the entire command. What scrolls by, and what to point at:

| On screen (in order) | Say this | Duration |
| --------------------- | -------- | -------- |
| `Deploy VoterRegistry` / `Deploy ParticipatoryBudget` | "Two contracts, deployed fresh, right now." | ~5s |
| `Register voter "ana"` / `"bruno"` / `"carla"` — three blocks with tx hash, block, gas, decoded `VoterRegistered` event | "Each registration is a real transaction. The credential hash is a `keccak256` of a label — in production this comes from a signed gov.br assertion, but the chain never sees the underlying document either way." | ~20s |
| `[GUARDRAIL] Guardrail: double registration` — reverts with `"VoterRegistry: already registered"` | "We just tried to register the same citizen twice, on purpose. It's rejected, with the exact reason our test suite expects." | ~10s |
| `Open cycle #1` — `CycleOpened` event with `opensAt`/`closesAt`/`budgetWei` | "The cycle is now open, with a real deadline." | ~10s |
| Three `Submit proposal —` blocks (praça, iluminação, UBS), each with tx hash and `ProposalSubmitted` event | "Three citizens submit three proposals. The chain stores only the content hash and the submitter — content itself lives off-chain, addressed by that hash." | ~20s |
| `[GUARDRAIL] Guardrail: unregistered submitter` | "An address with no registry entry cannot submit a proposal — rejected." | ~8s |
| Three `Vote —` blocks with `VoteCast` events | "Each citizen votes once. Watch the vote counter." | ~15s |
| `[GUARDRAIL] Guardrail: double voting` / `Guardrail: unregistered voter` | "Same citizen, second vote — rejected. Different, unregistered address — also rejected." | ~15s |
| `[GUARDRAIL] Guardrail: early close` | "Trying to close before the deadline — rejected. There is no way to cut a cycle short." | ~8s |
| `Close cycle #1` — `CycleClosed` event with winner and vote count | "After the deadline, anyone can close it. The contract computes the winner itself and emits the result — no spreadsheet, no announcement to trust." | ~15s |
| `Final tally` block reading straight from the contract | "This block isn't the script's memory — it's a fresh read from the contract, right after close, matching the event exactly." | ~10s |
| `OK — N on-chain actions succeeded, M illegal actions were correctly rejected` | "That's the whole cycle. Every guard rail we claim in the white paper, checked live." | ~5s |

Total run time: well under two minutes of actual script execution. The remaining time in the 6-minute demo segment (per the speaker script) is narration pace, not waiting on the terminal — do not rush the talking to match the script's speed; the terminal is fast, the explanation should not be.

## After the run, before cutting away

Open `reports/demo-cycle-report.md` in an editor or `cat` it on screen for a few seconds:

```bash
cat reports/demo-cycle-report.md
```

Point out: "This file just got written, with every transaction hash and gas number from the run you just watched. It's also what our CI pipeline generates automatically on every push — a reviewer doesn't need to run anything to see this exact table; they can pull it from our GitHub Actions history."

## Fallback plan if something breaks live

| Symptom | What happened | What to do on camera |
| ------- | -------------- | --------------------- |
| `npm run demo` throws a guard-rail assertion error | A real regression — an illegal action didn't revert as expected, or reverted with the wrong reason | Do not paper over it. Say so: "this caught something — that is exactly what this script is for." Stop the take, fix the underlying issue, re-run `npm test` to confirm, then re-record this segment only. |
| Terminal window resizes or font is unreadable mid-recording | Recording setup issue, not a code issue | Cut and restart just this segment — the three-segment structure (see speaker script) means only this file's part needs a retake. |
| A Node version warning appears at startup | Hardhat's officially supported version is Node 20 LTS; newer versions still work | Ignore it or mention in one sentence that it's a compatibility notice, not a failure — the run still completes. |
| Someone asks live why hashes differ from a previous take | Expected — each run spins a fresh in-memory chain | Say so plainly: "the structure and the guarantees are identical every run; the specific hashes are new because this is a live chain, not a recording." |

## Optional: two-terminal variant (closer to a persistent network)

If the team wants to show the flow against a network that survives across terminals (closer to how a real deployment behaves, without needing a public testnet):

```bash
# terminal 1
npm run node

# terminal 2
npm run demo:local
```

This runs the identical script against `localhost` instead of the fast in-process network. Behavior, events, and guard rails are exactly the same; only the setup looks more "production-like" on screen. Not required — the in-process `npm run demo` is faster to record and equally valid evidence.
