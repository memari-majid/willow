# Personalization feedback loop

How Willow shows what it learns about a user, how SMEs correct it, and how labels become training data.

## Architecture

1. **Extract** — After safe turns, `maybeAutoExtractMemories` stores durable facts; `maybeInferUserProfile` stores structured inferences (`communication_pref`, `technique_affinity`, etc.).
2. **Show** — `/settings/profile` lists memories + inferences in three lanes: Confirmed, Inferred, Still guessing.
3. **Correct** — Users accept/reject/edit inline. Opted-in users appear in `/admin/personalization` for SME review.
4. **Apply** — Corrections inject `<personalization_corrections>` and `<confirmed_inferences>` into the dynamic system prompt via `prepareTurnContext`.
5. **Export** — `npm run export:corrections` writes JSONL for offline DPO/SFT (no training code in-repo).

## Tables

| Table | Purpose |
|---|---|
| `user_inferences` | Model-derived claims with confidence, evidence snippet, state |
| `personalization_consent` | Opt-in cohort scope and revoke timestamp |
| `sme_corrections` | Accept/reject/edit/counter_example labels |

## Dataset format

**DPO-style rows** (`type: "dpo"`) for `edit` and `counter_example`:

```json
{
  "type": "dpo",
  "action": "counter_example",
  "prompt": "[personalization_correction] target=inference",
  "chosen": "If user says X, ask for one recent example instead of agreeing.",
  "rejected": "User is hopeless about all relationships",
  "reasonCode": null,
  "smeId": "reviewer@example.com",
  "createdAt": "2026-05-24T12:00:00.000Z"
}
```

**Preference rows** (`type: "preference"`) for accept/reject — lighter signal for future reward models.

Output: `web/exports/corrections/vYYYY-MM-DD.jsonl` and matching `manifest.json`.

## Privacy

- SME queue only includes users with active `personalization_consent`.
- Evidence snippets scrub emails, name-like phrases, and blocked PII via `scrubEvidenceForSme`.
- Participants shown as `Participant ####` labels (one-way hash of user id).

## Consumer notes (offline)

- **DPO:** TRL / Hugging Face `DPOTrainer` with `prompt`, `chosen`, `rejected` columns mapped from JSONL.
- **SFT:** Use `chosen` from edit/counter_example rows with a fixed system prompt template.
- **Not in scope:** Live RLHF/PPO against hosted Claude — corrections apply in-context only at runtime.

## Manual smoke

1. Chat several turns → open `/settings/profile` → see inferred cards.
2. Click **Not really** on an inference → next chat should include avoid instruction in prompt (check logs or eval fixture).
3. Opt in at `/settings/research` → as admin, open `/admin/personalization` → accept/reject/edit.
4. Run `npm run export:corrections` → verify JSONL + manifest.
