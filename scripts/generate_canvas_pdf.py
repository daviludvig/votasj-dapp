"""
Generate visual PDF for VotaSJ PD1 — Business Model Canvas + Blockchain Canvas.
Output: docs/PD1-VotaSJ-Canvas.pdf
"""

from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import KeepInFrame
import os

OUTPUT = os.path.join(os.path.dirname(__file__), "..", "docs", "PD1-VotaSJ-Canvas.pdf")

# ── Palette ────────────────────────────────────────────────────────────────────
BLUE_DARK   = colors.HexColor("#1A3A5C")
BLUE_MID    = colors.HexColor("#2E6DA4")
BLUE_LIGHT  = colors.HexColor("#D6E8F7")
TEAL        = colors.HexColor("#1B7A6E")
TEAL_LIGHT  = colors.HexColor("#D0EDE9")
GREEN_LIGHT = colors.HexColor("#DFF0D8")
AMBER_LIGHT = colors.HexColor("#FFF3CD")
GREY_LIGHT  = colors.HexColor("#F5F5F5")
RED_LIGHT   = colors.HexColor("#FDECEA")
PURPLE_LIGHT= colors.HexColor("#EDE7F6")
WHITE       = colors.white
BLACK       = colors.HexColor("#212121")

PAGE_W, PAGE_H = landscape(A3)
MARGIN = 14 * mm

# ── Styles ─────────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

def _style(name, **kwargs):
    base = dict(fontName="Helvetica", fontSize=7, leading=9,
                textColor=BLACK, spaceAfter=2, alignment=TA_LEFT)
    base.update(kwargs)
    return ParagraphStyle(name, **base)

S_TITLE  = _style("title",  fontName="Helvetica-Bold", fontSize=18,
                  textColor=WHITE, alignment=TA_CENTER, leading=22)
# Number: small, black, top-left of each cell
S_NUM    = _style("num",    fontName="Helvetica-Bold", fontSize=8,
                  textColor=BLACK, alignment=TA_LEFT, leading=10)
# Title: dark navy, centered, readable on light backgrounds
S_HDR    = _style("hdr",    fontName="Helvetica-Bold", fontSize=8.5,
                  textColor=BLUE_DARK, alignment=TA_CENTER, leading=11)
# Title variant for VP/RS boxes (teal background)
S_HDR_T  = _style("hdrT",   fontName="Helvetica-Bold", fontSize=8.5,
                  textColor=TEAL, alignment=TA_CENTER, leading=11)
S_BODY   = _style("body",   fontSize=7, leading=9)
S_BULLET = _style("bullet", fontSize=6.5, leading=9.5, leftIndent=7,
                  firstLineIndent=-7)
S_SUB    = _style("sub",    fontName="Helvetica-Bold", fontSize=6.5,
                  leading=10, spaceAfter=1)
S_META   = _style("meta",   fontName="Helvetica-Oblique", fontSize=6,
                  textColor=colors.HexColor("#555555"), leading=8)
S_FOOT   = _style("foot",   fontName="Helvetica-Oblique", fontSize=6.5,
                  textColor=colors.HexColor("#666666"), alignment=TA_CENTER, leading=8)

def esc(txt):
    """Escape raw text for reportlab XML parser (no markup in our bullets)."""
    return txt.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def P(txt, style=None):
    return Paragraph(txt, style or S_BODY)

def Praw(txt, style=None):
    """Paragraph with pre-escaped raw text."""
    return Paragraph(esc(txt), style or S_BODY)

def Ps(items, sub=None):
    """Render a list of bullet strings, optionally preceded by a bold sub-title."""
    out = []
    if sub:
        out.append(Praw(sub, S_SUB))
    for it in items:
        out.append(Praw(f"• {it}", S_BULLET))
    return out

# ══════════════════════════════════════════════════════════════════════════════
# BUSINESS MODEL CANVAS
# ══════════════════════════════════════════════════════════════════════════════

_uid = [0]

