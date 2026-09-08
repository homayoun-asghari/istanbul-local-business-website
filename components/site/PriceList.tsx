import type { SectionOf } from "@/lib/content/schema";
import { Container, Eyebrow, SectionHeading } from "./primitives";
import { Reveal } from "./Reveal";

/**
 * The price menu, read off ATURA: round thumbnail, service, a dotted leader running
 * across, then the price. Every salon theme publishes prices; none of the first ten
 * templates did.
 */
export function PriceList({ section }: { section: SectionOf<"pricelist"> }) {
  return (
    <section id="fiyatlar" className="py-16 md:py-24">
      <Container>
        <Reveal>
          <Eyebrow>Fiyat listesi</Eyebrow>
          <div className="mt-4">
            <SectionHeading>{section.title}</SectionHeading>
          </div>
          {section.intro ? (
            <p className="text-ink-soft mt-4 mb-0 max-w-[52ch] leading-relaxed">{section.intro}</p>
          ) : null}
        </Reveal>

        <ul className="mt-10 grid list-none gap-x-14 p-0 md:grid-cols-2">
          {section.items.map((item, index) => (
            <Reveal as="li" key={item.name} delay={index * 55} className="m-0">
              <div className="border-line flex items-center gap-4 border-b py-4">
                {item.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.image.src}
                    alt={item.image.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="font-display text-ink m-0 text-[17px] leading-tight">{item.name}</p>
                  {item.description ? (
                    <p className="text-muted m-0 mt-1 text-[13px] leading-snug">
                      {item.description}
                    </p>
                  ) : null}
                </div>
                {/* The leader is a flexible border, so it stretches to whatever space is left. */}
                <span className="border-line mx-2 hidden min-w-6 flex-1 border-b border-dotted sm:block" />
                <div className="shrink-0 text-right">
                  <p className="font-display text-ink m-0 text-[17px] tabular-nums">{item.price}</p>
                  {item.duration ? (
                    <p className="text-muted m-0 text-[12px]">{item.duration}</p>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
