#!/usr/bin/env tsx
/**
 * Export SME/user corrections as JSONL for offline DPO/SFT.
 * Usage: npm run export:corrections [-- --userId=...]
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { listAllCorrections } from "@/lib/personalization/corrections-store";
import { scrubCorrectionText } from "@/lib/personalization/scrub-evidence";

function parseArgs() {
  const userIdArg = process.argv.find((a) => a.startsWith("--userId="));
  return { userId: userIdArg?.split("=")[1] };
}

async function main() {
  const { userId } = parseArgs();
  let rows = await listAllCorrections(5000);
  if (userId) rows = rows.filter((r) => r.userId === userId);

  const date = new Date().toISOString().slice(0, 10);
  const outDir = path.resolve(process.cwd(), "exports/corrections");
  mkdirSync(outDir, { recursive: true });
  const jsonlPath = path.join(outDir, `v${date}.jsonl`);
  const manifestPath = path.join(outDir, `v${date}-manifest.json`);

  const lines: string[] = [];
  const smeIds = new Set<string>();
  let dpoCount = 0;
  let prefCount = 0;

  for (const row of rows) {
    smeIds.add(row.smeId);
    const original = scrubCorrectionText(row.originalContent);
    const corrected = scrubCorrectionText(row.correctedContent);

    if (row.action === "edit" || row.action === "counter_example") {
      dpoCount++;
      lines.push(
        JSON.stringify({
          type: "dpo",
          action: row.action,
          prompt: `[personalization_correction] target=${row.targetType}`,
          chosen: corrected,
          rejected: original,
          reasonCode: row.reasonCode,
          smeId: row.smeId,
          createdAt: row.createdAt?.toISOString?.() ?? null,
        }),
      );
    } else if (row.action === "accept" || row.action === "reject") {
      prefCount++;
      lines.push(
        JSON.stringify({
          type: "preference",
          action: row.action,
          content: original,
          reasonCode: row.reasonCode,
          rationale: scrubCorrectionText(row.rationale),
          smeId: row.smeId,
          createdAt: row.createdAt?.toISOString?.() ?? null,
        }),
      );
    }
  }

  writeFileSync(jsonlPath, `${lines.join("\n")}\n`, "utf8");
  writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        totalRows: rows.length,
        dpoPairs: dpoCount,
        preferenceRecords: prefCount,
        smeIds: [...smeIds],
        userFilter: userId ?? null,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`Wrote ${lines.length} records to ${jsonlPath}`);
  console.log(`Manifest: ${manifestPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
