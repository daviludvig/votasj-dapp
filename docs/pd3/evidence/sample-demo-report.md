<!--
  This is a COMMITTED SAMPLE of the output of `npm run demo`, captured on 2026-07-04.
  It is not regenerated automatically — run `npm run demo` yourself to get a fresh one;
  the structure and guarantees will be identical, the transaction hashes will differ
  because each run deploys to a fresh in-memory chain. See docs/pd3/README.md.
-->

# VotaSJ — Demo Cycle Evidence Report

Generated: 2026-07-04T18:47:23.169Z
Network: `hardhat`
VoterRegistry: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
ParticipatoryBudget: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

Regenerate this file at any time with `npm run demo`. Every row below is a real transaction executed against the network named above in this run — nothing here is hand-written.

| # | Action | Tx hash | Block | Gas | Event / Result |
| - | ------ | ------- | ----- | --- | --------------- |
| 1 | ✅ Deploy VoterRegistry | `0xf4d2b7d3d8c9…` | — | — | — |
| 2 | ✅ Deploy ParticipatoryBudget | `0x0b1517392bf9…` | — | — | — |
| 3 | ✅ Register voter "ana" | `0x7b56303c6726…` | 3 | 114988 | VoterRegistered(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 0x13ead81fff3d96a1ee027c045e05aaa505dec076f7391ee4772e8bad4ff778f4) |
| 4 | ✅ Register voter "bruno" | `0x50ab85794d50…` | 4 | 97876 | VoterRegistered(0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, 0x78792ce9d83d223702f723f4a9cbc725378afc5187a1dab6540eb153dc7bfd3f) |
| 5 | ✅ Register voter "carla" | `0x06713ee41496…` | 5 | 97888 | VoterRegistered(0x90F79bf6EB2c4f870365E785982E1f101E93b906, 0x14b1d4d0bc7d8f041da507ab972bc5331e0e2e1fb1cf81f25b3051a7d29925ca) |
| 6 | ⛔ Guardrail: double registration | — | — | — | reverted: "VoterRegistry: already registered" (expected) |
| 7 | ✅ Open cycle #1 | `0x8c475d3a4d00…` | 7 | 122570 | CycleOpened(1, 1783190853, 1783191153, 535000000000000000000000) |
| 8 | ✅ Submit proposal — "Reforma da Praça Central do Bairro Kobrasol" | `0xec268048bd1e…` | 9 | 152094 | ProposalSubmitted(1, 1, 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, ipfs://bafybeigdemoprac1a2b3c4d5e6f7g8h9i0jklpraca) |
| 9 | ✅ Submit proposal — "Iluminação de LED na Rua das Palmeiras" | `0x67381a911186…` | 10 | 135006 | ProposalSubmitted(1, 2, 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, ipfs://bafybeigdemoiluminacao1a2b3c4d5e6f7g8h9i0jkl) |
| 10 | ✅ Submit proposal — "Reforma da UBS do Bairro Forquilhinha" | `0xe6de0d0bc51b…` | 11 | 135030 | ProposalSubmitted(1, 3, 0x90F79bf6EB2c4f870365E785982E1f101E93b906, ipfs://bafybeigdemoubs1a2b3c4d5e6f7g8h9i0jklforquilha) |
| 11 | ⛔ Guardrail: unregistered submitter | — | — | — | reverted: "Budget: submitter not registered" (expected) |
| 12 | ✅ Vote — ana votes for the UBS renovation | `0xb69082633577…` | 13 | 105085 | VoteCast(1, 3, 0x70997970C51812dc3A010C7d01b50e0d17dc79C8) |
| 13 | ✅ Vote — bruno votes for the UBS renovation | `0xecfc661cd28a…` | 14 | 70885 | VoteCast(1, 3, 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC) |
| 14 | ✅ Vote — carla votes for the praça | `0xd6df24577377…` | 15 | 87985 | VoteCast(1, 1, 0x90F79bf6EB2c4f870365E785982E1f101E93b906) |
| 15 | ⛔ Guardrail: double voting | — | — | — | reverted: "Budget: already voted" (expected) |
| 16 | ⛔ Guardrail: unregistered voter | — | — | — | reverted: "Budget: voter not registered" (expected) |
| 17 | ⛔ Guardrail: early close | — | — | — | reverted: "Budget: cycle still running" (expected) |
| 18 | ✅ Close cycle #1 | `0x87cc2ecc17b6…` | 20 | 64691 | CycleClosed(1, 3, 2) |

## Final tally

- Winning proposal id: **3**
- Total votes cast: **3**
- Total registered voters: **3**

Full machine-readable version (every decoded event argument, every gas number) is in [`sample-demo-report.json`](sample-demo-report.json) next to this file.
