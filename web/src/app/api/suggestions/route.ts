/**
 * POST /api/suggestions
 *
 * Body: { messages: WillowUIMessage[] }
 * Returns: { suggestions: string[] }  // length 3 or 0
 *
 * The client calls this from the `useChat` `onFinish` callback so the
 * suggestions appear under the latest assistant message a moment
 * after it finishes streaming.
 */

import { generateSuggestions } from "@/lib/ai/suggestions";
import type { WillowUIMessage } from "@/lib/ai/message-metadata";

export const maxDuration = 15;

export async function POST(req: Request) {
  const { messages }: { messages: WillowUIMessage[] } = await req.json();
  const suggestions = await generateSuggestions(messages);
  return Response.json({ suggestions });
}