def _cell_st(title_color, bfs, sfs, tfs, nfs=8):
    """Return a fresh set of paragraph styles with unique names for one cell."""
    _uid[0] += 1
    u = _uid[0]
    return (
        ParagraphStyle(f"N{u}", fontName="Helvetica-Bold",
            fontSize=nfs, leading=round(nfs*1.3,1),
            textColor=BLACK, alignment=TA_LEFT, spaceAfter=1),
        ParagraphStyle(f"H{u}", fontName="Helvetica-Bold",
            fontSize=tfs, leading=round(tfs*1.3,1),
            textColor=title_color, alignment=TA_CENTER, spaceAfter=2),
        ParagraphStyle(f"S{u}", fontName="Helvetica-Bold",
            fontSize=sfs, leading=round(sfs*1.5,1),
            textColor=BLACK, alignment=TA_LEFT, spaceAfter=1),
        ParagraphStyle(f"B{u}", fontName="Helvetica",
            fontSize=bfs, leading=round(bfs*1.45,1),
            textColor=BLACK, alignment=TA_LEFT,
            leftIndent=round(bfs*1.1,1), firstLineIndent=-round(bfs*1.1,1),
            spaceAfter=1),
    )

def bmc_cell(number, title, bg, items_groups, teal=False,
             bfs=6.5, sfs=6.5, tfs=8.5):
    sn, sh, ss, sb = _cell_st(TEAL if teal else BLUE_DARK, bfs, sfs, tfs)
    out = [Paragraph(esc(number), sn), Paragraph(esc(title), sh), Spacer(1,4)]
    for sub, bullets in items_groups:
        if sub: out.append(Paragraph(esc(sub), ss))
        for it in bullets: out.append(Paragraph(esc(f"• {it}"), sb))
    return out


KP_content = bmc_cell("1", "KEY PARTNERS", BLUE_MID, [
    (None, [
        "São José City Hall — anchor customer & institutional partner",
        "UFSC / Blockchain Lab — academic audit & zk-research",
        "gov.br / Serpro — citizen identity provider (critical dependency)",
        "Polygon Labs — L2 infrastructure & co-marketing",
        "Chainlink — oracle automation (cycle closing)",
        "OpenZeppelin / Hacken — external smart-contract audits",
        "OAB-SC & Public Prosecutor — legal validation",
        "Neighborhood associations — grassroots mobilization",
        "Local media (NDTV, Notícias do Dia) — civic awareness",
    ]),
], bfs=10.0, sfs=9.0, tfs=11.0)

KA_content = bmc_cell("2", "KEY ACTIVITIES", BLUE_MID, [
    (None, [
        "Develop & maintain smart contracts (registry, cycle, tally)",
        "Operate each cycle end-to-end (vote, tally, milestones) — delivers instant-tally VP to City Hall",
        "Recurring external security audits on every major release — manufactures fraud-resistance VP",
        "Maintain gov.br / Serpro identity integration",
        "Train City Hall staff and community agents",
        "Civic communication & mobilization (press, associations)",
        "LGPD & FOI compliance — continuous, not one-off",
    ]),
], bfs=8.0, sfs=7.5, tfs=9.5)

KR_content = bmc_cell("3", "KEY RESOURCES", BLUE_MID, [
    ("Human", ["2 Solidity devs, 2 full-stack, 1 UX, 1 security/audit specialist", "B2G account executive (long public-sector sales cycle)"]),
    ("Intellectual", ["Audited smart contracts — core asset; without clean audit, no product", "VotaSJ protocol (state machine + zk circuits from PD2)"]),
    ("Infrastructure", ["Dedicated Polygon PoS node, IPFS pinning, The Graph subgraph indexer"]),
    ("Intangible", ["Institutional partnership (City Hall MoU, DPO, LGPD DPA)", "Brand & public trust — governance product = trust product"]),
], bfs=6.5, sfs=6.5, tfs=8.5)

