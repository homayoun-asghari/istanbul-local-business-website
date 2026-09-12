import type { SiteContent } from "@/lib/content/schema";
import { Container } from "./primitives";
import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";

/**
 * The single most persuasive block on the page, and the only one that is entirely
 * verifiable by the owner in ten seconds. It gets the boldest treatment on the site;
 * everything around it stays quiet.
 */
export function Proof({ content }: { content: SiteContent }) {
  const { business } = content;
  const figures: {
    label: string;
    star?: boolean;
    count?: { value: number; kind: "rating" | "count" | "percent" };
    text?: string;
  }[] = [
    { count: { value: business.rating ?? 0, kind: "rating" }, label: "Google puanı", star: true },
    { count: { value: business.reviewCount ?? 0, kind: "count" }, label: "değerlendirme" },
    { count: { value: business.fiveStarPct ?? 0, kind: "percent" }, label: "beş yıldız" },
    { text: business.district, label: business.neighborhood },
  ];

  return (
    <section className="bg-brand text-brand-ink">
      <Container className="py-10 md:py-14">
        <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-4">
          {figures.map((f, index) => (
            <Reveal key={f.label} delay={index * 90}>
              <dt className="sr-only">{f.label}</dt>
              <dd className="font-display m-0 flex items-baseline gap-1.5 text-[clamp(2rem,5vw,3.25rem)] leading-none font-normal tabular-nums">
                {f.count ? <CountUp value={f.count.value} kind={f.count.kind} /> : f.text}
                {f.star ? (
                  <span aria-hidden="true" className="text-accent text-[0.5em] leading-none">
                    ★
                  </span>
                ) : null}
              </dd>
              <p className="mt-2.5 mb-0 text-[12px] font-medium tracking-[0.14em] uppercase opacity-70">
                {f.label}
              </p>
            </Reveal>
          ))}
        </dl>
        <p className="mt-9 mb-0 text-[13px] opacity-70">
          Google Haritalar üzerindeki güncel değerlendirmelerimizden alınmıştır.
        </p>
      </Container>
    </section>
  );
}
