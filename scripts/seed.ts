/**
 * Seeds the first demo. Idempotent: re-running updates the row rather than failing,
 * so it is safe to run after every content change while the studio does not exist yet.
 */
import { db } from "../lib/db/client";
import { sites } from "../lib/db/schema";
import { melike } from "../lib/content/fixtures/melike";
import { parseSiteContent } from "../lib/content/schema";

async function main() {
  const content = parseSiteContent(melike);

  await db()
    .insert(sites)
    .values({
      slug: content.slug,
      pack: content.pack,
      preset: content.preset,
      content,
      status: "published",
    })
    .onConflictDoUpdate({
      target: sites.slug,
      set: {
        pack: content.pack,
        preset: content.preset,
        content,
        status: "published",
        updatedAt: new Date(),
      },
    });

  console.log(`seeded /${content.slug} — ${content.business.name} (published)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
