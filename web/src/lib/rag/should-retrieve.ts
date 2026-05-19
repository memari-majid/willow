/** CBT / book / technique language — worth retrieving Sokol & Fox chunks. */
const RAG_INTENT =
  /\b(technique|worksheet|homework|thought record|refram|cognitive|behavioral|exposure|sokol|evidence|exercise|skill|protocol|distortion|activation|mindful|breathing|how do i|what should i|what is a|explain|book|manual|chapter)\b/i;

/**
 * Skip RAG on short emotional check-ins; run on technique questions and longer turns.
 */
export function shouldRetrieveContext(userMessage: string): boolean {
  const text = userMessage.trim();
  if (!text) return false;
  if (text.length < 36) return false;
  if (RAG_INTENT.test(text)) return true;
  if (text.includes("?")) return true;
  if (text.length >= 100) return true;
  return false;
}
