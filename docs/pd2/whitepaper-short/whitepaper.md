# VotaSJ — Trust, Counted Live

## Short White Paper (v1.0)

**Project:** VotaSJ — Digital Participatory Budgeting Platform
**Target deployment:** São José, Santa Catarina, Brazil
**Course:** INE5458 — Blockchain and Cryptocurrency Technologies — UFSC 2026/1 — PD2
**Authors:** Davi Ludvig Longen Machado · Lucas Furlanetto Pascoali · Arthur Clasen de Melo · Pedro Henrique Tesman Mansani da Silva

**Abstract.** VotaSJ is a blockchain-anchored participatory-budgeting platform for São José/SC. Citizens authenticate with gov.br, vote from their phone, and audit the tally and the budget execution in real time — without having to trust the City Hall to count its own vote. The platform replaces a BRL 300–500k physical process with a BRL 90–160k digital one, governed by a 3-of-5 multisig (City Hall, UFSC, TCE-SC) and a 14-day timelock on rule changes. This short paper makes the case to the institutional buyer (Page 1) and to the citizen (Page 2).

---

## Page 1 — For the Investor and the Municipality

**Problem.** Brazilian municipalities run participatory budgets that almost no one trusts. In São José/SC: turnout below **2 %** of 180,000 voters (<3,600 people decide tens of millions of reais); operational cost of **BRL 300–500k/cycle** dominated by physical assemblies and ~3-week manual tallying; and a tally run, counted, and announced by the City Hall itself, so every contested result ends in an unfalsifiable accusation of manipulation.

**Solution.** A platform on Polygon PoS where citizens authenticate with `gov.br`, vote from their phone, and audit results live. The blockchain holds only what the City Hall must not be allowed to rewrite — the eligibility commitment, the votes, the tally, and the budget-execution milestones. Personal data, proposal text, photos, and UX stay off-chain. Administration is a **3-of-5 multisig** (3 City Hall, 1 UFSC, 1 TCE-SC) and any contract change is gated by a **14-day timelock**, so the rules cannot move inside an active vote and the chain keeps running even if the City Hall stops cooperating.

**Why now.** `gov.br` is mature (~150 M citizens, free for municipal integration); Polygon per-vote gas is under USD 0.005; OpenZeppelin + Hardhat make audited deployments affordable; TCE-SC and MP press for auditable processes — we arrive with the audit built in.

**Market.**

| Segment | Scope | 3y addressable |
| --- | --- | --- |
| São José/SC (anchor) | ~180k voters | BRL 220k/yr |
| Greater Florianópolis | 4 cities, ~1.1M voters | BRL 0.8–1.2M/yr |
| Santa Catarina state | ~5.5M voters | BRL 4–6M/yr |
| BR cities >50k inhab. | ~340 cities, ~85M voters | BRL 60M+/yr |

TAM: >340 cities legally required to run participatory cycles. SAM: ~80 with budgeted digital modernization. SOM (36 mo): single-digit municipalities anchored on São José.

**B2G SaaS model.** Annual subscription BRL 180–250k/city; per-cycle setup BRL 40k; implementation consulting BRL 60–120k; white-label for professional councils. Citizens never pay. _Unit economics:_ physical process **BRL 300–500k/cycle**; VotaSJ **BRL 90–160k/cycle, all-in**; net savings **BRL 170–300k/cycle**, before counting the political value of an unimpeachable result.

**Traction.** Production-ready platform — `VoterRegistry`, `ParticipatoryBudget`, and `ExecutionTracker` contracts deployed under a UUPS proxy with a 3-of-5 multisig and 14-day timelock, exercised by a 40-test Hardhat suite, CI-enforced lint/coverage gates, ~430k gas measured for a full citizen flow. Institutional partners: UFSC Blockchain Lab (academic anchor), São José Planning Secretariat (anchor customer), TCE-SC (auditor multisig signer). Rollout: field pilot 2026-Q3, full São José cycle 2026-Q4, multi-city expansion 2027.

**Ask.** An institutional pilot agreement with São José/SC and a seed envelope of **BRL 400–600k** for the first external smart-contract audit, gov.br integration certification, and the field-pilot cycle. First paid contract closes 12 months after disbursement; payback is one cycle.

---

## Page 2 — For the Citizen

**Your vote, your eyes.** Today, when you participate in São José's participatory budget — if you participate — you go to a night-time assembly, raise your hand, and trust that the City Hall counts correctly and executes what won. VotaSJ changes one thing: **you can stop trusting and start checking**.

**What changes for you.**

- **Vote from your phone, on your own schedule.** No more assemblies you can't attend because of work, kids, or distance.
- **See your vote land.** The moment you cast it, the public tally updates. Refresh the page and watch it.
- **Anyone audits the count.** Journalists, neighborhood associations, TCE-SC, MP — same data, same chain, same time.
- **Follow execution.** You're notified when your winning proposal moves to contract, work start, milestones, and finish, with evidence you can check.
- **Your data stays private.** CPF, name, address: none of it goes on the blockchain. Only a one-way hash that proves you're eligible, not who you are.

**Three steps.** (1) Sign in with `gov.br` — the federal ID you already use. (2) Pick a proposal: browse what neighbors submitted, read the budget, vote once. (3) Watch the result and the execution: real-time tally and per-milestone updates. No need to know what a "blockchain" is. No crypto, no fee, no extra app.

**Forquilhinhas, next cycle.** Maria, a cashier whose shift ends at 22:30, opens VotaSJ on the bus home and votes for the renovated daycare. Months later she is notified — contract signed, work started, daycare reopens — each step with verifiable photographic evidence. 90 seconds of participation; the institution actually delivered.

> **Trust, but verify — and now you actually can.**

---

**Companion document and references.** A 16-page technical white paper covers architecture, threat model, gas measurements, team, and roadmap. Sources: _Estatuto da Cidade_ ([planalto.gov.br/ccivil_03/leis/leis_2001/l10257.htm](https://www.planalto.gov.br/ccivil_03/leis/leis_2001/l10257.htm)), _LGPD_ ([planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)), _gov.br_ ([acesso.gov.br/roteiro-tecnico](https://acesso.gov.br/roteiro-tecnico/)), _Polygon PoS_ ([docs.polygon.technology](https://docs.polygon.technology/)).
