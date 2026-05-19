# Willow — Roadmap

> **The single source of truth for "what's done, what's next, who does it."**
> If this file and another doc disagree, this file wins.

---

## Where we are right now

**Phase 0 — Scaffold complete and deployed. ✅**  
**Phase 4 (CBT Companion)** — core app plumbing is in-tree (Neon, Auth.js, safety, RAG, tools). See **Phase 4** later in this file for the operational checklist.

| | Status |
|---|---|
| Next.js 16 + AI SDK v6 + AI Gateway plumbing | ✅ |
| Live `/`, `/chat`, `/sme`, `/api/chat` routes on Vercel | ✅ |
| GitHub repo with auto-deploy on push to `master` | ✅ |
| Content scaffold (`content/method/`, `content/evidence/`, `content/check-ins/`) | ✅ |
| Starter examples for persona, tone, safety, techniques | ✅ |
| `[SME: …]` placeholder convention + dashboard counters | ✅ |
| Crisis keyword detector + UI banner | ✅ |
| Draft banner on `/chat` until required SME files are complete | ✅ |
| SME dashboard sign-in (placeholder shared credential, env-overridable) | ✅ |
| Documentation (README, SME_GUIDE, DEVELOPER_GUIDE, docs/01–09) | ✅ |

**Production URL:** https://willowspace.dev
**SME dashboard:** https://willowspace.dev/sme
**Repo:** https://github.com/memari-majid/willow

---

## What blocks the next phase

