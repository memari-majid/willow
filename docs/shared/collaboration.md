# How the SME and Developer Work Together

This document is the operating manual for the two-person team that
runs Willow. Both should read it once and refer back when something
doesn't have a clear answer.

---

## The two roles

| | SME | Developer |
|---|---|---|
| **Owns** | What Willow says and decides | The plumbing that lets Willow do it |
| **Edits** | Files in `content/` (Markdown) | Files in `src/` (TypeScript) and ops |
| **Decides** | Framework, persona, safety wording, evidence, exercises | Model choice, infra, deploy strategy |
| **Tests on** | `/sme` dashboard | `npm run dev` + production preview URLs |
| **Signals readiness via** | All-green readiness bar on `/sme` | Green CI on the PR + green production deploy |
| **Escalates to** | The developer (for plumbing) | The SME (for any clinical decision) |

---

## The change cycle

Every change to the live product goes through one of these four
paths. **Pick the smallest one that fits.**

### Path A — SME content edit (most common)

```
SME edits content/*.md  →  push (or PR)  →  Vercel auto-deploys  →  done
```

If the SME is comfortable with GitHub-on-the-web:
1. Open the file in github.com.
2. Click the pencil, edit, commit directly to `master` (small change)
   or open a PR (anything they want a second pair of eyes on).
3. Vercel rebuilds in ~60 seconds.
4. Verify on production `/sme` and `/chat`.

If the SME prefers to email/Slack the developer the change:
1. Send the new file content (or the diff) to the developer.
2. Developer pastes it into the file, commits with the SME named in
   the message: `git commit -m "content: update persona (SME: Dr. Y)"`.
3. Developer pushes; Vercel deploys.

### Path B — Developer plumbing change

```
Dev branch  →  PR with preview URL  →  SME reviews on preview  →  merge  →  prod deploys
```

1. Branch from `master`: `git checkout -b dev/feature-name`.
2. Make the change. Run `npm run build`.
3. Push and open a PR. Vercel posts a preview URL.
4. **Always tag the SME** if the change affects what end users see
   (UI, copy outside `content/`, anything in safety code).
5. SME confirms on the preview, dev merges, production deploys.

### Path C — Joint clinical+plumbing change (e.g. new tool)

Pair on it.
1. Schedule 60–90 min together.
2. Dev runs `npm run dev` locally, screen-shares.
3. Pair through: dev wires the tool, SME writes the persona/rules
   sentence describing when the bot uses it.
4. Both author the PR commit message.
5. SME reviews preview, dev merges.

### Path D — Backlog item from Phase 4

See [`ROADMAP.md`](../../ROADMAP.md) Phase 4. **Pull from the top of the
queue, not the middle.** Each item has an owner field; that person
drives, the other reviews.

---

## Pairing patterns

The single highest-leverage thing a SME and developer can do
together is sit down for 45 minutes with `npm run dev` running and
the SME dictating. You can fix two days of asynchronous back-and-forth
in one session.

### Setup
- Dev: `npm run dev`, share screen, browser at `/sme` on one side
  and the file editor on the other.
- SME: focus on what feels off in real conversations, not on
  hypothetical edge cases.

### Loop
1. SME types a test message into `/sme`'s test chat.
2. Both read Willow's reply.
3. SME says "I want this differently because …"
4. Dev opens the relevant `content/` file.
5. SME dictates the new wording.
6. Dev saves.
7. SME refreshes `/sme` and tests again.
8. Repeat until it feels right.

### Wrap-up
- Dev commits with both names: `Co-authored-by:`.
- Push to a branch + open a PR for asynchronous review, OR push
  directly to master if the changes are small and both reviewed.

---

## The going-live checklist (Phase 2 sign-off)

Both roles complete every box together before the first real user
hits `/chat`.

### Content readiness (SME)
- [ ] `/sme` readiness bar is **green** ("11 / 11 ready").
- [ ] Draft banner no longer appears on `/chat`.
- [ ] All eight test scenarios in `docs/sme/GUIDE.md` produce expected
      Willow behavior on production.
- [ ] `content/safety/crisis-resources.md` lists the **right**
      hotlines for the actual user audience (not the global
      defaults).
