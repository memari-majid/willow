"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import { Composer } from "@/components/chat/composer";
import { CrisisBanner } from "@/components/chat/crisis-banner";
import { MessageBubble } from "@/components/chat/message-bubble";
import { StarterPrompts } from "@/components/chat/starter-prompts";
import { SuggestionChips } from "@/components/chat/suggestion-chips";
import type { WillowUIMessage } from "@/lib/ai/message-metadata";

/**
 * Top-level chat client. Owns useChat() state, scroll behavior, and
 * decides when to show the crisis banner / starter chips / empty
 * state / follow-up suggestion chips.
 *
 * Junior dev: this is the file to read after `route.ts`. It is the
 * client-side companion of the server endpoint.
 */
export function Chat({ starters }: { starters: string[] }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const { messages, sendMessage, status, stop, error, regenerate } =
    useChat<WillowUIMessage>({
      transport: new DefaultChatTransport({ api: "/api/chat" }),
      onFinish: async ({ messages: finalMessages }) => {
        // Fetch follow-up suggestions for the latest assistant turn.
        // Best-effort: failures here just mean no chips show up, the
        // chat itself is unaffected.
        setSuggestionsLoading(true);
        try {
          const res = await fetch("/api/suggestions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: finalMessages }),
          });
          if (res.ok) {
            const data = (await res.json()) as { suggestions: string[] };
            setSuggestions(data.suggestions ?? []);
          }
        } catch {
          /* silent — suggestions are optional */
        } finally {
          setSuggestionsLoading(false);
        }
      },
    });

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status, suggestions]);

  const isEmpty = messages.length === 0;
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const showCrisisBanner = Boolean(lastAssistant?.metadata?.crisisDetected);
  const showSuggestions =
    status === "ready" && messages.length > 0 && !isEmpty;

  function handleSend(text: string) {
    setSuggestions([]);
    sendMessage({ text });
    setInput("");
  }

  function handleSubmit() {
    const text = input.trim();
    if (!text) return;
    handleSend(text);
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-border/40 bg-background/60 px-4 py-6 sm:px-6"
      >
        {isEmpty ? (
          <EmptyState starters={starters} onPick={handleSend} />
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {status === "submitted" && <ThinkingDots />}
            {showSuggestions && (
              <SuggestionChips
                suggestions={suggestions}
                loading={suggestionsLoading && suggestions.length === 0}
                onPick={handleSend}
                className="ml-10"
              />
            )}
            {error && (
              <div className="text-center text-xs text-muted-foreground">
                Something went wrong.{" "}
                <button
                  onClick={() => regenerate()}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Try again
                </button>
                .
              </div>
            )}
          </div>
        )}
      </div>

      {showCrisisBanner && (
        <div className="mx-auto w-full max-w-2xl">
          <CrisisBanner />
        </div>
      )}

      <div className="mx-auto w-full max-w-2xl">
        <Composer
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onStop={stop}
          status={status}
        />
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Willow can make mistakes and is not a substitute for professional
          care.
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  starters,
  onPick,
}: {
  starters: string[];
  onPick: (text: string) => void;
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 py-8 text-center sm:py-16">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Hi. What&rsquo;s on your mind?
        </h1>
        <p className="text-sm text-muted-foreground">
          Take a breath. There&rsquo;s no rush. Type whatever you&rsquo;d
          like to think through.
        </p>
      </div>
      <StarterPrompts
        starters={starters}
        onPick={onPick}
        className="items-center text-center"
      />
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-1 text-muted-foreground">
      <span className="size-1.5 animate-pulse rounded-full bg-current" />
      <span
        className="size-1.5 animate-pulse rounded-full bg-current"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="size-1.5 animate-pulse rounded-full bg-current"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}
