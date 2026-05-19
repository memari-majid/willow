"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Renders the AI-generated follow-up suggestions as clickable chips
 * under the last assistant message. Click → sends as next user
 * message. Designed to look like the user's own voice, not the
 * bot's, so they read as suggestions *for* the user, not from it.
 */
export function SuggestionChips({
  suggestions,
  onPick,
  loading = false,
  className,
}: {
  suggestions: string[];
  onPick: (text: string) => void;
  loading?: boolean;
  className?: string;
}) {
  if (loading) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 px-1 text-xs text-muted-foreground",
          className,
        )}
      >
        <Sparkles className="size-3 animate-pulse" />
        <span>Suggesting next…</span>
      </div>
    );
  }

  if (!suggestions.length) return null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="px-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        Or reply with
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((text, i) => (
          <Button
            key={`${i}-${text}`}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPick(text)}
            className="h-auto rounded-full border-border/60 bg-card/40 px-3 py-1.5 text-left text-xs font-normal whitespace-normal hover:bg-card hover:border-border"
          >
            {text}
          </Button>
        ))}
      </div>
    </div>
  );
}
