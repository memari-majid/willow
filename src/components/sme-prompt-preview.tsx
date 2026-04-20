"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Clipboard, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Collapsible block that shows the SME the *exact* assembled system
 * prompt the model receives. `[SME:` placeholders are highlighted so
 * any unreplaced template text jumps out visually.
 */
export function SmePromptPreview({
  prompt,
  className,
}: {
  prompt: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-border/60 bg-card/40",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left text-sm font-medium hover:opacity-80"
        >
          {open ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
          What the AI is being told ({prompt.length.toLocaleString()} chars)
        </button>
        {open && (
          <Button
            variant="outline"
            size="sm"
            onClick={copy}
            className="h-8 rounded-full text-xs"
          >
            {copied ? (
              <>
                <Check className="size-3.5" />
                Copied
              </>
            ) : (
              <>
                <Clipboard className="size-3.5" />
                Copy
              </>
            )}
          </Button>
        )}
      </header>
      {open && (
        <pre className="max-h-[60vh] overflow-auto border-t border-border/40 bg-background/60 px-4 py-3 text-[11px] leading-relaxed font-mono whitespace-pre-wrap">
          {highlightPlaceholders(prompt)}
        </pre>
      )}
    </section>
  );
}

function highlightPlaceholders(prompt: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\[SME:[^\]]*\]/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(prompt))) {
    if (match.index > lastIndex) {
      parts.push(prompt.slice(lastIndex, match.index));
    }
    parts.push(
      <mark
        key={key++}
        className="rounded bg-amber-500/25 px-1 text-amber-200"
      >
        {match[0]}
      </mark>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < prompt.length) {
    parts.push(prompt.slice(lastIndex));
  }
  return parts;
}
