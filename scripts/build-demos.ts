/**
 * `npm run demos:build` — turns every lead that has a pack and complete facts into a
 * published demo. The studio's one-click button does the same for a single lead; this
 * exists so a fresh database has something to show immediately.
 */
import { listLeads, setLeadStatus } from "../lib/db/leads";
import { createSite } from "../lib/db/sites";
import { packForIndustry } from "../packs/registry";
import { IncompleteLeadError } from "../packs/build";
import { SiteContentSchema } from "../lib/content/schema";

async function main() {
  const leads = await listLeads();
  let built = 0;
  const skipped: string[] = [];

  for (const lead of leads) {
    const pack = packForIndustry(lead.industry);
    if (!pack) {
      skipped.push(`${lead.business} — "${lead.industry}" için paket yok`);
      continue;
    }
    try {
      // Spread the looks deterministically. Sending three Bakırköy salons the same
      // layout in one week is exactly how a demo reads as a reused template.
      const presets = Object.keys(pack.presets);
      const seed = [...lead.slug].reduce((sum, character) => sum + character.charCodeAt(0), 0);
      const preset = pack.pickPreset?.(lead) ?? presets[seed % presets.length];
      const content = SiteContentSchema.parse(pack.build(lead, preset));
      await createSite(content);
      await setLeadStatus(lead.id, "published");
      built++;
    } catch (error) {
      skipped.push(
        `${lead.business} — ${error instanceof IncompleteLeadError ? error.message : String(error)}`,
      );
    }
  }

  console.log(`built ${built} demos`);
  if (skipped.length > 0) {
    console.log(`skipped ${skipped.length}:`);
    for (const line of skipped) console.log(`  ${line}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
