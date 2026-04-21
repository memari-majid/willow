# Willow -- Literature Review build
#
# Default builds main.pdf using latexmk + biber.
# Requires: TeX Live (or MacTeX), biber, latexmk.

MAIN     := main
LATEXMK  := latexmk
LATEXMK_OPTS := -pdf -bibtex-cond -interaction=nonstopmode -halt-on-error -file-line-error -shell-escape

.PHONY: all pdf clean distclean watch view

all: pdf

pdf:
	$(LATEXMK) $(LATEXMK_OPTS) $(MAIN).tex

# Live rebuild on file change (latexmk -pvc).
watch:
	$(LATEXMK) $(LATEXMK_OPTS) -pvc $(MAIN).tex

# Open the PDF (Linux: xdg-open; macOS: open).
view: pdf
	@command -v xdg-open >/dev/null 2>&1 && xdg-open $(MAIN).pdf || open $(MAIN).pdf

clean:
	$(LATEXMK) -c

distclean:
	$(LATEXMK) -C
	rm -f $(MAIN).bbl $(MAIN).run.xml $(MAIN).synctex.gz $(MAIN).bcf
