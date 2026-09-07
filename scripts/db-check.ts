/** Prints what is actually in the database. Proof, not assertion. */
import { db } from "../lib/db/client";
import { sites } from "../lib/db/schema";
import { SiteContentSchema } from "../lib/content/schema";

async function main() {
  const rows = await db().select().from(sites);
  if (rows.length === 0) {
    console.log("no sites — run: npm run db:seed");
    return;
  }
  for (const row of rows) {
    const parsed = SiteContentSchema.safeParse(row.content);
    const sections = parsed.success ? parsed.data.sections.length : "INVALID";
    console.log(
      `/${row.slug}  status=${row.status}  pack=${row.pack}  preset=${row.preset}  sections=${sections}  valid=${parsed.success}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
