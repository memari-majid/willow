"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Composer } from "@/components/composer";
import { MessageBubble } from "@/components/message-bubble";
import { cn } from "@/lib/utils";
import type { WillowUIMessage } from "@/lib/ai/message-metadata";

/**
 * Compact chat widget used inside the SME page so the SME can
 * test what they've written without leaving the dashboard.
 *
 * It hits the same `/api/chat` endpoint as the main chat — there's
 * only one source of truth for what the bot does.
 */
export function SmeTestChat({ className }: { className?: string }) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, stop, setMessages, error } =
    useChat<WillowUIMessage>({
      transport: new DefaultChatTransport({ api: "/api/chat" }),
    });

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  function handleSubmit() {
    const text = input.trim();
    if (!text) return;
    sendMessage({ text });
    setInput("");
  }

  function reset() {
    setMessages([]);
    setInput("");
  }

  return (
    <section
      className={cn(
        "flex h-full min-h-[520px] flex-col rounded-2xl border border-border/60 bg-card/40",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-2 border-b border-border/40 px-4 py-3">
        <div>
          <h3 className="text-sm font-medium">Test conversation</h3>
          <p className="text-[11px] text-muted-foreground">
            Same endpoint as the live chat. Useful for trying edits.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={reset}
          disabled={messages.length === 0}
          className="h-8 rounded-full text-xs"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <p className="max-w-xs text-xs text-muted-foreground">
              Send a test message below to see how Willow responds with
              the current content.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {error && (
              <p className="text-center text-[11px] text-destructive">
                Something went wrong: {error.message}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border/40 p-3">
        <Composer
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onStop={stop}
          status={status}
          placeholder="Try: 'I had a hard day…'"
        />
      </div>
    </section>
  );
}
