# PD3 Deliverables Checklist

Use this checklist in the final week. Nothing here is creative work — it is the pre-flight pass before submission.

> **Scope note:** this checklist was originally written for the Target/Stretch scope (public Amoy deployment, frontend, backend). PD3 is being submitted at the **Minimum/local-network scope** (see [02-gap-analysis.md](02-gap-analysis.md)). Sections marked **(roadmap — not required for this submission)** describe work that was not done and is not claimed; keep them for when the team resumes Phase B/C. Sections marked **(required)** are the actual PD3 pre-flight pass.

## Repository state (required)

- [ ] `npm install` runs clean on a fresh clone (no cached node_modules, no global state).
- [ ] `npm test` passes — 43 tests.
- [ ] `npm run coverage` — 100% statements/branches/functions/lines (`npm run coverage:check` enforces this as a hard gate, same as CI).
- [ ] `npm run demo` completes with `OK` and all five guard-rail assertions pass.
- [ ] `npm run lint` is clean (solhint + eslint + markdownlint).
- [ ] CI workflow (`.github/workflows/ci.yml`) green on `main` — `lint` and `test` on both Ubuntu and Windows, `test` on Node 20 and 22, `coverage` gated at 100%, `demo` job green on both OSes.
- [ ] `README.md` at the root points to [docs/pd3/README.md](README.md) in the deliverables table, with PD3 status set to `submitted`.
- [ ] No private keys, API tokens, or wallet seeds anywhere in the git history (verify with `git log -p | grep -iE "private_?key|secret|mnemonic"`).

## On-chain artifacts (roadmap — not required for this submission)

- [ ] `VoterRegistry` deployed and **source-verified** on Polygonscan-Amoy.
- [ ] `ParticipatoryBudget` deployed and source-verified.
- [ ] `ExecutionTracker` implemented, deployed and source-verified.
- [ ] `deployments/amoy.json` committed with all addresses, chain id, deployer, and `deployedAt` timestamp.
- [ ] Deployer wallet funded ≥ 0.5 MATIC for reviewer re-runs.

## Frontend (roadmap — not required for this submission)

- [ ] PWA built with `npm run build` (in `frontend/`) and deployed to a public URL (Vercel free tier, GitHub Pages, or Netlify).
- [ ] All five routes (`/login`, `/cycle`, `/propose`, `/vote`, `/audit`) function against a live deployment.

## Backend (roadmap — not required for this submission)

- [ ] Backend deployed to a public URL (Railway, Fly.io, or a free Render instance).
- [ ] `/health` endpoint returns the contract addresses + chain id.
- [ ] Pinata (or Kubo) credentials in the backend env, not in the repo.

## Documentation (required)

- [ ] [docs/pd1/](../pd1/) untouched — canvases delivered for PD1.
- [ ] [docs/pd2/whitepaper-long/whitepaper.pdf](../pd2/whitepaper-long/whitepaper.pdf) (18 pages) and [docs/pd2/whitepaper-short/whitepaper.pdf](../pd2/whitepaper-short/whitepaper.pdf) (2 pages) committed and current.
- [ ] [docs/pd3/](.) folder complete with its numbered docs and this checklist, scoped honestly to the Minimum/local-network delivery — development plan, gap analysis, demo runbook, checklist, and the pitch deck outline/content/scripts/Q&A/metrics/evidence, all in this one folder.
- [ ] `docs/pd3/pitch-deck.pdf` exported from the final deck.

## Pitch deck (required)

- [x] Final deck built as Marp ([06-slide-content.md](06-slide-content.md), following [05-pitch-deck-outline.md](05-pitch-deck-outline.md)).
- [x] Exported to PDF at `docs/pd3/pitch-deck.pdf` (`npm run deck:build` for HTML preview, or the direct `marp-cli --pdf` command in [05-pitch-deck-outline.md](05-pitch-deck-outline.md) for the PDF).
- [x] Slide count is exactly 10 — not 7, not 11.
- [ ] Every slide is readable from 3 meters in a 1080p YouTube playback — verify once during a recording rehearsal.
- [x] One slide includes the GitHub repository URL (`github.com/daviludvig/votasj-dapp`) and states the demo runs locally with `npm run demo` — no live URL is claimed because none exists yet.
- [x] Team slide is names only, no role breakdown; no contact emails on any slide — neither changes what the demo proves.

## Video (required)

- [ ] Recorded in three independent segments (canvas + white paper, MVP demo, wrap) so any one can be re-shot — see [07-speaker-script.md](07-speaker-script.md).
- [ ] Total runtime between 10:00 and 15:00.
- [ ] Every team member appears and speaks for at least 1 minute.
- [ ] The demo segment runs `npm run demo` live and follows [08-live-demo-script.md](08-live-demo-script.md) and [03-demo-runbook.md](03-demo-runbook.md).
- [ ] Each transaction hash is visible on screen for at least 3 seconds (the reviewer can pause and copy it).
- [ ] Audio is intelligible at 100% YouTube playback volume.
- [ ] Uploaded to YouTube as **unlisted**, not Private (Private requires manual invite; unlisted just needs the link).
- [ ] YouTube description includes: short paper one-liner, the GitHub repo URL, and a note that `npm run demo` reproduces the on-screen run.
- [ ] Captions enabled (auto-generated is acceptable; review for major errors).

## Submission package (required)

The final email to the instructor / Moodle upload contains:

- [ ] **YouTube unlisted link** to the team video.
- [ ] **GitHub repository URL** (public, `main` branch).
- [ ] A one-paragraph cover note pointing the reviewer at [03-demo-runbook.md](03-demo-runbook.md) and inviting them to run `npm install && npm run demo` themselves.

## Day-of-submission smoke test

Right before submitting:

- [ ] Open the YouTube link in an incognito tab → video plays.
- [ ] `git clone` the repository fresh into a scratch directory, `npm install`, `npm test`, `npm run demo` → all green, matching what the video shows.
- [ ] Open the GitHub Actions tab → the latest `demo` job succeeded and its evidence report artifact is downloadable.
- [ ] Copy any transaction hash from the demo video, `grep` it in the freshly regenerated `reports/demo-cycle-report.md` structure (hashes will differ per run — confirm the _shape and count_ of transactions matches, and narrate that on camera if asked).

If all four pass, submit.