VP_content = bmc_cell("4", "VALUE PROPOSITIONS", TEAL, [
    ("Risk reduction", [
        "Fraud resistance — immutable on-chain tally; City Hall no longer controls the count",
        "Radical transparency — real-time audit by any citizen, journalist, or councilor",
        "LGPD-compliant privacy — no personal data on-chain; eligibility proven via hash",
    ]),
    ("Cost reduction", [
        "Replaces BRL 300k–500k/cycle in physical assemblies, poll workers & manual tallying",
    ]),
    ("Accessibility", [
        "Remote participation — vote from any smartphone, any time during the window",
        "Inclusion via assisted kiosks at CRAS, UPAs, and municipal libraries",
    ]),
    ("Performance", [
        "Instant tally — result in minutes vs. ~3 weeks of manual reconciliation",
    ]),
    ("New offering", [
        "Participation SBT — non-transferable proof of civic engagement per cycle",
    ]),
    ("Cross-block delivery", [
        "Fraud resistance: audited contracts (Key Resource) + external audits (Key Activity)",
        "Kiosks & PWA Channels designed one-to-one for each citizen CS sub-segment",
        "Cost-reduction VP replaces City Hall's BRL 300–500k/cycle — basis of Revenue Streams",
    ]),
], teal=True, bfs=9.0, sfs=8.0, tfs=10.5)

CR_content = bmc_cell("5", "CUSTOMER RELATIONSHIPS", BLUE_MID, [
    (None, [
        "Self-service (default) — registration, voting & result consultation via PWA",
        "Personal assistance — assisted kiosks operated by municipal staff for digital-inclusion segments",
        "Automated execution tracking — milestone notifications to voters after cycle closes",
        "Community — public proposal commenting scoped by administrative region",
        "Co-creation — proposals originate from citizens; City Hall commits budget, not the idea",
        "Dedicated B2G account management — named technical contact for City Hall renewal",
        "Mix reflects CS: self-service scales to 180k citizens at zero marginal cost",
        "Dedicated B2G retains City Hall — the only CS segment generating Revenue Streams",
    ]),
], bfs=7.0, sfs=7.0, tfs=9.0)

CH_content = bmc_cell("6", "CHANNELS", BLUE_MID, [
    ("Own", [
        "VotaSJ mobile PWA — primary voting channel for citizens",
        "Web portal (são-jose.sc.gov.br integration) — audit, results, press",
        "Assisted physical kiosks (CRAS, UPAs, libraries) — unbanked / non-smartphone citizens",
        "The Graph subgraph + REST API — machine-to-machine for TCE-SC / prosecutors",
    ]),
    ("Partner", [
        "gov.br OIDC — identity & authentication channel",
        "Neighborhood associations — mobilization & last-mile awareness",
        "Local press (NDTV, Notícias do Dia) — civic communication",
    ]),
], bfs=7.5, sfs=7.0, tfs=9.5)

CS_content = bmc_cell("7", "CUSTOMER SEGMENTS", BLUE_MID, [
    ("Multi-sided platform", []),
    ("Primary (non-paying)", [
        "~180,000 eligible citizens of São José/SC (16+)",
        "Job: vote digitally, see result was counted",
    ]),
    ("Paying (B2G)", [
        "São José City Hall — Planning Sec. + Ombudsman",
        "Job: run a cheap, legitimate, fraud-proof cycle",
    ]),
    ("Grassroots", [
        "Neighborhood associations (Forquilhinhas, Kobrasol, Barreiros, Campinas)",
        "Job: channel neighborhood demands into a binding process",
    ]),
    ("Institutional auditors", [
        "TCE-SC and Public Prosecutor's Office",
        "Job: audit in real time with cryptographic certainty",
    ]),
    ("Expansion (future)", [
        "City halls of Palhoça, Biguaçu, Florianópolis",
    ]),
], bfs=10.0, sfs=9.0, tfs=11.0)

