# VotaSJ — Long Technical White Paper (PD2)

Two equivalent renderings of the same document:

- [whitepaper.md](whitepaper.md) — Markdown (browsable on GitHub, source of truth for diffs).
- [whitepaper.tex](whitepaper.tex) — LaTeX in SBC template format (final submission artifact).
- [whitepaper.pdf](whitepaper.pdf) — Compiled PDF from the .tex (14 pages).

## Building the PDF

The LaTeX source uses the **SBC (Sociedade Brasileira de Computação) article style** — the same one SBSeg full papers use. `make` auto-fetches `sbc-template.sty` and `sbc.bst` from the [uefs/sbc-template-latex](https://github.com/uefs/sbc-template-latex) mirror of the official SBC 2001 template.

```bash
make            # builds whitepaper.pdf (fetches sbc-template.sty + sbc.bst on first run)
make clean      # removes aux/log files
make distclean  # removes the PDF too
```

Requires a working `pdflatex` + `bibtex` (TeX Live or MiKTeX) and `curl` on `$PATH`.

## File map

| File | Purpose |
| ---- | ------- |
| `whitepaper.md` | Source-of-truth markdown rendering. |
| `whitepaper.tex` | SBC LaTeX rendering — the formal submission. |
| `refs.bib` | BibTeX references; **only entries with a verified public URL**. |
| `Makefile` | One-shot build target; auto-fetches SBC template files. |
| `sbc-template.sty`, `sbc.bst` | SBC style + bibliography style. Committed for offline reproducibility; the `Makefile` can also re-fetch them from the [uefs/sbc-template-latex](https://github.com/uefs/sbc-template-latex) mirror. |
| `whitepaper.pdf` | Compiled deliverable. |
