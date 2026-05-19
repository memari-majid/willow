import Link from "next/link";
import { BookOpen } from "lucide-react";

import type { WikiLinkEntry } from "@/lib/wiki/link-registry";

export function WikiMessageLinks({
  text,
  registry,
}: {
  text: string;
  registry: WikiLinkEntry[];
}) {
  if (!text.trim() || !registry.length) return null;

  const lower = text.toLowerCase();
  const seen = new Set<string>();
  const links: WikiLinkEntry[] = [];

  for (const entry of registry) {
    if (seen.has(entry.path)) continue;
    for (const kw of entry.keywords) {
      if (kw.length < 4) continue;
      if (lower.includes(kw.toLowerCase())) {
        seen.add(entry.path);
        links.push(entry);
        break;
      }
    }
    if (links.length >= 3) break;
  }

  if (!links.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border/40 pt-2">
      {links.map((entry) => (
        <Link
          key={entry.path}
          href={`/wiki/${entry.path}`}
          className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <BookOpen className="size-3" aria-hidden />
          Wiki: {entry.title}
        </Link>
      ))}
    </div>
  );
}
