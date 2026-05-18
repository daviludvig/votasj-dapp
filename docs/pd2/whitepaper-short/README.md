# VotaSJ — Short Business/User White Paper (PD2)

Two equivalent renderings of the same document:

- [whitepaper.md](whitepaper.md) — Markdown (browsable on GitHub, source of truth for diffs).
- [whitepaper.tex](whitepaper.tex) — LaTeX in SBC template format (final submission artifact).
- [whitepaper.pdf](whitepaper.pdf) — Compiled PDF from the .tex (2 pages, hard cap).

The short paper uses inline-URL references (footnote style) instead of a separate BibTeX bibliography to keep the deliverable within the 2-page envelope. The same four URLs are tracked in `refs.bib` for reuse by the long paper and for future expansion if the page budget loosens.

## Building the PDF

```bash
make            # builds whitepaper.pdf (fetches sbc-template.sty + sbc.bst on first run)
make clean      # removes aux/log files
make distclean  # removes the PDF too
```

Requires `pdflatex` (TeX Live or MiKTeX) and `curl` on `$PATH`.

## File map

| File | Purpose |
| ---- | ------- |
| `whitepaper.md` | Source-of-truth markdown rendering. |
| `whitepaper.tex` | SBC LaTeX rendering — the formal submission. |
| `refs.bib` | BibTeX references for the same URLs (kept for symmetry; not consumed by the .tex). |
| `Makefile` | One-shot build target; auto-fetches SBC template files. |
| `sbc-template.sty`, `sbc.bst` | SBC style + bibliography style. Committed for offline reproducibility; the `Makefile` can also re-fetch them from the uefs/sbc-template-latex mirror. |
| `whitepaper.pdf` | Compiled deliverable. |
