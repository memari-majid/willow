import { z } from "zod";

export const PREFERENCE_SIGNAL_SCHEMA = z.object({
  detected: z.boolean(),
  kind: z
    .enum(["formality", "directness", "pace", "avoid", "none"])
    .optional(),
  value: z.union([z.string(), z.number()]).optional(),
  evidence: z.string().optional(),
});

export type PreferenceSignal = z.infer<typeof PREFERENCE_SIGNAL_SCHEMA>;
