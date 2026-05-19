import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Suggested first-message chips. The list comes from
 * `content/conversation-starters.md` — the SME owns the words.
 */
export function StarterPrompts({
  starters,
  onPick,
  className,
}: {
  starters: string[];
  onPick: (text: string) => void;
  className?: string;
}) {
  if (!starters.length) return null;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        Or try one of these
      </p>
      <div className="flex flex-wrap gap-2">
        {starters.map((s) => (
          <Button
            key={s}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPick(s)}
            className="h-auto rounded-full border-border/60 bg-card/40 px-3 py-1.5 text-left text-xs font-normal whitespace-normal hover:bg-card"
          >
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}
