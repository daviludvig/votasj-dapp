# Business Model Canvas — VotaSJ

**Project:** VotaSJ — Digital Participatory Budgeting Platform for São José/SC
**Authors:**:

- Davi Ludvig Longen Machado (23100473)
- Lucas Furlanetto Pascoali (23204339)
- Arthur Clasen de Melo (24100596)
- Pedro Henrique Tesman Mansani da Silva (24103617)

**Course:** INE5458 — Blockchain and Cryptocurrency Technologies — UFSC 2026/1
**Delivery:** PD1

Structure and vocabulary follow the Osterwalder Business Model Canvas as presented in the course slides: 9 boxes, explicit classification per box, and cross-block correlation at the end.

---

## 1. Customer Segments

_Which customers and users are we serving? Which jobs do they really want to get done?_

**Segment type:** multi-sided platform — we simultaneously serve a paying institutional buyer (City Hall) and a non-paying mass of end users (citizens) whose participation is what the buyer is actually purchasing. The segments are mutually dependent: neither side is useful without the other.

| Segment | Who | Job-to-be-done |
| ------- | --- | -------------- |
| Eligible citizens of São José/SC | ~180,000 people aged 16+ residing in the municipality | "Have a real say in how public money is spent in my neighborhood, from my phone, and see it was counted." |
| São José City Hall (Planning Secretariat + Ombudsman) | Institutional buyer | "Run a participatory-budget cycle that is cheap, legitimate, and defensible against opposition fraud claims." |
| Neighborhood associations and regional councils (Forquilhinhas, Kobrasol, Barreiros, Campinas) | Grassroots organizers | "Aggregate and channel my neighborhood's demands into a process that actually decides something." |
| TCE-SC and Public Prosecutor's Office | Institutional auditors | "Audit the process in real time, with cryptographic certainty, not reconstruct it after the fact." |
| Expansion: other city halls in Greater Florianópolis (Palhoça, Biguaçu, Florianópolis) | Future institutional buyers | Same job as São José, but we reach them only after a credible local reference. |

## 2. Value Propositions

_What are we offering them? What job is it getting done? Do they care?_

**Classification:** mostly qualitative (trust, legitimacy, civic experience); partially quantitative (cost reduction, time-to-tally). Primary VP elements, using the course vocabulary: **risk reduction**, **cost reduction**, **accessibility**, **convenience/usability**, and **performance**.

- **Fraud resistance (risk reduction)** — every vote is on a public blockchain, immutable and independently verifiable. The City Hall can no longer be accused of manipulating its own tally because it no longer controls the tally.
- **Radical transparency (risk reduction)** — any citizen, councilor, or journalist can audit results in real time without going through the City Hall's Freedom-of-Information channel.
- **Lower process cost (cost reduction)** — replaces assemblies, physical urns, poll workers, and manual tallying (BRL 300k–500k/cycle estimate) with a digital pipeline at a small fraction of that.
- **Remote participation (accessibility)** — citizens vote from a phone at any time during the voting window; no need to attend a night assembly.
- **Inclusion at the kiosk (accessibility)** — assisted kiosks in CRAS/UPAs/libraries for citizens without a smartphone.
- **Instant tally (performance)** — the result is cryptographically determined within minutes of the cycle closing, versus ~3 weeks of manual reconciliation today.
- **Proof of civic participation (getting the job done)** — each vote mints a non-transferable SBT on the citizen's wallet as a permanent, portable civic-engagement record.
- **LGPD-compliant privacy (risk reduction)** — no personal data is written on-chain; eligibility is proven without revealing the voter's identity.

## 3. Channels

_How does each customer segment want to be reached? Through which interaction points?_

**Mix:** direct channels (own) for the end-user experience and audit surface; partner channels for awareness and reach.

| Channel | Segment served | Type |
| ------- | -------------- | ---- |
| VotaSJ mobile PWA | Citizens | Own, digital — primary voting channel |
| Web portal integrated with são-jose.sc.gov.br | Citizens, auditors, press, observers | Own, digital — audit and consultation |
| Assisted physical kiosks (CRAS, UPAs, municipal libraries) | Unbanked / non-smartphone citizens | Own + partner (municipal facilities), in-person |
| gov.br OIDC integration | Citizens (authentication) | Partner (Serpro) — identity channel |
| Local press (NDTV, Notícias do Dia) | All citizens (awareness) | Partner, media |
| Neighborhood associations | Grassroots citizens | Partner, mobilization |
| The Graph subgraph + REST API | TCE-SC, Public Prosecutor's Office | Own, machine-to-machine |