COST_content = bmc_cell("8", "COST STRUCTURE", BLUE_MID, [
    ("Model: value-driven", ["Compete on trust & legitimacy (VP), not price — City Hall (CS) buys legitimacy, not software"]),
    ("Fixed ~BRL 85k/month", [
        "Team payroll (6 people): BRL 65k",
        "Cloud + Polygon node + IPFS: BRL 4k",
        "Legal / LGPD / DPO: BRL 6k",
        "Civic marketing & ops: BRL 10k",
    ]),
    ("Variable (per cycle)", [
        "Polygon gas: <BRL 0.50/vote (~50k voters)",
        "External security audit: BRL 40k–80k per release — Key Activity manufacturing fraud-resistance VP",
    ]),
    ("B2G acquisition", [
        "~BRL 30k per city hall (6–12 month sales cycle)",
    ]),
    ("Economies of scope", [
        "Each new city hall (CS expansion) amortizes audit & dev — scope economies tied to CS growth",
    ]),
], bfs=8.0, sfs=8.0, tfs=10.0)

RS_content = bmc_cell("9", "REVENUE STREAMS", TEAL, [  # noqa
    ("Recurring", [
        "Annual SaaS subscription — City Hall: BRL 180k–250k/yr (primary revenue)",
        "White-label license — OAB-SC, CREA-SC, unions (recurring)",
    ]),
    ("Transactional", [
        "Per-cycle setup fee: BRL 40k per cycle executed",
        "Implementation consulting for additional city halls: BRL 60k–120k",
    ]),
    ("Seed (non-recurring)", [
        "Grants: BNDES, IDB, LabCidades civic-innovation fund",
    ]),
    ("Citizens never pay", [
        "Monetizing votes would collapse the value proposition",
    ]),
    ("CS → Revenue link", [
        "City Hall (CS) pays BRL 180–250k/yr because VPs cut their cycle cost from BRL 300–500k — positive ROI",
    ]),
], teal=True, bfs=8.5, sfs=7.5, tfs=10.0)

# ── BMC grid layout ────────────────────────────────────────────────────────────
# Standard BMC grid (landscape A3, 5 columns × 2 rows + footer row)
# Col widths sum to usable width

