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

**Tone regression (planned):** Section 9 of `content/cbt_companion_tone_and_persona.md` defines a five-axis rubric (warmth, directness, specificity, in-character, skill-orientation). Expand `tests/safety-regression.spec.ts` or add `tests/tone-regression.spec.ts` with fixed dialogues and an LLM-as-judge harness; fail CI on scores below threshold.

## Personalization manual scenarios

Run with `PERSONALIZATION_ENABLED` on (default):

1. **Name recall** — tell Willow your preferred name; start a new thread; confirm `<user_longitudinal_context>` identity block includes it.
2. **Preference applied next turn** — say “be more direct”; next reply should acknowledge and use shorter, clearer sentences.
3. **Forgotten on request** — ask Willow to remember a fact, then “forget that” via tool or Settings → Memory delete; confirm it no longer appears in context.
4. **Summary after 20 msgs** — exceed `SUMMARY_MESSAGE_THRESHOLD` in one thread; check `conversation_summaries` row and rolling summary in prompt.
5. **Persona overlay** — user with `ageBand: 18_24` gets `content/persona/age_band/18_24.md` appended to system prompt.

See [`memory.md`](./memory.md) for retention and privacy guarantees.

**CI:** `.github/workflows/ci.yml` runs `npm test` and `npm run build` from `web/` (with dummy env for `DATABASE_URL` / `AUTH_SECRET`). Vitest config: `config/vitest.config.mjs`.

## CBT fidelity (manual / future harness)

The build spec references a **CTRS-style judge**. There is no single canonical automated score in-repo yet. Recommended workflow:

1. Export anonymized transcripts (with consent).
2. Run a blinded human rating or an external LLM-as-judge rubric **outside** production prompts.
3. Log scores in version control or a spreadsheet keyed by `classifierVersion` + prompt hash.

When a scripted judge lands, document the command here and add it to CI only if results are stable (flaky LLM judges should gate `main` cautiously).
