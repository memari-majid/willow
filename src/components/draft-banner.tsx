import Link from "next/link";
import { ArrowRight, Construction } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Banner shown at the top of the chat when one or more REQUIRED SME
 * files still contain `[SME: ...]` placeholders. The intent is to
 * make it obvious that this is a draft so test users know what
 * they're looking at, and to invite the SME into the dashboard.
 */
export function DraftBanner({ unreadyCount }: { unreadyCount: number }) {
  return (
    <Alert className="border-amber-500/40 bg-amber-500/10 text-foreground">
      <Construction className="size-4 text-amber-500" />
      <AlertTitle className="text-sm font-medium">
        Draft — Willow is running on starter content.
      </AlertTitle>
      <AlertDescription className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {unreadyCount === 1
          ? "1 required content file"
          : `${unreadyCount} required content files`}{" "}
        still need the SME&rsquo;s input. The conversation below uses
        developer-provided defaults until then.{" "}
        <Link
          href="/sme"
          className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground"
        >
          Open the SME dashboard
          <ArrowRight className="size-3" />
        </Link>
        .
      </AlertDescription>
    </Alert>
  );
}