def make_bmc(doc):
    W = PAGE_W - 2 * MARGIN
    H = PAGE_H - 2 * MARGIN

    # Title bar
    title_data = [[P("VotaSJ — Digital Participatory Budgeting · Business Model Canvas · PD1 — INE5458 UFSC 2026/1", S_TITLE)]]
    title_table = Table(title_data, colWidths=[W])
    title_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), BLUE_DARK),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("RIGHTPADDING",  (0,0), (-1,-1), 8),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("BOX",           (0,0), (-1,-1), 0.5, WHITE),
    ]))

    # Column widths: KP | KA/KR | VP | CR/CH | CS
    cw = [W*0.18, W*0.17, W*0.22, W*0.17, W*0.26]
    ROW_H  = 220   # pt — top half rows
    ROW_H2 = 220   # pt
    FOOT_H = 235   # pt — bottom row (needs room for COST at 8pt)

    def framed(content, bg):
        return KeepInFrame(
            sum(cw),  # maxWidth (will be constrained by table)
            ROW_H,
            content,
            mode="shrink",
        )

    def tc(content):
        """Wrap content list into a single Paragraph-list for a table cell."""
        return content

    # Build 3-row table:
    # Row 0: KP (rowspan 2) | KA | VP (rowspan 2) | CR | CS (rowspan 2)
    # Row 1:                 | KR |                | CH |
    # Row 2: COST (colspan 2.5) | (blank VP overlap) | RS (colspan 2.5)

    # reportlab Table doesn't do rowspan/colspan easily unless we use SPAN commands
    # We'll use a flat 3-row × 5-col table with SPAN styling

    data = [
        [tc(KP_content), tc(KA_content), tc(VP_content), tc(CR_content), tc(CS_content)],
        [None,           tc(KR_content), None,           tc(CH_content), None],
        [tc(COST_content), "", "", tc(RS_content), ""],
    ]

    rh = [ROW_H, ROW_H2, FOOT_H]

    grid = Table(data, colWidths=cw, rowHeights=rh)
    grid.setStyle(TableStyle([
        # Spans
        ("SPAN", (0,0), (0,1)),   # KP spans rows 0-1
        ("SPAN", (2,0), (2,1)),   # VP spans rows 0-1
        ("SPAN", (4,0), (4,1)),   # CS spans rows 0-1
        ("SPAN", (0,2), (2,2)),   # Cost spans cols 0-2
        ("SPAN", (3,2), (4,2)),   # RS spans cols 3-4

        # Backgrounds
        ("BACKGROUND", (0,0), (0,1), BLUE_LIGHT),   # KP
        ("BACKGROUND", (1,0), (1,0), BLUE_LIGHT),   # KA
        ("BACKGROUND", (1,1), (1,1), BLUE_LIGHT),   # KR
        ("BACKGROUND", (2,0), (2,1), TEAL_LIGHT),   # VP
        ("BACKGROUND", (3,0), (3,0), BLUE_LIGHT),   # CR
        ("BACKGROUND", (3,1), (3,1), BLUE_LIGHT),   # CH
        ("BACKGROUND", (4,0), (4,1), BLUE_LIGHT),   # CS
        ("BACKGROUND", (0,2), (2,2), AMBER_LIGHT),  # Cost
        ("BACKGROUND", (3,2), (4,2), GREEN_LIGHT),  # RS

        # Grid lines
        ("BOX",      (0,0), (-1,-1), 1.5, BLUE_DARK),
        ("INNERGRID",(0,0), (-1,-1), 0.5, BLUE_MID),

        # Padding
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("RIGHTPADDING",  (0,0), (-1,-1), 5),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
    ]))

    # Footer
    authors = "Davi Ludvig Longen Machado · Lucas Furlanetto Pascoali · Arthur Clasen de Melo · Pedro Henrique Tesman Mansani da Silva"
    footer_data = [[P(authors, S_FOOT)]]
    footer = Table(footer_data, colWidths=[W])
    footer.setStyle(TableStyle([
        ("TOPPADDING",    (0,0), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
        ("LEFTPADDING",   (0,0), (-1,-1), 0),
        ("BACKGROUND",    (0,0), (-1,-1), GREY_LIGHT),
        ("BOX",           (0,0), (-1,-1), 0.5, BLUE_MID),
    ]))

    return [title_table, Spacer(1, 3*mm), grid, Spacer(1, 2*mm), footer]


# ══════════════════════════════════════════════════════════════════════════════
# BLOCKCHAIN CANVAS
# ══════════════════════════════════════════════════════════════════════════════

BLK_ROW1 = colors.HexColor("#1A3A5C")
BLK_ROW2 = colors.HexColor("#2E6DA4")
BLK_ROW3 = colors.HexColor("#1B7A6E")

CELL_R1 = colors.HexColor("#D6E8F7")
CELL_R2 = colors.HexColor("#E8F1FA")
CELL_R3 = colors.HexColor("#D0EDE9")

def bc_cell(number, title, bg, hdr_bg, items_groups,
            bfs=9.0, sfs=8.0, tfs=10.0):
    sn, sh, ss, sb = _cell_st(BLUE_DARK, bfs, sfs, tfs)
    out = [Paragraph(esc(number), sn), Paragraph(esc(title), sh), Spacer(1,3)]
    for sub, bullets in items_groups:
        if sub: out.append(Paragraph(esc(sub), ss))
        for it in bullets: out.append(Paragraph(esc(f"• {it}"), sb))
    return out


PROB_content = bc_cell("1", "PROBLEM", CELL_R1, BLK_ROW1, [
    (None, [
        "Low turnout (<2% of eligible voters) — requires night-time in-person assemblies",
        "Distrust in the tally — City Hall tallies its own process (interested party, no independent audit)",
        "High operational cost — BRL 300k–500k/cycle in physical ballots, poll workers & manual tallying",
        "Post-vote opacity — citizens cannot verify whether winning project was actually executed",
    ]),
], bfs=9.5, sfs=9.0, tfs=11.0)

SOL_content = bc_cell("2", "SOLUTION", CELL_R1, BLK_ROW1, [
    (None, [
        "Permissionless-read, permissioned-write public blockchain app on Polygon PoS",
        "Eligibility proof (gov.br + residence) validated off-chain → committed on-chain as credential hash",
        "Proposals, votes & tally run as smart-contract transactions — tamper-evident, publicly auditable",
        "Budget execution milestones recorded on-chain — closes the accountability loop",
    ]),
], bfs=9.5, sfs=9.0, tfs=11.0)

ENT_content = bc_cell("3", "ENTITIES", CELL_R1, BLK_ROW1, [
    (None, [
        "~180,000 eligible citizens (São José/SC) — many, heterogeneous, anonymous",
        "City Hall (Planning Sec.) — single operator, interested party",
        "UFSC / Blockchain Lab — academic auditor",
        "TCE-SC (State Court of Audit) — institutional auditor",
        "Public Prosecutor's Office — legal auditor",
        "Polygon validator set (~100) — external, open public network",
    ]),
], bfs=9.0, sfs=8.5, tfs=10.5)

DIV_content = bc_cell("4", "DIVERGENCE", CELL_R1, BLK_ROW1, [
    (None, [
        "Citizens do not trust City Hall to tally honestly or honor winning proposals",
        "City Hall does not trust citizenry: ballot stuffing, identity fraud, vote buying risks",
        "No neutral third party with legitimacy AND technical capacity to run the process",
        "Every cycle ends with opposition fraud accusations — unprovable either way",
        "→ Blockchain fits: trust problem is horizontal & political",
    ]),
], bfs=9.0, sfs=8.5, tfs=10.5)

MOT_content = bc_cell("5", "MOTIVATION", CELL_R1, BLK_ROW1, [
    ("Gains", [
        "Citizen: digital participation + verifiable vote + SBT + execution follow-up",
        "City Hall: lower costs, higher turnout, defense against fraud claims",
        "Auditors: real-time cryptographic trail instead of paper reconstruction",
    ]),
    ("Attack deterrence", [
        "Sybil: blocked by gov.br CPF → 1 credential hash → 1 vote",
        "Admin abuse: 3-of-5 multisig + 14-day upgrade timelock",
        "Vote buying: zk-proof of eligibility removes 'prove who you voted for' ability",
        "Censorship: public Polygon L2 — City Hall cannot unilaterally take offline",
    ]),
], bfs=7.5, sfs=7.0, tfs=9.5)

PEERS_content = bc_cell("6", "NETWORK PEERS", CELL_R2, BLK_ROW2, [
    (None, [
        "Eligible citizen (wallet + gov.br credential) — submit proposal, cast 1 vote/cycle, read all",
        "City Hall multisig (3-of-5 with UFSC + TCE) — open cycle, set budget/deadlines, record milestones",
        "Auditor (UFSC / TCE-SC multisig signer) — co-sign admin ops, technical veto",
        "Public observer (any wallet) — read-only, no write rights",
        "Polygon validator — external; provides consensus & finality, not a VotaSJ role",
    ]),
], bfs=8.5, sfs=8.0, tfs=10.5)

TX_content = bc_cell("7", "TRANSACTIONS", CELL_R2, BLK_ROW2, [
    (None, [
        "registerVoter(addr, credentialHash) — onboard eligible citizen",
        "revokeVoter(addr, reason) — remove eligibility (death, fraud, loss of residence)",
        "openCycle(opensAt, closesAt, budgetWei) — start cycle (multisig)",
        "submitProposal(ipfsCid) — citizen submits proposal; metadata pinned to IPFS",
        "vote(proposalId) — 1 vote per citizen per cycle",
        "closeCycle() — deterministic tally, winner emitted via event",
        "recordMilestone(...) (PD3) — on-chain execution progress commitment",
        "Volume: ~50k tx/cycle; 1 cycle/year initially",
    ]),
], bfs=7.5, sfs=7.0, tfs=9.5)

DATA_content = bc_cell("8", "DATA", CELL_R2, BLK_ROW2, [
    (None, [
        "Credential hash (keccak256) — on-chain, low volume, HIGH criticality",
        "Proposal IPFS CID + submitter — on-chain, low volume, HIGH criticality",
        "Proposal metadata (title, description, budget, images) — IPFS only, medium volume",
        "Vote (voter addr, proposal id, cycle id) — on-chain, HIGH volume (~50k/cycle), CRITICAL",
        "Tally result (winner, total votes) — on-chain, low volume, CRITICAL",
        "Execution milestones — on-chain, low volume, HIGH criticality",
        "Personal data (CPF, name, address) — NEVER on-chain (LGPD)",
    ]),
], bfs=8.5, sfs=8.0, tfs=10.5)

PROC_content = bc_cell("9", "TYPE OF PROCESSING", CELL_R2, BLK_ROW2, [
    ("Distributed calculation", [
        "Voter eligibility check, one-vote enforcement, tally computation",
        "Cycle state machine: Pending → Open → Closed",
    ]),
    ("Distributed storage (event log)", [
        "Immutable audit trail of every registration, vote & cycle closure",
    ]),
    ("Oracles", [
        "gov.br — off-chain identity → on-chain via City Hall multisig relayer",
        "Chainlink Automation — triggers closeCycle() at closesAt without human action",
    ]),
], bfs=8.5, sfs=8.0, tfs=10.5)

VAL_content = bc_cell("10", "VALUE", CELL_R2, BLK_ROW2, [
    ("No fungible / speculative token", []),
    ("Civic & institutional value", [
        "Credential SBT (ERC-5192) — non-transferable proof of municipal citizenship",
        "Participation badge SBT (per cycle) — permanent non-transferable civic engagement record",
        "Budget commitment (wei) — symbolic of BRL value; actual funds move off-chain via SIG",
    ]),
    ("Explicitly ruled out", [
        "Fungible vote-token — monetizing votes invalidates the entire value proposition",
    ]),
], bfs=8.5, sfs=8.0, tfs=10.5)

DYN_content = bc_cell("11", "NETWORK DYNAMICS", CELL_R3, BLK_ROW3, [
    ("Consensus (inherited)", [
        "Polygon PoS — HotStuff BFT, ~100 public validators, ~2s finality",
    ]),
    ("Application-layer rules (smart contract)", [
        "registerVoter: only multisig admin, non-zero addr, not already registered",
        "submitProposal: cycle Open, sender registered, CID non-empty",
        "vote: cycle Open, within [opensAt, closesAt), sender registered & not yet voted",
        "openCycle: opensAt < closesAt > now, previous cycle Closed",
        "closeCycle: only after closesAt, max(votes) computed deterministically",
    ]),
    ("Upgrade rule", [
        "UUPS proxy + 14-day timelock — no upgrades during active cycle",
    ]),
    ("Admin rule", [
        "3-of-5 multisig (City Hall ×3, UFSC ×1, TCE-SC ×1) — no single signer can act alone",
    ]),
], bfs=8.5, sfs=7.5, tfs=10.0)

VERIFY_content = bc_cell("12", "POINTS TO VERIFY (off-chain)", CELL_R3, BLK_ROW3, [
    (None, [
        "Legal feasibility — OAB-SC & municipal legal dept must confirm digital process satisfies Organic Law",
        "gov.br integration — exact Serpro API flow, rate limits & SLA need validation",
        "LGPD opinion — municipal DPO must confirm CPF-derived hash is not personal data processing",
        "zk-proof of eligibility (PD2) — Semaphore/zk-SNARK circuit needs prototyping on Polygon Amoy",
        "Real turnout — >5% target is hypothesis; needs pilot validation (PD3)",
        "Assisted kiosk feasibility — staff, location & device custody must be negotiated with City Hall",
        "Gas-cost budget — ~430k gas/citizen-flow measured on Hardhat; must re-measure on Amoy",
    ]),
], bfs=11.0, sfs=10.0, tfs=12.0)


def make_blockchain(doc):
    W = PAGE_W - 2 * MARGIN
    H = PAGE_H - 2 * MARGIN

    title_data = [[P("VotaSJ — Digital Participatory Budgeting · Blockchain Canvas · PD1 — INE5458 UFSC 2026/1", S_TITLE)]]
    title_table = Table(title_data, colWidths=[W])
    title_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), TEAL),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("RIGHTPADDING",  (0,0), (-1,-1), 8),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("BOX",           (0,0), (-1,-1), 0.5, WHITE),
    ]))

    # Row headers (vertical labels for the 3 rows)
    ROW_LABEL_W = 18 * mm
    cw_inner = [(W - ROW_LABEL_W) / 5] * 5
    cw = [ROW_LABEL_W] + cw_inner

    TOTAL_CANVAS_H = H * 0.88
    rh = [TOTAL_CANVAS_H / 3] * 3

    def row_label(text, bg):
        return P(f"<b>{text}</b>", ParagraphStyle("rl",
            fontName="Helvetica-Bold", fontSize=7.5, textColor=WHITE,
            alignment=TA_CENTER, leading=10))

    data = [
        # Row 1: Conceptual framing
        [row_label("ROW 1\nConceptual\nFraming", BLK_ROW1),
         PROB_content, SOL_content, ENT_content, DIV_content, MOT_content],
        # Row 2: Operational design
        [row_label("ROW 2\nOperational\nDesign", BLK_ROW2),
         PEERS_content, TX_content, DATA_content, PROC_content, VAL_content],
        # Row 3: Network rules — DYN=2 cols, VERIFY=3 cols
        [row_label("ROW 3\nNetwork\nRules", BLK_ROW3),
         DYN_content, None, VERIFY_content, None, None],
    ]

    grid = Table(data, colWidths=cw, rowHeights=rh)
    grid.setStyle(TableStyle([
        # Row label backgrounds
        ("BACKGROUND", (0,0), (0,0), BLK_ROW1),
        ("BACKGROUND", (0,1), (0,1), BLK_ROW2),
        ("BACKGROUND", (0,2), (0,2), BLK_ROW3),

        # Cell backgrounds row 1
        ("BACKGROUND", (1,0), (5,0), CELL_R1),
        # Cell backgrounds row 2
        ("BACKGROUND", (1,1), (5,1), CELL_R2),
        # Cell backgrounds row 3
        ("BACKGROUND", (1,2), (5,2), CELL_R3),
        # Row 3: DYN spans cols 1-2, VERIFY spans cols 3-5
        ("SPAN", (1,2), (2,2)),
        ("SPAN", (3,2), (5,2)),

        # Grid
        ("BOX",       (0,0), (-1,-1), 1.5, TEAL),
        ("INNERGRID", (0,0), (-1,-1), 0.5, colors.HexColor("#2E6DA4")),

        # Padding
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("RIGHTPADDING",  (0,0), (-1,-1), 5),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("VALIGN",        (0,0), (0,-1), "MIDDLE"),
    ]))

    # Footer with row legend
    legend = (
        "Row 1 — Conceptual Framing: Problem · Solution · Entities · Divergence · Motivation   |   "
        "Row 2 — Operational Design: Network Peers · Transactions · Data · Type of Processing · Value   |   "
        "Row 3 — Network Rules: Network Dynamics · Points to Verify (off-chain)"
    )
    footer_data = [
        [P("Davi Ludvig Longen Machado · Lucas Furlanetto Pascoali · Arthur Clasen de Melo · Pedro Henrique Tesman Mansani da Silva", S_FOOT)],
        [P(legend, S_FOOT)],
    ]
    footer = Table(footer_data, colWidths=[W])
    footer.setStyle(TableStyle([
        ("TOPPADDING",    (0,0), (-1,-1), 2),
        ("BOTTOMPADDING", (0,0), (-1,-1), 2),
        ("LEFTPADDING",   (0,0), (-1,-1), 0),
        ("BACKGROUND",    (0,0), (-1,-1), GREY_LIGHT),
        ("BOX",           (0,0), (-1,-1), 0.5, TEAL),
    ]))

    return [title_table, Spacer(1, 3*mm), grid, Spacer(1, 2*mm), footer]


# ══════════════════════════════════════════════════════════════════════════════
# ASSEMBLE PDF
# ══════════════════════════════════════════════════════════════════════════════

def build():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=landscape(A3),
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
    )

    story = []
    story.extend(make_bmc(doc))
    story.append(PageBreak())
    story.extend(make_blockchain(doc))

    doc.build(story)
    print(f"Generated: {OUTPUT}")


if __name__ == "__main__":
    build()
