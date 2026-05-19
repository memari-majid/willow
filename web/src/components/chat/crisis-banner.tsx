import { LifeBuoy } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Surfaces a curated set of crisis resources whenever the latest
 * assistant message metadata indicates a safety keyword was matched.
 *
 * The resources here mirror what's in `content/safety/crisis-resources.md`
 * intentionally — the SME owns the long-form list, this component is
 * the immediate UI affordance.
 */
export function CrisisBanner() {
  return (
    <Alert
      role="alert"
      className="border-destructive/40 bg-destructive/10 text-foreground"
    >
      <LifeBuoy className="size-4 text-destructive" />
      <AlertTitle className="text-sm font-medium">
        It sounds like things are heavy right now. You don&rsquo;t have to do
        this alone.
      </AlertTitle>
      <AlertDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
        <ul className="list-disc space-y-1 pl-4">
          <li>
            <span className="text-foreground">US:</span> call or text{" "}
            <span className="font-mono text-foreground">988</span> — Suicide
            &amp; Crisis Lifeline (24/7).
          </li>
          <li>
            <span className="text-foreground">UK &amp; Ireland:</span>{" "}
            Samaritans <span className="font-mono text-foreground">116 123</span>{" "}
            (24/7).
          </li>
          <li>
            <span className="text-foreground">Australia:</span> Lifeline{" "}
            <span className="font-mono text-foreground">13 11 14</span> (24/7).
          </li>
          <li>
            International:{" "}
            <a
              href="https://findahelpline.com"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              findahelpline.com
            </a>
          </li>
          <li>If you&rsquo;re in immediate danger, call your local emergency number.</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}
