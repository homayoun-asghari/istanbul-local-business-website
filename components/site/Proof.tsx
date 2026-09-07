import type { SiteContent } from "@/lib/content/schema";
import { formatCount, formatRating } from "@/lib/content/schema";
import { Container } from "./primitives";

/**
 * The single most persuasive block on the page, and the only one that is entirely
 * verifiable by the owner in ten seconds. It gets the boldest treatment on the site;
 * everything around it stays quiet.
 */
export function Proof({ content }: { content: SiteContent }) {
  const { business } = content;
  const figures = [
    { value: formatRating(business.rating), label: "Google puanı", star: true },
    { value: formatCount(business.reviewCount), label: "değerlendirme" },
    { value: `%${business.fiveStarPct}`, label: "beş yıldız" },
    { value: business.district, label: business.neighborhood },
  ];

  return (
    <section className="bg-brand text-brand-ink">
      <Container className="py-10 md:py-14">
        <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-4">
          {figures.map((f) => (
            <div key={f.label}>
              <dt className="sr-only">{f.label}</dt>
              <dd className="font-display m-0 flex items-baseline gap-1.5 text-[clamp(2rem,5vw,3.25rem)] leading-none font-normal">
                {f.value}
                {f.star ? (
                  <span aria-hidden="true" className="text-accent text-[0.5em] leading-none">
                    ★
                  </span>
                ) : null}
              </dd>
              <p className="mt-2.5 mb-0 text-[12px] font-medium tracking-[0.14em] uppercase opacity-70">
                {f.label}
              </p>
            </div>
          ))}
        </dl>
        <p className="mt-9 mb-0 text-[13px] opacity-70">
          Google Haritalar üzerindeki güncel değerlendirmelerimizden alınmıştır.
        </p>
      </Container>
    </section>
  );
}
