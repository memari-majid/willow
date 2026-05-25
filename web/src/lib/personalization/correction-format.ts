import type { UserInferenceRow } from "@/lib/personalization/inference-store";

const MAX_CHARS = 2400;

function truncateBlock(lines: string[]): string {
  let out = lines.join("\n");
  if (out.length <= MAX_CHARS) return out;
  return `${out.slice(0, MAX_CHARS)}…`;
}

export function formatCorrectionsBlockFromParts(parts: {
  avoid: string[];
  prefer: string[];
  examples: string[];
}): string {
  if (!parts.avoid.length && !parts.prefer.length && !parts.examples.length) {
    return "";
  }
  const lines = ["<personalization_corrections>"];
  if (parts.avoid.length) {
    lines.push("## Avoid (expert and user corrections)");
    lines.push(...parts.avoid.map((a) => `- ${a}`));
  }
  if (parts.prefer.length) {
    lines.push("## Prefer");
    lines.push(...parts.prefer.map((p) => `- ${p}`));
  }
  if (parts.examples.length) {
    lines.push("## Micro-examples");
    lines.push(...parts.examples.map((e) => `- ${e}`));
  }
  lines.push("</personalization_corrections>");
  return truncateBlock(lines);
}

export function buildConfirmedInferencesBlock(
  inferences: UserInferenceRow[],
): string {
  const active = inferences.filter(
    (i) =>
      i.state === "user_confirmed" ||
      i.state === "sme_confirmed" ||
      i.state === "edited",
  );
  if (!active.length) return "";
  const lines = [
    "<confirmed_inferences>",
    ...active.map((i) => `- [${i.kind}] ${i.claim}`),
    "</confirmed_inferences>",
  ];
  return lines.join("\n");
}
