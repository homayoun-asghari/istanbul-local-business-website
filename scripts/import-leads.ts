/**
 * One-off convenience: `npm run leads:import [file.csv]`. The studio's paste box does the
 * same thing — this exists so a fresh database can be filled from the sheet in one step.
 */
import { readFile } from "node:fs/promises";
import { leadsFromCsv } from "../lib/leads/csv";
import { importLeads } from "../lib/db/leads";

async function main() {
  const file = process.argv[2] ?? "leads.csv";
  const { leads, skipped } = leadsFromCsv(await readFile(file, "utf8"));
  const { imported } = await importLeads(leads);

  const byIndustry = leads.reduce<Record<string, number>>((counts, lead) => {
    counts[lead.industry] = (counts[lead.industry] ?? 0) + 1;
    return counts;
  }, {});

  console.log(
    `imported ${imported} leads from ${file}${skipped ? ` (${skipped} blank rows skipped)` : ""}`,
  );
  for (const [industry, count] of Object.entries(byIndustry).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${industry.padEnd(8)} ${count}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