The bot is running on starter content the developer wrote. It cannot
go to real users until the SME has authored the **clinical method**
and reviewed the **safety** content for their audience. That's
[Phase 1](#phase-1--sme-onboarding-author-the-method).

---

## Phase 1 — SME Onboarding (author the method)

**Goal:** the readiness bar on `/sme` turns green.
**Owner:** SME (developer is on standby for questions).
**Estimated time:** 1–2 working weeks at a comfortable pace.

The recommended order — each step builds on the previous one:

### Week 1 — define what Willow *is*

| Day | File | What you decide |
|---|---|---|
| 1 | `content/method/01-approach.md` | Which framework(s)? Scope of practice? Required disclosures? |
| 2 | `content/method/02-core-skills.md` | Which conversational micro-skills, with example replies? |
| 3 | `content/method/03-conversation-flow.md` | Phases of a session — opening, exploration, intervention, close |
| 4 | `content/method/04-decision-rules.md` | Five to ten "if X then Y" rules |
| 5 | `content/evidence/references.md` | Citation for each framework, skill, technique, safety protocol |

### Week 2 — refine and review

| Day | File | What you do |
|---|---|---|
| 6 | `content/persona.md` | Rewrite to match your voice |
| 7 | `content/tone-style-guide.md` | Replace example replies with ones you'd actually want |
| 8 | `content/safety/disclaimers.md` + `boundaries.md` | Confirm the wording matches your scope |
| 9 | `content/safety/crisis-keywords.md` + `crisis-resources.md` | **Localize for your audience** |
| 10 | `content/techniques/*.md` | Edit, replace, or delete each starter; add the citation in `references.md` |
| 11 | `content/conversation-starters.md` | Replace with starters in your audience's voice |
| 12 | `content/evidence/glossary.md` | Define every clinical term Willow may use (optional but recommended) |

> Detailed step-by-step instructions for each task: see [`docs/sme/GUIDE.md`](./sme/GUIDE.md).

### Definition of done

- The readiness bar at `/sme` is green ("11 / 11 ready").
- The draft banner no longer appears on `/chat`.
- All test scenarios in `docs/sme/GUIDE.md` ("Test scenarios you should
  always run") pass.

---

## Phase 2 — Pre-launch validation

**Goal:** confirm Willow behaves the way the SME intends across a
representative range of conversations.
**Owner:** SME (with developer pairing).
**Estimated time:** 2–3 days.

Both roles work from [`docs/shared/collaboration.md`](./shared/collaboration.md).

| Step | Owner | What |
|---|---|---|
| 1 | SME + Dev | Pairing session: SME edits, Dev reloads — work through every test scenario in `docs/sme/GUIDE.md` |
| 2 | Dev | Open the production AI Gateway dashboard, set a monthly budget alert and a per-user rate limit (see `docs/developer/deploy-to-vercel.md`) |
| 3 | SME | Sign off the **going-live checklist** in `docs/shared/collaboration.md` |
| 4 | Dev | Tag the release: `git tag v1.0.0 && git push --tags` |

---

## Phase 3 — Ongoing operation

**Goal:** keep Willow current, safe, and useful as the SME learns
from real conversations.
**Owners:** SME for content, developer for plumbing.

### SME weekly cadence (≈30 minutes)

- Review any recent conversation samples the developer shares
- Decide whether any decision rule needs an addition or a tweak
- Edit the relevant `content/` files
- Ask the developer to deploy

### Developer weekly cadence (≈30 minutes)

- Pull the SME's edits, run `npm run build` locally, push
- Confirm the production `/sme` readiness bar is still green
- Skim AI Gateway logs for any 4xx / 5xx
- Skim AI Gateway spend; adjust budget alerts if needed

### Monthly

- SME and developer review docs/developer/extending.md together — pick at
  most one new feature to add per month, working from the priority
  list in this file (next section)

---

## Phase 4 — CBT Companion (in progress on `willowspace.dev`)

**Architecture:** [`cbt/build-spec.md`](./cbt/build-spec.md)  
**Adaptation notes:** [`cbt/decisions.md`](./cbt/decisions.md) · **Safety:** [`cbt/safety.md`](./cbt/safety.md) · **Eval:** [`cbt/eval.md`](./cbt/eval.md)

### Done in-tree (engineering)

| Step | Work | Status |
|---|---|---|
| 1 | Drizzle + Neon schema, migrations, `src/lib/db/*` | ✅ |
| 2 | Auth.js v5 + credentials, onboarding, `/chat` gated | ✅ |
| 3 | Persisted threads `/chat/[conversationId]`, `/api/conversations` | ✅ |
| 4 | CBT system prompt in `content/`, SME preview unchanged | ✅ |
| 5 | Two-stage safety + crisis bypass + `safety_events` | ✅ |
| 6 | RAG retrieve + rerank + `scripts/ingest.ts` | ✅ (242 chunks on Neon; `/sources` Reference book = DB chunk count, not local PDF) |
| 7 | Structured CBT tools + chat tool “widgets” | ✅ |
| 8 | Longitudinal context block in prompt (`prompt-builder.ts`) | ✅ |
| 9 | `/admin/safety` review queue | ✅ |
| 10 | Vitest safety/tool/RAG/knowledge-sources tests + CI workflow | ✅ |
| 11 | **Personalization v1** — prefs, semantic memory, summaries, persona overlays, `/settings/*` | ✅ |
| 12 | **Chat performance** — Haiku default, prompt caching, conditional RAG, gated pref signal, 3 tool steps | ✅ |
| 13 | **Conversational follow-ups** — removed reply-chip UX; assistant ends each turn with one grounded question | ✅ |
| 14 | **Multi-conversation UI** — sidebar, new chat, hybrid trim, auto-extract cross-thread memories | ✅ |

**Personalization docs:** [`cbt/memory.md`](./cbt/memory.md) · Feature flag: `PERSONALIZATION_ENABLED` (default on; set `false` to disable).

### Still SME / ops dependent

- [ ] SME completes Phase 1 content bar (method + safety localization) for production voice.
- [x] Neon provisioned (Vercel Marketplace `willow-db`), migrations applied, ingest run (`242` chunks).
- [x] Core env on Vercel: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`. Optional: `VOYAGE_API_KEY` (rerank), Upstash KV, Blob.
- [ ] Expand [`tests/safety-regression.spec.ts`](./tests/safety-regression.spec.ts) toward the full regression list in the build spec.

**Reuse guide for future chatbots:** [`docs/developer/agent-chatbot-playbook.md`](./developer/agent-chatbot-playbook.md) · **Stack + costs:** [`docs/developer/technology-stack-and-costs.md`](./developer/technology-stack-and-costs.md)

### Later backlog (post–CBT v1)

| Priority | Feature | Owner | Reference |
|---|---|---|---|
| 1 | **Natural AI voice (TTS read-aloud)** | Dev | [`developer/technology-stack-and-costs.md`](./developer/technology-stack-and-costs.md) § Voice |
| 2 | R&D / Research mode | Dev + SME | [`docs/developer/research-mode.md`](./developer/research-mode.md) |
| 3 | AI Elements / richer transcript UX | Dev | [`docs/developer/extending.md`](./developer/extending.md) |
| 4 | Multi-language `content/` | SME + Dev | extending.md |
| 5 | Optional Clerk / IdP if institution requires it | Dev | [`docs/cbt/decisions.md`](./cbt/decisions.md) |
| 6 | CMS instead of GitHub edits | Dev | extending.md |

---

## Phase 5 — Decommission or hand-off

If the project ever winds down, follow this checklist:

- [ ] Notify users in the chat (one week before)
- [ ] Disable the `/chat` route (redirect to a static page with crisis resources)
- [ ] Pause Vercel auto-deploys
- [ ] Export AI Gateway logs (compliance retention)
- [ ] Keep the GitHub repo public for archive
- [ ] Update this ROADMAP with end-of-life notice

---

## How to use this file

- **SME:** start at *Phase 1 — Week 1* and work down. Cross items
  off as you finish them. Ask the developer for help when something
  is unclear.
- **Developer:** Phase 1 needs almost nothing from you. Stay on
  standby for SME questions, then drive Phases 2 and 3. Phase 4 is
  your queue — pick the top item when capacity allows.
- **Anyone reading later:** the most recent section that still has
  unchecked items is "where the project is right now".

When a phase completes, update the ✅ markers and check items off in
this file in the same commit. **One plan, kept up to date.**
