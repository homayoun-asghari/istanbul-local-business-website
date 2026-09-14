import Link from "next/link";
import { notFound } from "next/navigation";
import { getSite } from "@/lib/db/sites";
import { DAY_NAMES_TR } from "@/lib/content/hours";
import { DAY_KEYS } from "@/lib/content/schema";
import { PACKS } from "@/packs/registry";
import { EditorForm } from "./EditorForm";

export const dynamic = "force-dynamic";

export default async function EditSite({ params }: PageProps<"/studio/[slug]">) {
  const { slug } = await params;
  const site = await getSite(slug);
  if (!site) notFound();
  if (!site.content) {
    return (
      <>
        <h1>{slug}</h1>
        <p className="msg">Bu kaydın içeriği şemaya uymuyor. Veritabanından düzeltilmeli.</p>
      </>
    );
  }

  return (
    <EditorForm
      content={site.content}
      slug={slug}
      dayKeys={[...DAY_KEYS]}
      dayNames={DAY_NAMES_TR}
      // The site's own pack's templates. Listing the beauty ones for every site showed a
      // vet or dental page as "Kesim" and would have published it as a salon.
      presets={Object.values(PACKS[site.content.pack].presets).map((p) => ({
        id: p.id,
        label: p.label,
      }))}
      backLink={<Link href="/studio">← Tüm işletmeler</Link>}
    />
  );
}
