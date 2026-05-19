export const DEFAULT_CONVERSATION_TITLE = "New conversation";

export function shouldAutoTitle(title: string | null | undefined): boolean {
  const t = (title ?? "").trim();
  return !t || t === DEFAULT_CONVERSATION_TITLE;
}
