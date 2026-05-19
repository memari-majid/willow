"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";

import { Composer } from "@/components/chat/composer";
import { CrisisBanner } from "@/components/chat/crisis-banner";
import { MessageBubble } from "@/components/chat/message-bubble";
import { StarterPrompts } from "@/components/chat/starter-prompts";
import type { WillowUIMessage } from "@/lib/ai/message-metadata";
import type { WikiLinkEntry } from "@/lib/wiki/link-registry";

/**
 * Top-level chat client. Owns useChat() state, scroll behavior, and
 * decides when to show the crisis banner / starter chips / empty state.
 *
 * Junior dev: this is the file to read after `route.ts`. It is the
 * client-side companion of the server endpoint.
 */
export function Chat({
  starters,
  conversationId,
  initialMessages,
  prefill,
  wikiLinkRegistry = [],
}: {
  starters: string[];
  /** Required for saved CBT conversations (auth users). */
  conversationId?: string;
  initialMessages?: WillowUIMessage[];
  /** Prefill composer from wiki or deep link (not auto-sent). */
  prefill?: string;
  wikiLinkRegistry?: WikiLinkEntry[];
}) {
  const [input, setInput] = useState("");
  const prefillApplied = useRef(false);
  const router = useRouter();
  const titleRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({
          conversationId,
        }),
      }),
    [conversationId],
  );

  const { messages, sendMessage, status, stop, error, regenerate } =
    useChat<WillowUIMessage>({
      id: conversationId,
      messages: initialMessages ?? [],
      transport,
      onFinish: ({ messages: finished }) => {
        const userTurns = finished.filter((m) => m.role === "user").length;
        if (userTurns > 2) return;
        if (titleRefreshTimer.current) {
          clearTimeout(titleRefreshTimer.current);
        }
        titleRefreshTimer.current = setTimeout(() => router.refresh(), 1800);
      },
    });

  useEffect(
    () => () => {
      if (titleRefreshTimer.current) {
        clearTimeout(titleRefreshTimer.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (prefillApplied.current || !prefill?.trim()) return;
    prefillApplied.current = true;
    setInput(prefill.trim());
  }, [prefill]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  const isEmpty = messages.length === 0;
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const showCrisisBanner = Boolean(
    lastAssistant?.metadata?.crisisDetected ||
      lastAssistant?.metadata?.safetyLevel === "red",
  );

  function handleSend(text: string) {
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
              <MessageBubble
                key={m.id}
                message={m}
                wikiLinkRegistry={wikiLinkRegistry}
              />
            ))}
            {status === "submitted" && <ThinkingDots />}
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
          Conversations are saved to your account so you can pick them up later.
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
