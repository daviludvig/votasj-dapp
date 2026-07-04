# Business Metrics — Derivations and Appendix Slide

The revenue-model figures in slide 8 (BRL 180–250k/yr subscription, BRL 300–500k vs BRL 90–160k unit economics) come straight from the PD2 short white paper and the PD1 business canvas — see [09-qa-prep.md](09-qa-prep.md) for the source table. This document derives the _ratios_ investors actually ask for (LTV/CAC, CAC payback, seed-ask payback) from those same numbers, shows the formula for each so it can be checked and rebuilt, and flags where a headline claim in the existing white paper doesn't hold up once you do the arithmetic across its own stated ranges. Use this as the appendix slide (kept hidden, revealed only if asked) rather than putting every ratio on the main deck — slide 8 stays at three bullets per [05-pitch-deck-outline.md](05-pitch-deck-outline.md)'s own rule.

## Inputs (all from PD1/PD2, not invented here)

| Input | Value | Source |
| ----- | ----- | ------ |
| Annual subscription | BRL 180k–250k / municipality / year | PD2 short paper, PD1 canvas §5 |
| Customer acquisition cost (CAC) | BRL 30k per city hall closed | PD1 canvas §9 |
| Seed ask | BRL 400k–600k | PD2 short paper |
| Net savings per cycle (to the buyer) | BRL 170k–300k / cycle | PD2 short paper |

## LTV / CAC

The white paper does not state a customer lifetime, so this section makes that assumption explicit rather than hiding it inside a single number: **5-year average contract retention** for a B2G civic-infrastructure SaaS product (high switching cost once a City Hall's process depends on it; comparable public-sector software contracts commonly run 3–7 years).

```text
LTV = annual subscription × retention years
LTV (low)  = BRL 180k × 5 = BRL 900k
LTV (high) = BRL 250k × 5 = BRL 1,250k
LTV/CAC (low)  = 900k  / 30k = 30x
LTV/CAC (high) = 1,250k / 30k = ~42x
```

**Read this cautiously, not proudly.** A LTV/CAC ratio above ~3x is usually considered healthy for SaaS; 30–42x is unusually high, which is more often a sign that the CAC figure is underestimated than that the business is extraordinary. The PD1 canvas itself flags this: "long public-sector sales cycle (6–12 months)... non-trivial." A 6–12 month B2G sales cycle involving legal review, procurement, and a DPO sign-off almost certainly costs more in loaded staff time than BRL 30k. **If asked, say so directly**: "our CAC figure is likely optimistic for a first B2G sale; we'd revise it upward once we have one actual closed deal to measure against, rather than defend a 30x ratio that a real public-sector sales cycle probably doesn't support yet."

## CAC payback period

```text
CAC payback (months) = CAC / (annual subscription / 12)
Low  (high subscription): 30k / (250k/12) = 30k / 20.8k ≈ 1.4 months
High (low subscription):  30k / (180k/12) = 30k / 15.0k ≈ 2.0 months
```

Under 2 months either way — fast, _if_ the CAC figure holds, which is exactly the assumption flagged above.

## Checking the white paper's "payback is one cycle" claim

The PD2 short paper states: _"Ask ... seed envelope of BRL 400–600k ... payback is one cycle."_ This is the kind of claim this project's whole PD3 approach is built to check rather than repeat. Doing the arithmetic across the paper's own stated ranges:

```text
Payback (in cycles) = seed ask / net savings per cycle

Best case  (low ask, high savings):  400k / 300k ≈ 1.3 cycles
Worst case (high ask, low savings):  600k / 170k ≈ 3.5 cycles
Midpoint   (mid ask, mid savings):   500k / 235k ≈ 2.1 cycles
```

**The "one cycle" framing only holds at the optimistic corner of the stated ranges** (lowest ask, highest savings). At the midpoint of the same two ranges, payback is closer to two cycles; at the pessimistic corner, three and a half. If asked about this in Q&A, the honest answer is: "the white paper's headline number is the best case inside its own range; the realistic expectation, using the same figures the paper already commits to, is one-and-a-half to two cycles." That is a stronger answer than restating "one cycle" and hoping nobody does the division.

## What this document deliberately does not do

- **No BRL-per-vote conversion.** The measured gas cost (≈372k gas for a full citizen flow — see [evidence/sample-demo-report.md](evidence/sample-demo-report.md) and [03-demo-runbook.md](03-demo-runbook.md)) has not been priced in reais, because that requires a gas-price assumption and a POL/BRL exchange-rate assumption, both of which move independently of anything this team controls and neither of which has been measured on a live network yet. See [09-qa-prep.md](09-qa-prep.md), "What's the actual cost per vote" — the answer there explains why a firm reais figure isn't quoted.
- **No multi-year revenue projection chart.** A hockey-stick chart built from a 5-year retention _assumption_ stacked on top of a TAM _estimate_ would compound two unverified numbers into a graph that looks more precise than either input actually is.

## If it ends up on a slide

If the team decides one ratio is worth surfacing on the main deck rather than kept as an appendix, use the CAC payback (≈1.4–2.0 months) over the LTV/CAC ratio — it is the number least distorted by the retention assumption, and it is more defensible than a 30–42x multiple that a skeptical reviewer will (correctly) not fully believe.
