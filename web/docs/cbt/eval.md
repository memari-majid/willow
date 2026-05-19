# Evaluation — safety + CBT fidelity

## Automated tests (Vitest)

```bash
npm test
```

- **`tests/safety-keywords.spec.ts`** — unit checks for Stage A regex prescreen.
- **`tests/safety-regression.spec.ts`** — small locked set of red/green strings; **expand** toward the full regression suite described in the build spec (manipulation attempts, benign mental-health language).
- **`tests/cbt-tools-schema.spec.ts`** — Zod-shape smoke tests for tool inputs (no DB).
- **`tests/rag-format.spec.ts`** — prompt formatting for retrieved chunks.

**Tone regression (planned):** Section 9 of `content/cbt_companion_tone_and_persona.md` defines a five-axis rubric (warmth, directness, specificity, in-character, skill-orientation). Expand `tests/safety-regression.spec.ts` or add `tests/tone-regression.spec.ts` with fixed dialogues and an LLM-as-judge harness; fail CI on scores below threshold.

**CI:** `.github/workflows/ci.yml` runs `npm test` and `npm run build` from `web/` (with dummy env for `DATABASE_URL` / `AUTH_SECRET`). Vitest config: `config/vitest.config.mjs`.

## CBT fidelity (manual / future harness)

The build spec references a **CTRS-style judge**. There is no single canonical automated score in-repo yet. Recommended workflow:

1. Export anonymized transcripts (with consent).
2. Run a blinded human rating or an external LLM-as-judge rubric **outside** production prompts.
3. Log scores in version control or a spreadsheet keyed by `classifierVersion` + prompt hash.

When a scripted judge lands, document the command here and add it to CI only if results are stable (flaky LLM judges should gate `main` cautiously).
