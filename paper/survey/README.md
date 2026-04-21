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
implementation, no human-subjects data. That shape is a natural fit
for a **journal article type** (scoping review, viewpoint,
perspective, survey), and a poor fit for archival ML/AI conference
main tracks that expect a built system and empirical results. The
plan is therefore **journal-first**, with a conference presentation
reserved as an optional parallel track for visibility once the
journal version is under review or in press.

Status snapshot is current as of **April 2026**. Check each
journal's current author guidelines before submitting; article-type
names and turnaround windows change.

### Tier 1 — primary journal targets

| Journal | Fit | Article type | Why it fits |
|---|---|---|---|
| **JMIR Mental Health** | strongest topical fit | Review / Viewpoint | Open access, digital-mental-health reviewer pool, publishes chatbot and JITAI work routinely; a scoping review + agenda is directly in scope |
| **npj Digital Medicine** (Nature Portfolio) | highest prestige | Review Article / Perspective | Cross-disciplinary AI-in-health audience; reviews on conversational AI and adaptive interventions are in scope; ambitious but the Sense/Decide/Act framing and feasibility matrix are the right shape |

### Tier 2 — fallback journal targets

| Journal | Fit | Article type | Notes |
|---|---|---|---|
| **JMIR mHealth and uHealth** | strong | Review / Viewpoint | JMIR-family sister journal; good fit if the Decide pillar (JITAI/MRT/bandits) is foregrounded over the mental-health framing |
| **ACM Transactions on Computing for Healthcare (HEALTH)** | strong | Survey article | ACM computing audience; the feasibility-assessment table and subsystem taxonomy map naturally to a survey article; longer page budget suits the full three-pillar synthesis |

### Optional parallel conference venue (for visibility only)

A conference presentation is not the archival home for this paper,
but one US venue is a realistic low-cost parallel — talk/poster
versions do not consume the journal's novelty budget:

- **CSCW 2026 rolling / PACM HCI** — journal-style rolling review
  track opens later in 2026. If the JMIR/npj submission is in
  review when CSCW rolling opens, a shorter, HCI-framed version
  (digital-therapeutic-alliance + engagement material) is an
  option — but only if it does not create self-plagiarism risk
  with the journal version.

### Sequencing

1. **May–Jun 2026.** Tighten `main.tex` against JMIR author
   guidelines (abstract structure, PRISMA-ScR checklist appendix,
   reporting of search strategy). Submit to **JMIR Mental Health**
   as the primary target — topical fit is strongest and turnaround
   is typically 6–12 weeks to first decision.
2. **If JMIR Mental Health rejects or desk-rejects.** Revise once
   based on reviewer comments (or scope-fit comments), then submit
   to **npj Digital Medicine** as a Review/Perspective. Expect a
   higher desk-rejection rate; have an npj-formatted version
   pre-drafted before the JMIR decision arrives.
3. **If npj Digital Medicine rejects.** Pivot to **ACM TOCH** for
   the survey framing (longer, more technical, computing-audience)
   or **JMIR mHealth and uHealth** for the mHealth framing — pick
   whichever reviewer comments make more defensible.
4. **Ongoing.** When the Decide-first prototype and micro-randomized
   trial called for in the agenda are actually executed, the
   empirical follow-up is a strong fit for **npj Digital Medicine
   Original Research**, **JAMA Network Open**, or **NEJM AI** — at
   which point this scoping review becomes the cited prior work,
   not the submission.

### Out of scope for this plan

- Conference main tracks that expect a built system (CHI, CSCW
  main deadline, AAAI main, MLHC, CHIL, ICHI) — wrong shape for a
  scoping review + agenda; saved for the empirical follow-up paper.
- Pay-to-publish journals and predatory "MDPI-adjacent" titles —
  excluded on quality grounds.
- Clinical-psychology society journals (e.g., Behaviour Research
  and Therapy, JMIR Human Factors for qualitative framing) —
  possible future targets but farther from this paper's
  computational framing.

## Relationship to the project plan

The single source of truth for "what's done, what's next" is
[`ROADMAP.md`](../../ROADMAP.md). This paper is the deliverable for
the *Research mode* row of Phase 4 #5; do not create competing plan
documents.
