/**
 * Follow-up suggestions for the user — three short, in-the-user's-voice
 * messages they can click to send next.
 *
 * Why this exists
 * ---------------
 * Typing is friction. For an SME iterating on the bot's behavior,
 * and for a real user who's already tired or distressed, getting a
 * one-tap "this is what I'd say next" makes the loop dramatically
 * faster.
 *
 * Implementation
 * --------------
 * One tiny `generateText` call with `Output.object()` (v6 pattern).
 * Uses the same gateway-routed model so we don't add a new auth
 * surface. Temperature is high-ish on purpose — variety beats
 * consistency for suggestions.
 */

import { generateText, Output, convertToModelMessages } from "ai";
import { z } from "zod";

import type { WillowUIMessage } from "@/lib/ai/message-metadata";
import { PRIMARY_MODEL } from "@/lib/ai/model";

const SUGGESTIONS_SYSTEM = `You generate three short follow-up messages the user could send NEXT in a calm wellbeing conversation with an AI companion called Willow.

Rules:
- First person, in the user's voice. Examples: "Tell me more", "I want to try the breathing exercise", "Something else came up".
- 3 to 10 words each. No periods at the end.
- Plain English. No clinical jargon. No emojis.
- Keep them genuinely useful and varied: at least one should invite going deeper, at least one should offer a different direction or close.
- Match the emotional register of the conversation. If it's heavy, do not be peppy.
- Never include placeholder text like [SME: …]. Never include the bot's name.
- If the conversation just ended naturally, suggestions like "Thanks, that's enough for today" are fine.`;

export async function generateSuggestions(
  messages: WillowUIMessage[],
): Promise<string[]> {
  const recent = messages.slice(-8);

  try {
    const { output } = await generateText({
      model: PRIMARY_MODEL,
      system: SUGGESTIONS_SYSTEM,
      messages: await convertToModelMessages(recent),
      output: Output.object({
        schema: z.object({
          suggestions: z
            .array(z.string().min(2).max(80))
            .length(3)
            .describe("Three short next-message suggestions in the user's voice"),
        }),
      }),
      temperature: 0.7,
      providerOptions: {
        gateway: { tags: ["app:willow", "feature:suggestions"] },
      },
    });

    return output?.suggestions ?? [];
  } catch {
    // Suggestions are a nice-to-have. If the model can't produce
    // valid JSON for any reason, fall back to silence rather than
    // breaking the chat.
    return [];
  }
}