Each channel is sized to the real behavior of its segment: the elderly do not get pushed to the PWA, the auditor does not get pushed to the kiosk.

## 4. Customer Relationships

_What relationships are we establishing with each segment? Personal, automated, acquisitive, retentive?_

**Relationship types** (from the course taxonomy): **self-service**, **personal assistance** (assisted kiosks), **automated services** (execution tracking), **communities** (civic commenting), and **co-creation** (proposals come from citizens themselves).

- **Citizen ↔ VotaSJ — self-service (default)**: registration, voting, result consultation through the PWA without any human intervention.
- **Citizen ↔ VotaSJ — personal assistance (assisted kiosks)**: operated by municipal staff for digital-inclusion segments; same workflow, assisted interface.
- **Citizen ↔ VotaSJ — automated execution tracking**: once they voted, the citizen is notified when milestones of the winning proposal are recorded on-chain.
- **Citizen ↔ Citizen — community**: public commenting on proposals, scoped by administrative region.
- **Citizen ↔ City Hall — co-creation**: proposals originate from the citizens themselves; the City Hall commits budget and delivery, not the idea.
- **City Hall ↔ VotaSJ — dedicated account management**: an anchor B2G customer gets a named technical account manager (long sales cycle, high-touch renewal).

## 5. Revenue Streams

_What are customers really willing to pay for? Transactional or recurring?_

**Classification (course vocabulary):** mostly recurring (**subscription fees** and **usage fees**) from the City Hall; transactional (**licensing**) for white-label; and **grants** as non-recurring seed revenue.

- **Subscription — annual SaaS license with São José City Hall** — BRL 180k–250k/year. Pays for the platform, support, security updates, and the guaranteed running of the yearly cycle. Primary revenue line.
- **Usage fee — per-cycle setup** — BRL 40k per cycle actually executed (covers configuration, campaign support, incident response during voting).
- **Usage fee — implementation consulting for additional city halls** — BRL 60k–120k per integration (transactional, expansion segment).
- **Licensing — white-label for popular consultations / professional bodies** (OAB-SC, CREA-SC, unions) — recurring license for use of the protocol outside the core municipal scope.
- **Grants (non-recurring)** — BNDES, IDB, LabCidades civic-innovation grants as year-1 seed funding; explicitly excluded from the long-run model.

Citizens **never** pay — if they did, the whole proposition collapses (votes would become monetizable).

## 6. Key Resources

_Which resources underpin our business model? Which assets are essential?_

**Resource categories** (course taxonomy): **human**, **intellectual**, **physical/infrastructural**, and — crucially for a governance product — **trust** as an intangible asset.

- **Human** — technical team: 2 Solidity developers, 2 full-stack developers, 1 UX designer, 1 security/audit specialist. Plus a B2G account executive for the long public-sector sales cycle.
- **Intellectual — audited smart contracts**: the core asset. Without a clean audit (OpenZeppelin or Hacken) there is no product.
- **Intellectual — the VotaSJ protocol itself** (cycle state machine, eligibility scheme, zk circuits from PD2).
- **Physical/infrastructural** — dedicated Polygon PoS node, IPFS pinning service for proposal metadata, and the subgraph indexer that powers public auditing.
- **Institutional** — formal partnership with the City Hall (contract, DPO appointment, LGPD Data Processing Agreement); eligible-voter roster imported from the TRE-SC / municipal registry via gov.br.
- **Intangible — brand and public trust**. A governance product is a trust product; the brand is the resource that converts "some blockchain app" into "the legitimate channel for participatory budgeting in São José".

## 7. Key Activities

_Which activities do we need to perform well? What is crucial?_

Crucial because these are the activities that materialize the VPs of fraud resistance, transparency, and accessibility:

- **Develop and maintain the smart contracts** (registry, cycle, tally, execution tracker) — crucial: a bug here kills the product.
- **Operate each cycle end-to-end**: open, campaign support, voting, close, publication, execution tracking. This is the recurring service the City Hall pays for.
- **External security audits on every major release** (mandatory before any real cycle).
- **Integrate and maintain the gov.br flow** — identity is the perimeter of the whole trust model.
- **Train City Hall staff and community agents** so the human layer around the software behaves correctly.
- **Civic communication and mobilization** with press and neighborhood associations to drive turnout — without turnout the VP collapses.
- **LGPD and Freedom-of-Information compliance** — continuous, not one-off.

