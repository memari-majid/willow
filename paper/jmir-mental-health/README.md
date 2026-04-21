# Willow Paper — JMIR Mental Health submission

This directory contains the **scoping literature review** for the
Willow project, framed and packaged for submission to
**[JMIR Mental Health](https://mental.jmir.org/)** as a *Review*
(scoping literature review) article.

It positions Willow's actual innovation — a learned, theory-grounded,
scheduled check-in workflow (**Sense → Decide → Act**) — against the
just-in-time adaptive intervention (JITAI), micro-randomized-trial,
conversational-mental-health-chatbot, and digital-therapeutic-alliance
literatures.

The chatbot itself is the *delivery substrate*. The synthesis defines
five operational criteria (C1–C5) for an integrated check-in system,
shows that no peer-reviewed system jointly satisfies them today, and
provides a subsystem-by-subsystem feasibility analysis for the gap.

## What's in this folder

| File | Purpose |
|---|---|
| `main.tex` | The full submission manuscript (IMRD format, structured abstract, JMIR end matter) |
| `references.bib` | Bibliography. Every entry has a Scite-verified DOI when available |
| `appendix-1-prisma-scr-checklist.md` | **Multimedia Appendix 1** — PRISMA-ScR (22-item) reporting checklist |
| `appendix-2-search-strategy.md` | **Multimedia Appendix 2** — Full per-query Boolean search strategy |
| `cover-letter.md` | Cover letter for the submission portal |
| `figure1.png` | Figure 2 in the manuscript — proposed agentic-workflow architecture (Sense → Decide → Act loop). Figure 1 (PRISMA-ScR study-selection flow) is generated inline by TikZ in `main.tex`. |
| `Makefile` | One-command build (`make`) using `latexmk` + `biber` |
| `README.md` | This file |

## How the paper is framed for JMIR Mental Health

The manuscript follows JMIR's required structure for *Review* article
types:

- **Article type stated** above the title ("Review (Scoping Literature Review)").
- **Structured abstract** (max 450 words) with the five JMIR headers:
  Background / Objective / Methods / Results / Conclusions, written to
  PRISMA-A guidance.
- **Manuscript body in IMRD format**: Introduction, Methods, Results,
  Discussion. The pillar (Sense / Decide / Act) and cross-cutting
  syntheses are subsections of *Results*; the integration gap (C1–C5)
  and feasibility analysis close the *Results* section.
- **Discussion** uses the JMIR-required subsection headers: Principal
  Results, Comparison with Prior Work, Limitations, Conclusions.
- **End matter** complete: Acknowledgments, Funding Statement,
  Conflicts of Interest, Data Availability, Authors' Contributions,
  Abbreviations, AI Usage Statement, Ethics Statement.
- **Multimedia Appendices** include the PRISMA-ScR checklist and the
  full search strategy.
- **Reference style**: numbered, citation-order (Vancouver / AMA-aligned)
  via `biblatex style=numeric-comp`. JMIR's typesetting team
  normalizes to AMA Manual of Style 11th edition at acceptance.

## Build

Requires a working TeX installation (TeX Live, MacTeX, or MiKTeX) plus
`latexmk` and `biber` (both ship with TeX Live by default).

```bash
make            # build main.pdf
make view       # build then open the PDF
make watch      # live-rebuild on file change
make clean      # remove aux files (.aux, .log, .toc, etc.)
make distclean  # remove everything including main.pdf
```

If you don't have a local TeX install,
[Overleaf](https://www.overleaf.com) opens this folder verbatim —
upload `main.tex` and `references.bib`. No external `.cls` or `.sty`
files are required (the paper uses the standard `article` class plus
`biblatex style=numeric-comp`).

## Adding a new citation

1. Use the Scite MCP (`scite.search_literature`) to find the paper and
   confirm its DOI.
2. Add a `@article` / `@inproceedings` / `@misc` entry to
   `references.bib` under the appropriate thematic section header.
   Include the DOI and a short `note` field with the source (Scite,
   citing-publications count, OA status, snapshot date for industry
   pieces).
3. Cite in `main.tex` with `\cite{Key}` (preferred for AMA-style
   numbered references).
4. Rebuild with `make`.

## How the synthesis is organized

The synthesis follows a **Sense → Decide → Act** loop:

- **Sense** (Pillar A): how to learn about a client over time from
  conversation and (where present) EMA / passive sensing.
- **Decide** (Pillar B): when and what to deliver — JITAI, MRT,
  contextual-bandit / RL frameworks for adaptive psychological
  interventions.
- **Act** (Pillar C): how to deliver — conversational AI for mental
  health (Woebot, Wysa, Therabot, Pi, …) plus multi-framework method
  content as the policy's action menu.

Plus six cross-cutting concerns: therapeutic frameworks (CBT, ACT, MI,
DBT, person-centered, CFT, SFBT); wellbeing techniques actually shipped
in [`../../content/techniques/`](../../content/techniques/); crisis
detection and safety; engagement and adherence; ethics and equity;
evaluation methodology.

The bibliography mirrors this structure with eleven labelled sections
(0 + A–J).

## Working norms

- **One file per section** is *not* yet warranted. Keep everything in
  `main.tex` until it exceeds ~80 pages or multiple authors are editing
  simultaneously.
- **Every `.bib` entry has a verified DOI** (or is excluded). The
  `note` field documents the Scite verification; this is suppressed
  from the printed bibliography via `\AtEveryBibitem{\clearfield{note}}`
  but kept in source as a provenance trail.
- **Industry / press snapshots are dated, never load-bearing.** Use them
  only for commercial-landscape commentary; never as the load-bearing
  source for a scientific claim.
- The lit review is a **developer-side research artefact**; the
  SME-owned [`content/evidence/references.md`](../../content/evidence/references.md)
  remains the SME's space to choose which DOIs to import for Willow's
  in-product evidence base.

## Relationship to the project plan

The single source of truth for "what's done, what's next" is
[`ROADMAP.md`](../../ROADMAP.md). This paper is the deliverable for
the *Research mode* row of Phase 4 #5; do not create competing plan
documents.
