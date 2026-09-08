import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { presetFor } from "@/packs/registry";
import { HeroActions, OpenNow, RatingLine, SalonNav, Words } from "./shared";
import { ScrollScene } from "../ScrollScene";

/**
 * 05 Menü — half photograph, half price list.
 *
 * The only one of the six that answers an objection rather than making an impression.
 * Price opacity is the top complaint about this trade, and the full menu follows
 * immediately below in the pricelist section.
 */
export function Menu({
  section,
  content,
  now,
}: {
  section: SectionOf<"hero">;
  content: SiteContent;
  now: Date;
}) {
  const stock = presetFor(content).stock;
  const image = stock ? { src: stock.hero, alt: stock.heroAlt } : section.image;
  const prices = content.sections.find((s) => s.type === "pricelist");
  const preview = prices ? prices.items.slice(0, 5) : [];

  return (
    <ScrollScene className="relative" style={{ background: "var(--ground)" }}>
      <SalonNav content={content} />
      <div className="mx-auto grid max-w-[1180px] items-stretch gap-0 px-[clamp(20px,5vw,60px)] pb-14 md:grid-cols-[0.95fr_1.05fr] md:gap-14">
        <div className="relative order-2 md:order-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            className="salon-in scene-media rounded-edge h-[42vh] w-full object-cover md:h-[70vh]"
            style={{ ["--i" as string]: 1 }}
            loading="eager"
            decoding="async"
          />
        </div>

        <div className="scene-copy order-1 flex flex-col justify-center py-8 md:order-2 md:py-14">
          <p
            className="salon-word m-0 text-[11px] tracking-[0.2em] uppercase text-[var(--muted)]"
            style={{ ["--i" as string]: 0 }}
          >
            {content.business.neighborhood} · {content.business.district}
          </p>
          <h1 className="font-display mt-5 mb-0 text-[clamp(30px,4.6vw,52px)] leading-[1.08] tracking-[-0.012em]">
            <Words text={section.headline} />
          </h1>
          <p
            className="salon-word text-ink-soft mt-5 mb-0 max-w-[40ch] text-[15.5px] leading-relaxed"
            style={{ ["--i" as string]: 5 }}
          >
            {section.subline}
          </p>

          {preview.length > 0 ? (
            <ul className="mt-8 list-none p-0">
              {preview.map((item, index) => (
                <li
                  key={item.name}
                  className="salon-in border-line flex items-baseline gap-3 border-b py-2.5"
                  style={{ ["--i" as string]: 6 + index }}
                >
                  <span className="text-ink text-[14.5px]">{item.name}</span>
                  <span className="border-line mx-1 min-w-4 flex-1 border-b border-dotted" />
                  <span className="font-display text-ink text-[14.5px] tabular-nums">
                    {item.price}
                  </span>
                </li>
              ))}
              <li className="pt-3">
                <a href="#fiyatlar" className="text-brand text-[13px] underline underline-offset-4">
                  Tüm fiyat listesi →
                </a>
              </li>
            </ul>
          ) : null}

          <div className="mt-8">
            <HeroActions content={content} />
          </div>
          <div className="text-ink-soft mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <OpenNow content={content} now={now} />
            <RatingLine content={content} />
          </div>
        </div>
      </div>
    </ScrollScene>
  );
}
