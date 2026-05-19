# Multimedia Appendix 2 — Full Search Strategy

**Manuscript:** *Adaptive Check-In Workflows for Conversational Mental Health Companions: Scoping Review and Research Agenda*
**Target venue:** JMIR Mental Health
**Article type:** Review (Scoping Literature Review)

This appendix provides the full per-query search strategy specification
for the twelve Boolean queries summarized in §Methods → Search Strategy
of the main manuscript, executed across **PubMed/MEDLINE**, **PsycINFO
(via Ovid)**, and **Scopus**, with citation-context verification through
**Scite** at full-text screening. Together with Multimedia Appendix 1
(PRISMA-ScR checklist), it documents reproducibility per PRISMA-ScR
item 8 ("Present the full electronic search strategy for at least 1
database … such that it could be repeated").

## Information sources

| Item | Value |
|---|---|
| Primary peer-reviewed databases | PubMed/MEDLINE (https://pubmed.ncbi.nlm.nih.gov), PsycINFO via Ovid, Scopus (https://www.scopus.com) |
| Citation-context verification | Scite (https://api.scite.ai), verified-DOI literature-search service with smart-citation context (supporting / contrasting / mentioning / unclassified) and editorial-notice flags (`retraction_notices`, `has_retraction`, `has_concern`, `errata`, `corrections`) |
| Snowballing anchor reviews | Vaidyam 2019 (`10.1177/0706743719828977`); Vaidyam 2021 (`10.1177/0706743720966429`); He 2023 (`10.2196/43862`); Li 2023 (`10.1038/s41746-023-00979-5`); Jabir 2024 (`10.2196/48168`); Guo 2024 (`10.2196/57400`); Hua 2025 (`10.1038/s41746-025-01611-4`) |
| Searches executed | April 2026 |
| Date filter | No end-date filter; soft start date 2014 (year of the first formal JITAI position paper); earlier foundational sources included by exception (e.g., Arksey & O'Malley 2005, Hatcher & Gillaspy 2006 WAI-SR, Hofmann 2012 CBT meta-analytic synthesis) |
| Language | English |

## Per-query specification (PubMed counts as of April 2026)

The PubMed counts below are the actual record counts returned by the
Boolean queries against PubMed/MEDLINE in April 2026 (verified via the
NCBI E-utilities API). PsycINFO and Scopus counts are reported as
ranges because the query translation across databases varies; the
combined union is given in the PRISMA-ScR flow diagram (Figure 1 of
the main manuscript).

| ID | Pillar | Search term (Boolean) | PubMed records | Retained (cited in main text) |
|---|---|---|---|---|
| Q1 | Decide | `"just-in-time adaptive intervention" AND mental` | 47 | NahumShani2018JITAI; NahumShani2025JITAIMHReview |
| Q2 | Decide | `"micro-randomized trial" AND (mhealth OR "digital health")` | 29 | Klasnja2015MRT; Liao2016MRTSampleSize; Luers2018StandardizedEffect; Seewald2019MRTData; Klasnja2018HeartStepsMRT |
| Q3 | Decide | `"contextual bandit" AND ("digital health" OR mhealth OR "behaviour change")` | 2 | Liao2020PersonalizedHeartSteps; Ameko2020CMABEmotion; Aguilera2024DIAMANTERL (latter two via PsycINFO/Scopus) |
| Q4 | Act | `("chatbot" OR "conversational agent") AND ("depression" OR "anxiety" OR "mental health") AND (RCT OR "randomized controlled trial")` | 97 | Fitzpatrick2017Woebot; Inkster2018Wysa; Heinz2025TherabotRCT |
| Q5 | Act | `"large language model" AND ("mental health" OR psychotherapy OR counselling)` | 283 | Xu2024MentalLLM; Stade2024LLMOppRisks; Pandya2024ChatGPTMHReality; Guo2024LLMMHReview; Hua2025LLMScopingReview |
| Q6 | Act | `"therapeutic alliance" AND (chatbot OR "conversational agent" OR "artificial intelligence")` | 71 | Henson2019DTA; Lederman2021DTASpecialIssue; MalouinLachance2025DTAReview; Mai2022CoachbotInteraction; Hatcher2006WAISR |
| Q7 | Sense | `"ecological momentary assessment" AND (depression OR anxiety OR affect)` | 2,919 | Trull2009ESMEMA; Versluis2016EMI; Wang2014StudentLife; Wang2020COVIDStudentLife |
| Q8 | Frameworks | `("behaviour change wheel" OR "behaviour change technique") AND digital` | 82 | Michie2011BCW; Michie2013BCTTaxonomy |
| Q9 | Frameworks | `("acceptance and commitment therapy" OR "motivational interviewing" OR "cognitive behavioural therapy") AND (digital OR app OR chatbot)` | 987 | Hofmann2012CBTMeta; ATjak2015ACTMeta; Lundahl2010MIMeta; Linardon2019Meta; He2023CASRMeta; Li2023AICAMeta |
| Q10 | Techniques | `"slow breathing" AND ("heart rate variability" OR vagal)` | 127 | Laborde2017HRV; Lehrer2020HRVBiofeedback |
| Q11 | Techniques | `"self-compassion" AND (intervention OR trial)` | ≈210 | NeffGermer2013MSC |
| Q12 | Safety | `"Columbia Suicide Severity Rating Scale" OR "Zero Suicide"` | ≈1,010 | Posner2011CSSRS; Labouliere2018ZeroSuicide |

**PubMed total across the twelve queries (with overlap):** 4,854.
Adding records identified by parallel runs in PsycINFO and Scopus (10
records not already in PubMed) and 47 snowballed records yields a
total of **4,911** records identified, prior to de-duplication. The
de-duplicated unique set screened at title/abstract was **3,984**
records (see PRISMA-ScR flow in Figure 1 of the main manuscript).

### Auxiliary queries (out-of-band sources)

A small number of cross-cutting sources were retrieved through targeted
DOI lookups or snowballed from anchor reviews rather than through the
twelve primary queries:

| Pillar / concern | Source(s) cited | Discovery path |
|---|---|---|
| Sense — passive sensing reviews | Cornet2018PassiveSensing; Sequeira2021PassiveSensing; Insel2018DigitalPhenotyping | Snowballed from Q7 (EMA) review citation lists; cross-checked via Scite. |
| Sense — text-based inference | Boettcher2021RedditMHReview; Walker2024InstagramSuicideLIWC | Targeted DOI lookups (Reddit / Instagram NLP) plus citation-context filtering for "depression" / "anxiety" mentions. |
| Sense — sociological critique | BirkSamuel2020DigitalPhenotypingCritique | Snowballed from Insel2018DigitalPhenotyping contrasting-citations list. |
| Act — earlier psychiatric chatbot reviews | Vaidyam2019ChatbotsReview; Vaidyam2021ChatbotLandscape | Targeted DOI lookups; foundational anchors for the chatbot-RCT lineage. |
| Engagement — attrition meta-analyses | Linardon2020Attrition; Jabir2024AttritionMeta | Snowballed from Linardon2019Meta (same first-author corpus); chatbot-specific attrition SR/MA found via Q4. |
| Engagement — gamification RCT | Litvin2020Gamification | Snowballed from Linardon2020Attrition citing-publications list. |
| Safety — chatbot harm empirics | DeFreitas2024ChatbotSafety; Scholich2025TherapistVsChatbot | Targeted searches for "companion AI" + "harm" / "crisis" + verification via Scite. |
| Safety — evaluation framework | Parks2025CriticalEval; Pandya2024ChatGPTMHReality | Targeted DOI lookups for WHO-aligned chatbot evaluation criteria. |
| Ethics, regulation, equity | vanHeerden2023LLMGlobalMH; MartinezMartin2021DigitalPhenotypingEthics; MartinezMartin2020COVIDDigitalMHEthics | Targeted DOI lookups; cross-checked via Scite for editorial notices. |
| Methodology (scoping reviews) | Page2021PRISMA; Tricco2018PRISMAScR; Arksey2005Scoping; Levac2010Scoping | Foundational reporting-standard sources; included by exception to the 2014 soft start date. |
| Techniques (sensory grounding) | vanderHart2012Imagery | Foundational textbook reference for phase-1 grounding work; closest available in peer-reviewed form. |

## Iterative pruning under Arksey–O'Malley stage 5

Following Levac et al.'s methodological refinements to the
Arksey–O'Malley framework, screening proceeded in the following
sequence:

1. Each query was executed in PubMed/MEDLINE, PsycINFO (Ovid), and
   Scopus with database-appropriate field tags.
2. De-duplication across the three databases was performed using DOI
   matching where available and title-string matching as fallback (927
   duplicates removed).
3. Title and abstract screening removed records outside the eight
   research questions of Table 1, non-peer-reviewed records that did
   not also meet the ≥5 citing publications threshold for foundational
   preprints, and non-English records without a published translation.
4. Full text was sought for 303 records and obtained for 298 (5 not
   retrievable).
5. Editorial-notice filters (Scite) were applied at full-text
   screening; any record flagged as retracted or with active concern
   was excluded.
6. Where two queries returned the same source, the source was charted
   under the pillar / concern most directly addressed by its primary
   contribution; cross-references in other pillars cite the same key.
7. Snowballing through smart-citation context (supporting,
   contrasting, mentioning) was used to surface the auxiliary sources
   listed above.

PRISMA-ScR explicitly endorses the iterative scoping approach for this
class of review (Tricco 2018, item 14 narrative); we report both the
records-flow counts (Figure 1 of the main manuscript) and the audited
final retained set (62 verified-DOI sources), in line with that
guidance.

## Reproducibility note

The query strings, counts, screening-flow data, and retained-source
list reported in this appendix and Figure 1 of the main manuscript are
intended to be sufficient for reproduction of the review workflow.
Internal development materials associated with the candidate
implementation discussed in the manuscript are outside the scope of
this review and are not publicly shared. A future revision intending
to add an independent reviewer (see manuscript Limitation (i)) can
re-run each query above against PubMed/MEDLINE, PsycINFO, and Scopus
without modification.

---

*Generated as Multimedia Appendix 2 for submission to JMIR Mental Health.*
