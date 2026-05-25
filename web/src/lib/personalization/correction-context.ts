import {
  listRecentCorrectionsForPrompt,
} from "@/lib/personalization/corrections-store";
import { listRejectedInferences } from "@/lib/personalization/inference-store";
import { scrubCorrectionText } from "@/lib/personalization/scrub-evidence";
import { formatCorrectionsBlockFromParts } from "@/lib/personalization/correction-format";

export {
  buildConfirmedInferencesBlock,
  formatCorrectionsBlockFromParts,
} from "@/lib/personalization/correction-format";

export async function buildPersonalizationCorrectionsBlock(
  userId: string,
): Promise<string> {
  const [rejected, corrections] = await Promise.all([
    listRejectedInferences(userId),
    listRecentCorrectionsForPrompt(userId, 12),
  ]);

  const avoid: string[] = [];
  for (const inf of rejected) {
    avoid.push(`Do not assume: "${scrubCorrectionText(inf.claim)}"`);
  }

  const prefer: string[] = [];
  const examples: string[] = [];

  for (const c of corrections) {
    if (c.action === "reject" && c.originalContent) {
      avoid.push(`Avoid: ${scrubCorrectionText(c.originalContent)}`);
      if (c.reasonCode) avoid.push(`(reason: ${c.reasonCode})`);
    }
    if (c.action === "edit" && c.correctedContent) {
      prefer.push(`Prefer: ${scrubCorrectionText(c.correctedContent)}`);
    }
    if (c.action === "counter_example" && c.correctedContent) {
      examples.push(scrubCorrectionText(c.correctedContent));
    }
    if (c.action === "accept" && c.originalContent) {
      prefer.push(`Confirmed: ${scrubCorrectionText(c.originalContent)}`);
    }
  }

  return formatCorrectionsBlockFromParts({ avoid, prefer, examples });
}
