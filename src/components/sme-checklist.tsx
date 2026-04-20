import { CheckCircle2, CircleAlert, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FileStatus } from "@/lib/content";

/**
 * Lists every SME-editable file with a ready/not-ready indicator and
 * the count of `[SME: ...]` markers still in the file. Files in the
 * `required` set get a destructive badge when not ready; optional
 * files get a softer "optional" badge.
 */
export function SmeChecklist({
  status,
  required,
  className,
}: {
  status: FileStatus[];
  required: ReadonlySet<string>;
  className?: string;
}) {
  const groups = groupByFolder(status);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {Object.entries(groups).map(([folder, files]) => (
        <section key={folder} className="flex flex-col gap-2">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
            {folder}
          </h3>
          <ul className="flex flex-col rounded-2xl border border-border/60 bg-card/40 divide-y divide-border/40 overflow-hidden">
            {files.map((file) => {
              const isRequired = required.has(file.relativePath);
              return (
                <li
                  key={file.relativePath}
                  className="flex items-center gap-3 px-4 py-3 text-sm"
                >
                  {file.ready ? (
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  ) : (
                    <CircleAlert
                      className={cn(
                        "size-4 shrink-0",
                        isRequired
                          ? "text-amber-500"
                          : "text-muted-foreground",
                      )}
                    />
                  )}
                  <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate font-mono text-xs">
                    content/{file.relativePath}
                  </span>
                  {!file.ready && file.placeholderCount > 0 && (
                    <Badge
                      variant="outline"
                      className="rounded-full text-[10px] font-normal"
                    >
                      {file.placeholderCount} TODO
                      {file.placeholderCount === 1 ? "" : "s"}
                    </Badge>
                  )}
                  {isRequired && !file.ready && (
                    <Badge
                      variant="destructive"
                      className="rounded-full text-[10px] font-normal"
                    >
                      Required
                    </Badge>
                  )}
                  {!isRequired && (
                    <Badge
                      variant="secondary"
                      className="rounded-full text-[10px] font-normal"
                    >
                      Optional
                    </Badge>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function groupByFolder(status: FileStatus[]): Record<string, FileStatus[]> {
  const out: Record<string, FileStatus[]> = {};
  for (const s of status) {
    const folder = s.relativePath.includes("/")
      ? s.relativePath.split("/")[0]
      : "(root)";
    out[folder] ||= [];
    out[folder].push(s);
  }
  return out;
}
