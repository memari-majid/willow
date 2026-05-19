# CBT Companion — documentation

Engineering docs for the Phase 4 CBT extension. **Runtime prompt content** lives in `web/content/` (SME territory):

| Content file | Purpose |
|---|---|
| [`cbt_companion_instructions.md`](../../content/cbt_companion_instructions.md) | Behavioral protocol (what to do) |
| [`cbt_companion_tone_and_persona.md`](../../content/cbt_companion_tone_and_persona.md) | Warm-competent voice (how to sound) |

| Engineering doc | Purpose |
|---|---|
| [`build-spec.md`](./build-spec.md) | Full architecture, schemas, build order (agent-oriented) |
| [`decisions.md`](./decisions.md) | Willow-specific deviations from the build spec |
| [`safety.md`](./safety.md) | Two-stage safety + admin audit path |
| [`memory.md`](./memory.md) | User memory, preferences, retention, `/settings` |
| [`eval.md`](./eval.md) | Vitest suites and CBT fidelity eval notes |
| [`../developer/agent-chatbot-playbook.md`](../developer/agent-chatbot-playbook.md) | **Reuse stack** — RAG, tools, env, new companion checklist |

**Status:** see [`ROADMAP.md`](../ROADMAP.md) Phase 4.
