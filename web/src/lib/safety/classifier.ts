import { generateText, Output } from "ai";
import { z } from "zod";

import { SAFETY_CLASSIFIER_MODEL } from "@/lib/ai/model";

export const SAFETY_SCHEMA = z.object({
  riskLevel: z.enum(["green", "yellow", "red"]),
  indicators: z.array(
    z.enum([
      "suicidal_ideation_passive",
      "suicidal_ideation_active",
      "suicide_plan",
      "self_harm_urge",
      "self_harm_recent",
      "means_access",
      "severe_hopelessness",
      "sudden_calm_after_distress",
      "homicidal_ideation",
      "active_psychosis",
      "abuse_disclosure_child",
      "abuse_disclosure_adult",
      "eating_disorder_specific",
      "acute_intoxication_distress",
    ]),
  ),
  reasoning: z.string().describe("one sentence"),
});

export type SafetyClassification = z.infer<typeof SAFETY_SCHEMA>;

const SAFETY_SYSTEM = `You are a safety classifier for a CBT companion chatbot. Read the user's message in the context of the recent conversation. Output a structured assessment. Be calibrated: not every mention of sadness is a crisis, but never miss an actual one. Default to caution.

- 'green' = no safety indicators
- 'yellow' = subclinical distress, passive ideation, or warning patterns warranting careful handling but not immediate escalation
- 'red' = active ideation, plan, intent, means, acute crisis, abuse disclosure requiring immediate pathway, or active psychosis`;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | "timeout"> {
  return Promise.race([
    promise,
    new Promise<"timeout">((resolve) =>
      setTimeout(() => resolve("timeout"), ms),
    ),
  ]);
}

export async function classifyUserMessage(
  userMessage: string,
  recentContext: string,
): Promise<SafetyClassification> {
  const result = await withTimeout(
    generateText({
      model: SAFETY_CLASSIFIER_MODEL,
      output: Output.object({ schema: SAFETY_SCHEMA }),
      system: SAFETY_SYSTEM,
      temperature: 0,
      prompt: `Recent context:\n${recentContext}\n\nLatest user message:\n${userMessage}`,
      providerOptions: {
        gateway: {
          tags: ["app:willow", "feature:safety-classifier"],
        },
      },
    }),
    1500,
  );

  if (result === "timeout") {
    return {
      riskLevel: "yellow",
      indicators: [],
      reasoning: "Classifier timed out; defaulting to elevated caution.",
    };
  }

  const out = result.output;
  if (!out) {
    return {
      riskLevel: "yellow",
      indicators: [],
      reasoning: "Classifier returned no structured output; defaulting to caution.",
    };
  }
  return out;
}
