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

## Publication plan

The paper is a scoping literature review plus research agenda — no
implementation, no human-subjects data. That shape constrains which
venues are realistic: archival ML/AI main tracks expect empirical
results, so the primary targets are HCI, health-informatics, and
digital-mental-health venues that explicitly welcome scoping reviews,
position papers, and agenda-setting work. US-based venues only, as
agreed with the author.

Status snapshot is current as of **April 2026**. Check each venue's
official CFP before submitting; deadlines shift.

### Tier 1 — realistic primary targets (2026 cycle)

| Venue | Location | Deadline | Why it fits |
|---|---|---|---|
| **AAAI 2027 main track** (or co-located US workshop on AI for health / AI for social good) | conference in Montréal; workshops typically US-hosted | Abstract **25 Jul 2026**, paper **1 Aug 2026** | Decide-pillar contextual-bandit/RL framing maps cleanly to AAAI reviewers; a scoping review fits better in an AI-for-health workshop than in the main track |
| **ML4H 2026 Symposium** (AHLI, co-located with NeurIPS) | US-hosted satellite expected | ~**Sep 2026** (follows 2025 pattern) | Preliminary-work friendly; explicitly accepts position and methodology papers; health-ML reviewer pool |
| **CSCW 2026 rolling / PACM HCI** | Salt Lake City, UT (Oct 10–14, 2026) | Rolling track opens **later in 2026**; accepted papers presented at a future CSCW | Best archival fit for the digital-therapeutic-alliance and engagement framing; journal-style rolling review suits a scoping review |

### Tier 2 — fallback targets (2027 cycle)

| Venue | Location | Expected deadline | Notes |
|---|---|---|---|
| **CHIL 2027** (AHLI Conference on Health, Inference, and Learning) | US-hosted | ~**Feb 2027** | "Impact and Society" track accepts non-empirical scoping work |
| **MLHC 2027** (Machine Learning for Healthcare) | US-hosted | ~**Apr 2027** | Clinical Abstracts track is a lower-friction path for a preliminary agenda |
| **IEEE ICHI 2027** | US-hosted | ~**Sep 2026 early-bird / Jan 2027 main** | Health-informatics audience; IEEE conference format already matches |
| **AMIA 2027 Annual Symposium** | US | ~**Mar 2027** | Informatics reviewer pool; strong fit for JITAI / adaptive-intervention framing |
| **CHI 2027 — Demos, BoF, Related Contributions** | Pittsburgh, PA (May 10–14, 2027) | **TBD** | No full-paper track in 2027, but Related Contributions and BoF are realistic for agenda-setting work |

### Tier 3 — already passed for 2026

For audit trail. These closed before this plan was written; watch
their 2027 cycles:

- CHI 2026 (Barcelona — non-US; event already happened)
- CSCW 2026 main deadline (May 2025)
- CHIL 2026 (Seattle — Feb 2026 deadline)
- MLHC 2026 (Baltimore — Apr 17, 2026 deadline)
- IEEE ICHI 2026 (Minneapolis — deadline closed)
- AMIA 2026 Annual Symposium (Dallas — Mar 2026 deadline)
- Society for Digital Mental Health 2026 (Mar 2026 deadline)

### Sequencing

1. **Now → Aug 1, 2026.** Polish `main.tex`, tighten the
   feasibility table, and submit to an **AAAI 2027** co-located
   health-AI workshop (or the main track if the reviewers' bar for
   non-empirical work is met that cycle). Parallel-prep an
   **ML4H 2026** version with health-ML framing foregrounded.
2. **Sep–Oct 2026.** If AAAI/ML4H outcomes are negative, pivot to
   **CSCW rolling** once the track opens; the paper's Act-pillar
   and digital-therapeutic-alliance material is the best match for
   that reviewer pool. Submission is journal-style, so no fixed
   deadline.
3. **Early 2027.** If still unplaced, target **CHIL 2027 Impact
   and Society track** (Feb) and **AMIA 2027** (Mar). File a
   **CHI 2027 Related Contribution** in parallel — low-cost, and
   Pittsburgh is a natural audience for the HCI framing.
4. **Ongoing.** When the Decide-first prototype and the
   micro-randomized trial called for in the agenda are actually
   executed, the empirical follow-up is a strong fit for **MLHC**,
   **CHIL Models and Methods**, or **AAAI main track** — at which
   point this scoping review becomes the cited prior work, not the
   submission.

### Out of scope for this plan

- Non-US venues (EMBC Toronto, ACII Puebla, CHI Barcelona, EMNLP
  Budapest, NeurIPS Sydney, BHI Hong Kong, AAAI Montréal venue
  itself) — excluded per author preference.
- Pay-to-publish "conference" listings with no visible peer review —
  excluded on quality grounds regardless of geography.
- Clinical-psychology society meetings (APA, SBM, ABCT) — possible
  future targets but outside this paper's computational framing.

## Relationship to the project plan

The single source of truth for "what's done, what's next" is
[`ROADMAP.md`](../../ROADMAP.md). This paper is the deliverable for
the *Research mode* row of Phase 4 #5; do not create competing plan
documents.
