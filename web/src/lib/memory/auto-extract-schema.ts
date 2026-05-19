import { z } from "zod";

import { memoryContentAllowed } from "@/lib/memory/pii-guard";

export const AUTO_EXTRACT_MESSAGE_THRESHOLD = 6;

export const EXTRACTED_FACT_SCHEMA = z.object({
  facts: z
    .array(
      z.object({
        kind: z.enum(["fact", "relationship", "context"]),
        content: z.string().min(2).max(500),
      }),
    )
    .max(3),
});

export type ExtractedFact = z.infer<
  typeof EXTRACTED_FACT_SCHEMA
>["facts"][number];

export function filterExtractedFacts(facts: ExtractedFact[]): ExtractedFact[] {
  return facts.filter((f) => memoryContentAllowed(f.content));
}