- [ ] `content/evidence/references.md` documents the source of every
      framework, skill, technique, and the safety protocol.

### Plumbing readiness (Developer)
- [ ] AI Gateway monthly **budget alert** is set.
- [ ] AI Gateway **rate limit per user** is set (even if there's no
      auth yet — set it for IP-based throttling).
- [ ] `npm run build` is green on `master`.
- [ ] No `[SME:` markers in any `REQUIRED_SME_FILES` (this is
      already enforced by the readiness bar — double-check on prod).
- [ ] Production URL has been smoke-tested with each test scenario.
- [ ] A rollback dry-run has been done at least once
      (`vercel rollback` then `vercel promote`).

### Communication
- [ ] Crisis-content reviewer (clinical lead, ethics board, or
      equivalent — whoever the SME's organization requires) has
      signed off in writing.
- [ ] A user-facing privacy / disclaimer note is published on the
      landing page or in onboarding flow (the SME chose what's
      required in `safety/disclaimers.md`).
- [ ] An on-call rotation or single point of contact for both roles
      is established.

When every box is checked: tag the release.

```bash
git tag v1.0.0 -m "Phase 2 sign-off — first real users"
git push --tags
```

---

## On-call & escalation

### Symptom → who's on it

| Symptom | First responder |
|---|---|
| Production site is down | Developer |
| `POST /api/chat` returning 5xx | Developer |
| AI Gateway budget alert fired | Developer (notify SME) |
| Bot replies are off-tone or break a rule | SME |
| Bot recommends something it shouldn't | SME (then both — possible code-side guard) |
| Crisis banner not appearing for an obvious case | Both — keyword update (SME) and possibly a smarter detector (Dev) |
| User reports a privacy concern | Both — SME drafts the response, Dev reviews any code changes |

### Out-of-hours

- For **safety-critical** issues (a live user got harmful content,
  a vulnerability), do not wait. Roll back: `vercel rollback`. Then
  message both parties.
- For **everything else**, leave a note in GitHub Issues. Pick it up
  the next working day.

---

## PR template

Drop this into `.github/pull_request_template.md` if you want it
auto-filled (do this when you have time):

```markdown
## What & why
<one paragraph>

## Type of change
- [ ] SME content edit (no code change)
- [ ] Plumbing change
- [ ] Joint (touches both)

## Files affected
- `content/...`
- `src/...`

## SME involvement
- [ ] SME requested this change
- [ ] SME reviewed the preview URL
- [ ] N/A (pure plumbing)

## Test plan
- [ ] `npm run build` is green
- [ ] Verified on preview URL
- [ ] All 8 SME test scenarios still pass (link to /sme on preview)

## Rollback plan
<one sentence>
```

---

## Change-request template (when the SME asks for a code change)

Open a GitHub issue with this shape so the developer has everything
they need:

```markdown
## What I want Willow to do (or stop doing)
<one paragraph in plain English>

## Why
<the clinical or product reason — for the developer's context>

## Example conversation
**User:** "..."
**Willow currently:** "..."
**Willow should:** "..."

## What I've tried in content/
<which files I edited and why it wasn't enough>

## How urgent
[ ] Blocker — pulling rollback now if not addressed
[ ] Important — needed within the week
[ ] Nice-to-have — when capacity allows
```

---

## Anti-patterns to avoid

- **Developer writes clinical content because it was "faster."**
  Stop. Add a `[SME: …]` template instead. Speed isn't a clinical
  decision-making criterion.
- **SME asks for a behavior change without reading any of the bot's
  recent replies.** The fix is almost always to edit the
  conversation that just happened. Find the file, edit the rule,
  re-test.
- **Either party batches up a week's worth of changes into one giant
  PR.** Small, frequent changes are safer and easier to roll back.
- **Skipping the going-live checklist because "we tested in dev."**
  Production has different env vars, different OIDC tokens,
  different latency. Check on production every time.
- **Treating the AI Gateway dashboard as optional.** It's the
  source of truth for cost and traffic. Look at it weekly.

---

## When this document is wrong

If you find this doc disagrees with how you're actually working, the
doc is wrong — fix it. One PR per disagreement, in the same week
you noticed.
