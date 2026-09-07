import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Site } from "@/components/site/Site";
import { getPublishedSite } from "@/lib/db/sites";
import { NOINDEX } from "@/lib/content/seo";

// Cached for a minute, then regenerated. Keeps the demo fast when Neon's free tier has
// gone to sleep, without letting the "şu an açık" state drift for long.
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPublishedSite(slug);
  if (!content) return { title: "Bulunamadı" };
  return {
    title: content.seo.title,
    description: content.seo.description,
    robots: NOINDEX,
    openGraph: {
      title: content.seo.title,
      description: content.seo.description,
      locale: "tr_TR",
      type: "website",
    },
  };
}

export default async function DemoPage({ params, searchParams }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const content = await getPublishedSite(slug);
  if (!content) notFound();

  // ?preset=krom renders this business in another template without saving anything.
  // It is how a template gets judged on a real business before being assigned.
  const { preset } = await searchParams;
  const previewing = typeof preset === "string" && preset.length > 0;

  return (
    <Site
      content={previewing ? { ...content, preset } : content}
      now={new Date()}
      trackAs={previewing ? undefined : slug}
    />
  );
}
