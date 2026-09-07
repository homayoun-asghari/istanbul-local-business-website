import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Site } from "@/components/site/Site";
import { getPublishedSite } from "@/lib/db/sites";

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
    robots: { index: false, follow: false, nocache: true },
    openGraph: {
      title: content.seo.title,
      description: content.seo.description,
      locale: "tr_TR",
      type: "website",
    },
  };
}

export default async function DemoPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const content = await getPublishedSite(slug);
  if (!content) notFound();
  return <Site content={content} now={new Date()} />;
}
