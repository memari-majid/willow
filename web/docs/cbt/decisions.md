# Engineering decisions — CBT Companion (Willow extension)

This document records **intentional divergences** from [`build-spec.md`](./build-spec.md) and third-party docs, so future contributors do not “paper over” them by accident.

## AI routing

- **All chat and classifier LLM calls** use Vercel AI Gateway with plain `provider/model` strings (`anthropic/claude-opus-4-7`, `anthropic/claude-haiku-4-5`, etc.). We do **not** import `@ai-sdk/anthropic` in application code unless there is an explicit product requirement.
- **Voyage** embeddings use the **Voyage HTTP API** when `VOYAGE_API_KEY` is set. On Vercel (and locally after `vercel env pull`), embeddings also work via **AI Gateway** + `VERCEL_OIDC_TOKEN` (`voyage/voyage-3-large`). **Rerank-2** still requires `VOYAGE_API_KEY`; without it, retrieval uses merge-order fallback. See `src/lib/rag/voyage-client.ts` and [`../developer/agent-chatbot-playbook.md`](../developer/agent-chatbot-playbook.md).

## Auth

- The original Willow ROADMAP mentioned **Clerk** for Phase 4. The mental-health posture and self-hosted session story led to **Auth.js v5 + Drizzle adapter + Postgres** instead. Clerk remains a valid future option but is not the default path.

## Runtime

- `/api/chat` runs on the **Node.js** runtime (not Edge) so Drizzle + Neon HTTP + Auth.js behave predictably. Revisit Edge only if Neon and session stores are verified there.

## Safety content ownership

- A small **regex prescreen** lives in `src/lib/safety/keywords.ts` for sub-millisecond escalation. The **authoritative** keyword list remains SME-editable in `content/safety/crisis-keywords.md` (Willow `AGENTS.md` rule 5). Do not delete or weaken crisis flow without SME sign-off.

## RAG metadata

- The spec calls for hand-curated chunk metadata. The **ingest script** (`scripts/ingest.ts`) uses **heuristics** (chunk type, symptoms, contraindication hints) so the pipeline runs without a separate curation database. SMEs can later replace or augment this with curated manifests without changing retrieval shape.

## Risk flags for clinical / IRB review

- **Under-18:** onboarding stores an age band; default product stance should remain “not for minors” until policy is explicitly changed in `content/` and onboarding.
- **Research consent:** distinct from general app consent — if you run structured research, add a separate consent version and storage; do not overload `consentVersion` without documentation.
- **English-first v1:** crisis resources and prompts assume English; localize in `content/` before marketing non-English audiences.
- **Exposure / ERP-style hierarchies:** out of scope for v1; contraindication hints in RAG metadata flag exposure content where appropriate.
