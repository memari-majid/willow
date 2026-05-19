import { Info } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Always-visible disclaimer at the top of the chat. The text comes
 * from `content/safety/disclaimers.md` (the SME owns it). Here we
 * just render the short user-facing line.
 */
export function SafetyDisclaimer() {
  return (
    <Alert className="border-border/60 bg-card/40 text-muted-foreground">
      <Info className="size-4" />
      <AlertDescription className="text-xs sm:text-sm">
        Willow is an AI companion for everyday reflection. It is{" "}
        <span className="font-medium text-foreground">
          not a therapist, doctor, or crisis service
        </span>{" "}
        and cannot diagnose or treat. If you&rsquo;re in crisis, please reach
        out to a real human now.
      </AlertDescription>
    </Alert>
  );
}
