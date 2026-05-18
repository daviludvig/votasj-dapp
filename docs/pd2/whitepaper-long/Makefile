PAPER = whitepaper

.PHONY: all clean distclean watch

all: $(PAPER).pdf

$(PAPER).pdf: $(PAPER).tex refs.bib sbc-template.sty sbc.bst
	pdflatex -interaction=nonstopmode $(PAPER).tex
	bibtex $(PAPER) || true
	pdflatex -interaction=nonstopmode $(PAPER).tex
	pdflatex -interaction=nonstopmode $(PAPER).tex

# Fetch the SBC LaTeX style + BibTeX style from the UEFS mirror of the
# official SBC 2001 template. Both files are required by whitepaper.tex.
SBC_RAW = https://raw.githubusercontent.com/uefs/sbc-template-latex/master
sbc-template.sty:
	curl -fsSL -o $@ $(SBC_RAW)/sbc-template.sty
sbc.bst:
	curl -fsSL -o $@ $(SBC_RAW)/sbc.bst

clean:
	rm -f *.aux *.log *.out *.toc *.bbl *.blg *.lof *.lot *.fls *.fdb_latexmk *.synctex.gz

distclean: clean
	rm -f $(PAPER).pdf

watch:
	@echo "Requires latexmk. Run: latexmk -pdf -pvc $(PAPER).tex"
	latexmk -pdf -pvc $(PAPER).tex