## 8. Key Partnerships

_Which partners and suppliers leverage the model? Who do we need to rely on?_

**Partnership types:** buyer-supplier (infrastructure), strategic alliance (institutional validation), and academic partnership (research).

- **São José City Hall** — institutional partner and anchor customer; the MoU is the foundation of the model.
- **UFSC (INE department and Blockchain Lab)** — academic partner for protocol auditing and zk-research; also gives the project institutional credibility.
- **gov.br / Serpro** — identity provider; no real product without this integration.
- **Polygon Labs** — infrastructure and co-marketing.
- **Chainlink** — oracles (automated cycle closing, future gov.br → on-chain relayers).
- **OpenZeppelin / Hacken** — external smart-contract audits.
- **OAB-SC and Public Prosecutor's Office** — legal validation and institutional oversight.
- **Neighborhood associations** — grassroots mobilization, last-mile awareness.
- **Local media (NDTV, Notícias do Dia)** — civic communication channel.

## 9. Cost Structure

_What is the resulting cost structure? Which key elements drive our costs?_

**Class:** **value-driven** (not cost-driven) — we compete on trust and legitimacy, not on price. **Economies of scope** kick in as we add cycles or new city halls (same protocol, same audit, amortized human cost).

**Fixed costs (~BRL 85k / month):**

- Technical team payroll (6 people): BRL 65k
- Cloud infra + dedicated Polygon node + IPFS pinning: BRL 4k
- Legal / LGPD / DPO: BRL 6k
- Civic marketing and operations: BRL 10k

**Variable costs (per cycle):**

- Polygon gas fees — empirically ~430k gas per citizen full-flow × ~50k voters × gas price in MATIC. At current Amoy levels this is measured in cents/vote, well under BRL 0.50/vote.
- External smart-contract audit (per major release): BRL 40k–80k — the single biggest variable cost, and the one that directly sustains the core VP.

**Customer acquisition cost (B2G):**

- Long public-sector sales cycle (6–12 months): estimated BRL 30k per city hall closed. Non-trivial — a major reason to start with São José as anchor and expand by reference.

**Value-driven justification:** if we tried to compete as cost-driven (e.g., skip external audits, skip the zk circuit), we would lose the only reason anyone chooses us over a cheap SQL portal.

---

## Cross-Block Correlation

- **CS ↔ VP**: skeptical citizens (CS) are paid by fraud resistance + audit (VP); the City Hall (CS) is paid by cost reduction + legitimation (VP); auditors (CS) are paid by real-time cryptographic audit (VP). Every segment has at least one dedicated VP element.
- **VP ↔ Channels**: "radical transparency" (VP) only lands if the audit channel is public and independent — that forces the open web portal and the public REST/subgraph (Channels). Without that channel, the VP is a marketing claim.
- **VP ↔ Key Resources**: "fraud resistance" (VP) is credible _only_ because of audited smart contracts (KR) and a dedicated Polygon node (KR). Removing either KR invalidates the headline VP.
- **VP ↔ Key Activities**: "instant tally" (VP) is produced by the `closeCycle` activity (KA); "proof of civic participation" (VP) is produced by the SBT-minting activity (KA).
- **Revenue ↔ CS**: the whole monetization (B2G subscription + per-cycle fee) targets exactly one segment (City Hall). The mass segment (citizens) is the product being delivered, not the payer — a classic multi-sided platform.
- **Key Activities ↔ Key Partnerships**: gov.br integration (KA) only exists via the Serpro partnership (KP); external audit (KA) only exists via OpenZeppelin/Hacken (KP); civic mobilization (KA) only works via associations + local press (KP).
- **Cost ↔ VP**: the single largest variable cost (recurring external audits) is the cost that literally manufactures the "trust/immutability" VP. If we cut it, we save BRL 40k–80k and destroy the product.
- **Channels ↔ CS**: the assisted-kiosk channel exists specifically because the "elderly / unbanked" sub-segment cannot be reached by the PWA — the channel map is driven by the heterogeneity of the segment, not by the preferred channel of the company.
- **Customer Relationships ↔ VP**: the "community + co-creation" relationship type is what turns the VP from "a voting tool" into "a civic platform" — citizens propose, comment, and track. Drop this relationship and the VP shrinks to a ballot box.
- **Key Resources ↔ Cost Structure**: the team (KR) is the biggest fixed cost, and the audits (KR, intellectual) are the biggest variable cost — the cost structure directly reflects what we said was essential on the KR side.
