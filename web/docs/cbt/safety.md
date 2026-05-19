# Safety architecture — Willow CBT Companion

## Two stages

1. **Stage A — Keywords + regex (`src/lib/safety/keywords.ts` + `content/safety/crisis-keywords.md`)**  
   Fast, conservative prescreen. Any match **skips the main LLM** and returns a deterministic crisis-oriented assistant response (see `src/lib/safety/crisis-response.ts`).

2. **Stage B — Classifier (`src/lib/safety/classifier.ts`)**  
   Haiku (via AI Gateway) returns a structured risk level (`green` / `yellow` / `red`) with indicators. **Red** also bypasses the main LLM. **Yellow** adds a `<turn_instruction>` block to slow the model and prioritize safety. **Green** proceeds with normal CBT instructions + RAG.

## Persistence

- Every classification path writes a row to **`safety_events`** (`src/lib/db/schema.ts`) with `risk_level`, `indicators`, and `reviewed_by_human` defaulting to `false`.

## Human review queue

- **`/admin/safety`** (Auth.js session + allowlisted admin emails in `src/lib/admin.ts`) lists yellow/red events so a clinical reviewer can mark `reviewedByHuman` after audit.

## UI

- The chat shows **`CrisisBanner`** when metadata indicates crisis (`crisisDetected` or `safetyLevel === "red"`).

## Operational notes

- Prefer **false positives** over missed crisis signals when adjusting keywords or classifier prompts. Changes to classifier instructions belong in **`content/`** if they change *clinical wording*; routing code stays in **`src/`** per Willow conventions.
