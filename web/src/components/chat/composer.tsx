"use client";

import { useEffect, useRef } from "react";
import { ArrowUp, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Multiline message composer. Auto-grows up to ~6 lines, sends on
 * Enter, allows newlines on Shift+Enter, and shows a stop button
 * while a response is streaming.
 */
export function Composer({
  value,
  onChange,
  onSubmit,
  onStop,
  status,
  placeholder = "What's on your mind?",
}: {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  status: "ready" | "submitted" | "streaming" | "error";
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [value]);

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isBusy && value.trim()) onSubmit();
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!isBusy && value.trim()) onSubmit();
      }}
      className={cn(
        "relative flex items-end gap-2 rounded-2xl border border-border/60",
        "bg-card/50 px-3 py-2 shadow-sm focus-within:border-border focus-within:bg-card",
      )}
    >
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        rows={1}
        aria-label="Message Willow"
        className={cn(
          "min-h-0 flex-1 resize-none border-0 bg-transparent p-1 text-sm",
          "shadow-none focus-visible:ring-0 dark:bg-transparent",
        )}
      />
      {isBusy ? (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={onStop}
          aria-label="Stop response"
          className="size-9 rounded-full"
        >
          <Square className="size-4" />
        </Button>
      ) : (
        <Button
          type="submit"
          size="icon"
          disabled={!value.trim()}
          aria-label="Send message"
          className="size-9 rounded-full"
        >
          <ArrowUp className="size-4" />
        </Button>
      )}
    </form>
  );
}
