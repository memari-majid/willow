# Willow Literature Review (LaTeX)

This is the **canonical literature review** for the Willow project. It
positions Willow's actual innovation — a learned, theory-grounded,
scheduled check-in workflow (**Sense → Decide → Act**) — against the
Just-in-Time Adaptive Intervention (JITAI), micro-randomized-trial,
and digital-mental-health-chatbot literatures.

The chatbot itself is the *delivery substrate*. The synthesis defines
five operational criteria (C1–C5) for an integrated check-in system,
shows that no peer-reviewed system jointly satisfies them today, and
provides a subsystem-by-subsystem feasibility analysis for the gap.

## Contents

| File | Purpose |
|---|---|
| `main.tex` | The full survey (sections, tables, citations) |
| `references.bib` | Bibliography. Every entry has a Scite-verified DOI when available |
| `Makefile` | One-command build (`make`) using `latexmk` + `biber` |
| `README.md` | This file |

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
biblatex `style=ieee`).

## Adding a new citation

1. Use the Scite MCP (`scite.search_literature`) to find the paper and
   confirm its DOI.
2. Add a `@article` / `@inproceedings` / `@misc` entry to
   `references.bib` under the appropriate thematic section header.
   Include the DOI and a short `note` field with the source (Scite,
   citing-publications count, OA status, snapshot date for industry
   pieces).
3. Cite in `main.tex` with `\cite{Key}` or `\autocite{Key}` (preferred
   for narrative flow).
4. Rebuild with `make`.

## How this paper is organised

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
- **Working draft until further notice.** Tag `Phase 0`, `Phase 1`,
  etc. in commit messages so the survey's growth is auditable.
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
