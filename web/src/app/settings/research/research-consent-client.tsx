"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  optInResearchAction,
  revokeResearchAction,
} from "@/app/settings/personalization-actions";

export function ResearchConsentClient({ active }: { active: boolean }) {
  const [busy, setBusy] = useState(false);

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-muted-foreground">
        Status:{" "}
        <span className="font-medium text-foreground">
          {active ? "Opted in" : "Not opted in"}
        </span>
      </p>
      {active ? (
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void revokeResearchAction().finally(() => setBusy(false));
          }}
        >
          Leave the research cohort
        </Button>
      ) : (
        <Button
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void optInResearchAction().finally(() => setBusy(false));
          }}
        >
          Join the research cohort
        </Button>
      )}
    </div>
  );
}
