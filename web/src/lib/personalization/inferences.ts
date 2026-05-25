import { generateText, Output } from "ai";

import { listMessages } from "@/lib/db/queries";
import { SAFETY_CLASSIFIER_MODEL } from "@/lib/ai/model";
import { logger } from "@/lib/logger";
import {
  countMessagesSinceAutoExtract,
  AUTO_EXTRACT_MESSAGE_THRESHOLD,
} from "@/lib/memory/auto-extract";
import {
  filterInferredItems,
  INFERRED_PROFILE_SCHEMA,
} from "@/lib/personalization/inference-schema";
import { insertInferenceIfNew } from "@/lib/personalization/inference-store";

const INFER_PROMPT = `From this CBT companion transcript, infer up to 4 durable personalization notes about the USER (not the assistant).
Kinds:
- communication_pref: how they like to be spoken to (pace, directness)
- technique_affinity: techniques that seem to help or they prefer
- trigger_pattern: recurring situations or themes that activate distress
- doubt_theme: negative self-labels or core doubt themes (hypothesis only)
- scope_concern: topics that need clinician oversight (exposure, trauma, meds)

Rules:
- Only infer from what the USER explicitly said or clearly implied
- confidence high only when stated plainly; medium for reasonable inference; low for weak guesses
- Include a short evidenceSnippet (user quote fragment, max 20 words)
- Return empty inferences array if nothing durable`;

function messagesToText(
  rows: Awaited<ReturnType<typeof listMessages>>,
): { text: string; messageIds: string[] } {
  const slice = rows.slice(-24);
  const messageIds = slice.map((m) => m.id);
  const text = slice
    .map((m) => {
      const parts = m.content as { parts?: { type: string; text?: string }[] };
      const body =
        parts?.parts
          ?.filter((p) => p.type === "text")
          .map((p) => p.text ?? "")
          .join(" ") ?? "";
      return `${m.role}: ${body.slice(0, 400)}`;
    })
    .join("\n");
  return { text, messageIds };
}

export async function maybeInferUserProfile(args: {
  conversationId: string;
  userId: string;
}) {
  const { conversationId, userId } = args;
  try {
    const sinceCount = await countMessagesSinceAutoExtract(
      conversationId,
      userId,
    );
    if (sinceCount < AUTO_EXTRACT_MESSAGE_THRESHOLD) return;

    const all = await listMessages(conversationId);
    const { text, messageIds } = messagesToText(all);
    if (!text.trim()) return;

    const { output } = await generateText({
      model: SAFETY_CLASSIFIER_MODEL,
      system: INFER_PROMPT,
      prompt: text,
      output: Output.object({ schema: INFERRED_PROFILE_SCHEMA }),
      temperature: 0.2,
      providerOptions: {
        gateway: { tags: ["app:willow", "feature:inference-extract"] },
      },
    });

    const items = filterInferredItems(output?.inferences ?? []);
    for (const item of items) {
      await insertInferenceIfNew({
        userId,
        item,
        evidenceMessageIds: messageIds.slice(-6),
      });
    }
  } catch (e) {
    logger.warn({ err: e, conversationId }, "personalization.infer_failed");
  }
}
