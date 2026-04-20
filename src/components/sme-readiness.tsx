import { CheckCircle2, CircleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FileStatus } from "@/lib/content";

/**
 * Headline summary for the SME page. "Y of N required files ready",
 * a colored bar, and a short message about what to do next.
 */
export function SmeReadiness({
  status,
  required,
  className,
}: {
  status: FileStatus[];
  required: ReadonlySet<string>;
  className?: string;
}) {
  const requiredFiles = status.filter((s) => required.has(s.relativePath));
  const readyCount = requiredFiles.filter((s) => s.ready).length;
  const total = requiredFiles.length;
  const allReady = readyCount === total;
  const pct = total === 0 ? 100 : Math.round((readyCount / total) * 100);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/50 p-5",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {allReady ? (
          <CheckCircle2 className="size-5 text-emerald-500" />
        ) : (
          <CircleAlert className="size-5 text-amber-500" />
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h2 className="text-base font-medium">
              {allReady
                ? "Required content is ready."
                : "Required content needs your input."}
            </h2>
            <Badge variant="outline" className="rounded-full">
              {readyCount} / {total} ready
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {allReady
              ? "Willow will run with what you've authored. You can still edit any file at any time."
              : "Open the files below in your editor and replace each [SME: …] marker with your own words. Refresh this page to re-check."}
          </p>
        </div>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            allReady ? "bg-emerald-500" : "bg-amber-500",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
