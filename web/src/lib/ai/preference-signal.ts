import { generateText, Output } from "ai";

import { SAFETY_CLASSIFIER_MODEL } from "@/lib/ai/model";
import {
  PREFERENCE_SIGNAL_SCHEMA,
  type PreferenceSignal,
} from "@/lib/ai/preference-signal-schema";
import { mightContainPreferenceSignal } from "@/lib/ai/preference-signal-prescreen";
import {
  insertUserMemory,
  upsertUserPreference,
} from "@/lib/memory/store";

export { mightContainPreferenceSignal };
export { PREFERENCE_SIGNAL_SCHEMA, type PreferenceSignal };

const SYSTEM = `Detect if the user is asking to change how the AI companion communicates (tone, formality, pace, topics to avoid).
Examples:
- "be more direct" -> directness: 5
- "stop being so clinical" -> formality: casual
- "slow down" -> pace: slow
- "don't talk about my ex" -> avoid: topic
If no preference signal, set detected: false and kind: none.`;

export async function detectPreferenceSignal(
  userMessage: string,
): Promise<PreferenceSignal> {
  if (!userMessage.trim()) {
    return { detected: false, kind: "none" };
  }

  try {
    const result = await generateText({
      model: SAFETY_CLASSIFIER_MODEL,
      output: Output.object({ schema: PREFERENCE_SIGNAL_SCHEMA }),
      system: SYSTEM,
      prompt: userMessage,
      temperature: 0,
      providerOptions: {
        gateway: { tags: ["app:willow", "feature:pref-signal"] },
      },
    });
    return result.output ?? { detected: false, kind: "none" };
  } catch {
    return { detected: false, kind: "none" };
  }
}

export async function applyPreferenceSignal(
  userId: string,
  signal: PreferenceSignal,
  conversationId: string,
): Promise<string | null> {
  if (!signal.detected || !signal.kind || signal.kind === "none") return null;

  const evidence = signal.evidence ?? "User request";

  switch (signal.kind) {
    case "formality":
      if (typeof signal.value === "string") {
        await upsertUserPreference(userId, { formality: signal.value });
      }
      break;
    case "directness":
      if (typeof signal.value === "number") {
        await upsertUserPreference(userId, { directness: signal.value });
      } else if (signal.value === "more") {
        await upsertUserPreference(userId, { directness: 5 });
      } else if (signal.value === "less") {
        await upsertUserPreference(userId, { directness: 2 });
      }
      break;
    case "pace":
      if (typeof signal.value === "string") {
        await upsertUserPreference(userId, { pace: signal.value });
      }
      break;
    case "avoid":
      if (typeof signal.value === "string") {
        const prefs = await upsertUserPreference(userId, {});
        const list = [...(prefs.avoidList ?? []), signal.value];
        await upsertUserPreference(userId, {
          avoidList: [...new Set(list)],
        });
      }
      break;
    default:
      return null;
  }

  await insertUserMemory({
    userId,
    kind: "preference_note",
    content: `${signal.kind}: ${String(signal.value ?? "")} (${evidence})`,
    source: "user_said",
    conversationId,
    pinned: false,
  });

  return `The user asked to adjust communication style (${signal.kind}). Acknowledge briefly that you will adapt, then continue the conversation.`;
}
