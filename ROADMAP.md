# Willow — Roadmap

> **The single source of truth for "what's done, what's next, who does it."**
> If this file and another doc disagree, this file wins.

---

## Where we are right now

**Phase 0 — Scaffold complete and deployed. ✅**

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
| Documentation (README, SME_GUIDE, DEVELOPER_GUIDE, docs/01–09) | ✅ |

**Production URL:** https://willow-memari-majids-projects.vercel.app
**SME dashboard:** https://willow-memari-majids-projects.vercel.app/sme
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

> Detailed step-by-step instructions for each task: see [`SME_GUIDE.md`](./SME_GUIDE.md).

### Definition of done

- The readiness bar at `/sme` is green ("11 / 11 ready").
- The draft banner no longer appears on `/chat`.
- All test scenarios in `SME_GUIDE.md` ("Test scenarios you should
  always run") pass.

---

## Phase 2 — Pre-launch validation

**Goal:** confirm Willow behaves the way the SME intends across a
representative range of conversations.
**Owner:** SME (with developer pairing).
**Estimated time:** 2–3 days.

Both roles work from [`docs/09-collaboration.md`](./docs/09-collaboration.md).

| Step | Owner | What |
|---|---|---|
| 1 | SME + Dev | Pairing session: SME edits, Dev reloads — work through every test scenario in `SME_GUIDE.md` |
| 2 | Dev | Open the production AI Gateway dashboard, set a monthly budget alert and a per-user rate limit (see `docs/07-deploy-to-vercel.md`) |
| 3 | SME | Sign off the **going-live checklist** in `docs/09-collaboration.md` |
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

- SME and developer review docs/08-extending.md together — pick at
  most one new feature to add per month, working from the priority
  list in this file (next section)

---

## Phase 4 — Extensions backlog

**Goal:** a single, ordered list of "the next thing we add". Pick from
the top, ship it, cross it off, repeat. Don't try to do them in
parallel.

| Priority | Feature | Why now? | Owner | Reference |
|---|---|---|---|---|
| 1 | **Authentication** (Clerk via Marketplace) | Required before per-user features and before storing anything personal | Dev | [`docs/08-extending.md` § Authentication](./docs/08-extending.md) |
| 2 | **Per-user rate limit + budget caps** | Once auth ships, prevents abuse and runaway spend | Dev | [`docs/08-extending.md` § Per-user rate limiting](./docs/08-extending.md) |
| 3 | **Better safety detection** (moderation API + cheap classifier) | Reduces missed signals beyond keyword matching | Dev + SME | [`docs/08-extending.md` § Better safety](./docs/08-extending.md) |
| 4 | **Conversation persistence** (Neon Postgres) | Only after auth + privacy review with the SME | Dev | [`docs/08-extending.md` § Persistence](./docs/08-extending.md) |
| 5 | **AI Elements rich UI** (reasoning, code blocks, suggestions) | Cosmetic + UX polish | Dev | [`docs/08-extending.md` § AI Elements](./docs/08-extending.md) |
| 6 | **Multi-language content** (`content/en/`, `content/es/`, …) | Once a non-English audience is identified | SME + Dev | [`docs/08-extending.md` § Multi-language](./docs/08-extending.md) |
| 7 | **Tests** (safety detector unit tests, prompt snapshot tests, E2E) | Before scaling team or shipping fast | Dev | [`docs/08-extending.md` § Tests](./docs/08-extending.md) |
| 8 | **Observability** (Datadog log drain, OTel traces) | Once volume justifies it | Dev | [`docs/08-extending.md` § Observability](./docs/08-extending.md) |
| 9 | **CMS instead of GitHub edits** | Only if the SME asks for a friendlier editor | Dev | [`docs/08-extending.md` § Letting the SME edit from a UI](./docs/08-extending.md) |

> **Rule of thumb:** never start item N+1 until item N is in
> production with the SME's sign-off.

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
