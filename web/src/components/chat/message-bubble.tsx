import { ChatToolPart } from "@/components/chat/tool-part";
import { WikiMessageLinks } from "@/components/wiki/wiki-message-links";
import { cn } from "@/lib/utils";
import type { WikiLinkEntry } from "@/lib/wiki/link-registry";
import type { WillowUIMessage } from "@/lib/ai/message-metadata";

/**
 * Renders a single chat message. Walks `message.parts` because in
 * AI SDK v6 the message body is a parts array (text, reasoning,
 * file, tool calls...) — see `node_modules/ai/docs/04-ai-sdk-ui/`.
 */
export function MessageBubble({
  message,
  wikiLinkRegistry = [],
}: {
  message: WillowUIMessage;
  wikiLinkRegistry?: WikiLinkEntry[];
}) {
  const isUser = message.role === "user";
  const assistantText = message.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("\n");

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && <RoleDot label="Willow" />}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[80%]",
          "break-words [overflow-wrap:anywhere]",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-card text-card-foreground border border-border/60",
        )}
      >
        {message.parts.map((part, idx) => {
          if (part.type === "text") {
            return (
              <p key={idx} className="whitespace-pre-wrap">
                {part.text}
              </p>
            );
          }
          if (!isUser) {
            return <ChatToolPart key={idx} part={part} />;
          }
          return null;
        })}
        {!isUser && wikiLinkRegistry.length > 0 ? (
          <WikiMessageLinks text={assistantText} registry={wikiLinkRegistry} />
        ) : null}
      </div>
      {isUser && <RoleDot label="You" tone="user" />}
    </div>
  );
}

function RoleDot({
  label,
  tone = "assistant",
}: {
  label: string;
  tone?: "assistant" | "user";
}) {
  return (
    <div
      className={cn(
        "mt-1 flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-medium uppercase tracking-wider",
        tone === "assistant"
          ? "bg-muted text-muted-foreground"
          : "bg-primary/10 text-foreground",
      )}
      aria-label={label}
      title={label}
    >
      {label.slice(0, 1)}
    </div>
  );
}
