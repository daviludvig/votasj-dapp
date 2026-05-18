PAPER = whitepaper

.PHONY: all clean distclean watch

all: $(PAPER).pdf

$(PAPER).pdf: $(PAPER).tex refs.bib sbc-template.sty sbc.bst
	pdflatex -interaction=nonstopmode $(PAPER).tex
	pdflatex -interaction=nonstopmode $(PAPER).tex

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
	latexmk -pdf -pvc $(PAPER).tex
