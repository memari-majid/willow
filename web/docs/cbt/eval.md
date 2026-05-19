# Evaluation — safety + CBT fidelity

## Automated tests (Vitest)

```bash
npm test
```

- **`tests/safety-keywords.spec.ts`** — unit checks for Stage A regex prescreen.
- **`tests/safety-regression.spec.ts`** — small locked set of red/green strings; **expand** toward the full regression suite described in the build spec (manipulation attempts, benign mental-health language).
- **`tests/cbt-tools-schema.spec.ts`** — Zod-shape smoke tests for tool inputs (no DB).
- **`tests/rag-format.spec.ts`** — prompt formatting for retrieved chunks.
- **`tests/personalization.spec.ts`** — PII guard, preference signal schema, persona overlay paths.
- **`tests/memory-recall.spec.ts`** — memory tool input shapes + recall threshold constant.
- **`tests/chat-performance.spec.ts`** — conditional RAG gating + preference-signal regex prescreen (no DB).
- **`tests/knowledge-sources.spec.ts`** — `/sources` status: Reference book Ready from `document_chunks` count, not local PDF.
- **`tests/responsive-chat.spec.ts`** — scroll-lock helper for mobile drawer.

**Tone regression (planned):** Section 9 of `content/cbt_companion_tone_and_persona.md` defines a five-axis rubric (warmth, directness, specificity, in-character, skill-orientation). Expand `tests/safety-regression.spec.ts` or add `tests/tone-regression.spec.ts` with fixed dialogues and an LLM-as-judge harness; fail CI on scores below threshold.

## Personalization manual scenarios

Run with `PERSONALIZATION_ENABLED` on (default):

1. **Name recall** — tell Willow your preferred name; start a new thread; confirm `<user_longitudinal_context>` identity block includes it.
2. **Preference applied next turn** — say “be more direct”; next reply should acknowledge and use shorter, clearer sentences.
3. **Forgotten on request** — ask Willow to remember a fact, then “forget that” via tool or Settings → Memory delete; confirm it no longer appears in context.
4. **Summary after 12 msgs** — exceed `SUMMARY_MESSAGE_THRESHOLD` (12) in one thread; check `conversation_summaries` row and rolling summary in prompt.
5. **Persona overlay** — user with `ageBand: 18_24` gets `content/persona/age_band/18_24.md` appended to system prompt.

## Follow-up question style (manual)

Run after any prompt or UX change to chat behavior:

1. **Single question** — send "I had a hard day" → assistant reply ends with exactly one specific question; no numbered options or "you could say…" lists.
2. **No reply chips** — after the assistant finishes, the UI shows no "Or reply with" chips (empty-state starters on a new thread are fine).
3. **Technique grounding** — ask "Can you walk me through a thought record?" → assistant asks one situation-focused question aligned with the book's first step, not a multi-item questionnaire.
4. **Natural elicitation** — mid thought-record flow, assistant asks for the next field (e.g. automatic thought, 0–10 rating) one at a time, referencing what the user already shared.

## Multi-conversation (manual)

1. **New chat** — sidebar **New chat** → empty state with starter chips; previous thread unchanged in sidebar.
2. **Switch threads** — open an older conversation from sidebar; messages match that thread only.
3. **Cross-thread recall** — in thread A say "My name is Sam and I'm a teacher"; start **New chat**; ask "what do you remember about me?" — reply references name/job (via auto-extract or `remember_fact`).
4. **Auto-title** — after the first exchange in a new thread, sidebar title updates from "New conversation" to a topic-specific name (like ChatGPT).

## Mobile responsive (manual)

Test at **360px**, **768px**, and **1280px** widths (DevTools device toolbar):

1. **Header** — at 360px: hamburger + truncated title only; no horizontal scroll. At 768px+: Settings, Library, How it works, Sign out in header.
2. **Drawer** — tap hamburger → sidebar opens; backdrop tap or Escape closes it; background does not scroll behind drawer.
3. **Sidebar footer** — at 360px: Settings, Library, and How it works reachable from drawer footer (not header).
4. **Touch actions** — rename/delete icons visible without hover on touch; tap rename opens dialog (not `window.prompt`).
5. **Composer** — textarea uses readable size; send button is easy to tap; no page zoom on focus (iOS).
6. **Long URL** — send a message containing a long URL → text wraps inside the bubble without horizontal overflow.

## Guide library (manual)

After deploy, open **`/wiki`** (nav: **Library**):

1. **Hub** — topics grouped by concern, concept, technique, thinking pattern, safety; **Draft** badges visible.
2. **Hybrid search** — `/wiki?q=grounding` shows matching topics and book passages (when RAG configured).
3. **Topic page** — review badge, related passages, Try with Willow CTA (except safety).
4. **Chat guide links** — when Willow mentions e.g. "thought record", assistant bubble shows **Guide:** chip linking to `/wiki/techniques/thought-record`.
5. **Nav** — Library and How it works on home footer, chat header, sidebar footer.

## How Willow works (manual)

After deploy or ingest changes, open **`/sources`** (nav: **How it works**; title: "What guides Willow's replies"):

1. **Protocol + tone** — both rows **Ready** with character counts; each card links to a detail page (`/sources/cbt-protocol`, `/sources/communication-style`).
2. **Reference book** — **Ready** when indexed passages exist for the Sokol & Fox guide; detail shows passage count — not filesystem PDF checks on Vercel.
3. **RAG retrieval** — **Ready** with total chunk count and Voyage rerank when `VOYAGE_API_KEY` is set.
4. **Safety** — card links to `/sources/safety-guardrails` with prescreen and boundary detail.
5. **Detail pages** — each layer has expanded sections (techniques, anti-patterns, retrieval pipeline, crisis flow); no internal file names on user-facing copy.
6. **Consistency** — Reference book chunk count should match RAG row when ingest is complete.

See [`../developer/agent-chatbot-playbook.md`](../developer/agent-chatbot-playbook.md) § `/sources` page semantics.

See [`memory.md`](./memory.md) for retention and privacy guarantees.

**CI:** `.github/workflows/ci.yml` runs `npm test` and `npm run build` from `web/` (with dummy env for `DATABASE_URL` / `AUTH_SECRET`). Vitest config: `config/vitest.config.mjs`.

## CBT fidelity (manual / future harness)

The build spec references a **CTRS-style judge**. There is no single canonical automated score in-repo yet. Recommended workflow:

1. Export anonymized transcripts (with consent).
2. Run a blinded human rating or an external LLM-as-judge rubric **outside** production prompts.
3. Log scores in version control or a spreadsheet keyed by `classifierVersion` + prompt hash.

When a scripted judge lands, document the command here and add it to CI only if results are stable (flaky LLM judges should gate `main` cautiously).
