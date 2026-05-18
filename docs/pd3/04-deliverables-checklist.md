# PD3 Deliverables Checklist

Use this checklist in the final week. Nothing here is creative work — it is the pre-flight pass before submission.

## Repository state

- [ ] `npm install` runs clean on a fresh clone (no cached node_modules, no global state).
- [ ] `npm test` passes (Hardhat suite + any added ExecutionTracker tests).
- [ ] `npm run coverage` ≥ 90 %.
- [ ] `npm run lint` is clean (solhint + eslint + markdownlint).
- [ ] CI workflow (`.github/workflows/ci.yml`) green on `main`.
- [ ] `README.md` at the root points to [docs/pd3/README.md](README.md) in the deliverables table, with PD3 status set to `submitted`.
- [ ] `.env.example` documents `AMOY_RPC_URL`, `DEPLOYER_PRIVATE_KEY`, `POLYGONSCAN_API_KEY`, `PINATA_JWT` (or equivalent).
- [ ] `.gitignore` keeps `.env`, `deployments/local.json`, `frontend/node_modules`, `backend/node_modules` out of the repo.
- [ ] No private keys, API tokens, or wallet seeds anywhere in the git history (verify with `git log -p | grep -iE "private_?key|secret|mnemonic"`).

## On-chain artifacts (Amoy)

- [ ] `VoterRegistry` deployed and **source-verified** on Polygonscan-Amoy.
- [ ] `ParticipatoryBudget` deployed and source-verified.
- [ ] `ExecutionTracker` deployed and source-verified (if Target/Stretch scope).
- [ ] `deployments/amoy.json` committed with all three addresses, chain id, deployer, and `deployedAt` timestamp.
- [ ] A complete demo cycle has run end-to-end on these addresses, with at least 3 proposals, 5+ votes, a close, and 2 milestones.
- [ ] Deployer wallet still funded ≥ 0.5 MATIC for reviewer re-runs.

## Frontend

- [ ] PWA built with `npm run build` (in `frontend/`) and the build artifact deployed to a public URL (Vercel free tier, GitHub Pages, or Netlify).
- [ ] Public URL works in a fresh browser without local state.
- [ ] All five routes (`/login`, `/cycle`, `/propose`, `/vote`, `/audit`) function against the Amoy deployment.
- [ ] `/audit` displays the demo cycle's full event feed.
- [ ] The "DEMO" labels are visible wherever the demo uses a mock (gov.br button, custodial wallet).

## Backend

- [ ] Backend deployed to a public URL (Railway, Fly.io, or a free Render instance).
- [ ] CORS configured so the frontend URL can call it.
- [ ] `/health` endpoint returns the contract addresses + chain id.
- [ ] Pinata (or Kubo) credentials in the backend env, not in the repo.

## Documentation

- [ ] [docs/pd1/](../pd1/) untouched — canvases delivered for PD1.
- [ ] [docs/pd2/whitepaper-long/whitepaper.pdf](../pd2/whitepaper-long/whitepaper.pdf) (18 pages) and [docs/pd2/whitepaper-short/whitepaper.pdf](../pd2/whitepaper-short/whitepaper.pdf) (2 pages) committed and current.
- [ ] [docs/pd3/](.) folder complete with the six numbered docs and this checklist.
- [ ] [docs/pd3/verification/](verification/) folder populated with screenshots and transaction hashes from the live demo.
- [ ] `docs/pd3/pitch-deck.pdf` exported from the final deck.

## Pitch deck

- [ ] Final deck in Google Slides / Keynote / PowerPoint following [05-pitch-deck-outline.md](05-pitch-deck-outline.md).
- [ ] Exported to PDF at `docs/pd3/pitch-deck.pdf`.
- [ ] Slide count is exactly 10 (or exactly 5 if collapsed) — not 7, not 11.
- [ ] Every slide is readable from 3 meters in a 1080p YouTube playback.
- [ ] One slide includes the live frontend URL, the three contract addresses, and the GitHub repository URL.

## Video

- [ ] Recorded in three independent segments (canvas, white paper, demo) so any one can be re-shot.
- [ ] Total runtime between 10:00 and 15:00.
- [ ] Every team member appears and speaks for at least 1 minute.
- [ ] The demo segment shows all seven flows from [03-demo-runbook.md](03-demo-runbook.md).
- [ ] Each transaction tx-hash is visible on screen for at least 3 seconds (the reviewer can pause and copy it).
- [ ] Polygonscan and IPFS gateway URLs are shown live, not via screenshots.
- [ ] Audio is intelligible at 100 % YouTube playback volume.
- [ ] Uploaded to YouTube as **unlisted**, not Private (Private requires manual invite; unlisted just needs the link).
- [ ] YouTube description includes: short paper one-liner, the live demo URL, the GitHub repo URL, and the three contract addresses.
- [ ] Captions enabled (auto-generated is acceptable; review for major errors).

## Submission package

The final email to the instructor / Moodle upload contains:

- [ ] **YouTube unlisted link** to the team video.
- [ ] **GitHub repository URL** (public, `main` branch).
- [ ] **Live frontend URL** for the reviewer to run the demo themselves.
- [ ] **Three contract addresses on Polygonscan-Amoy**, each as a direct link.
- [ ] A one-paragraph cover note pointing the reviewer at [docs/pd3/03-demo-runbook.md](03-demo-runbook.md) and confirming the demo cycle is reproducible from the live deployment.

## Day-of-submission smoke test

Right before submitting:

- [ ] Open the YouTube link in an incognito tab → video plays.
- [ ] Open the frontend URL in an incognito tab → `/cycle` and `/audit` load against the Amoy deployment.
- [ ] Open Polygonscan on the `ParticipatoryBudget` address → recent events are visible.
- [ ] Copy any transaction hash from the demo video, paste into Polygonscan → matches the on-screen content.
- [ ] Run `npm test` one more time on the `main` branch.

If all five pass, submit.
