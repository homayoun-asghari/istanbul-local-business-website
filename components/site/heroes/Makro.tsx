import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { presetFor } from "@/packs/registry";
import { HeroActions, OpenNow, RatingLine, SalonNav, Words } from "./shared";

/**
 * 04 Makro — the ATURA crop.
 *
 * An extreme close-up, never a wide shot, with a script word sitting directly above
 * letterspaced serif capitals. Built for the lazer epilasyon and kalıcı makyaj leads,
 * where the work photographs far better than the room does.
 */
export function Makro({
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
  const [first, ...rest] = section.headline.split(/\s+/);

  return (
    <section
      className="relative min-h-[84vh] overflow-hidden"
      style={{ background: "var(--ground)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        className="salon-drift absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg,rgba(12,8,4,.62) 0%,rgba(12,8,4,.14) 40%,rgba(12,8,4,.78) 100%)",
        }}
      />

      <div className="relative z-20 flex min-h-[84vh] flex-col">
        <SalonNav content={content} dark />
        <div className="flex flex-1 flex-col items-center justify-center px-[clamp(20px,5vw,60px)] text-center">
          {/* The script line — the beauty signature that none of the first ten had. */}
          <p
            className="salon-word m-0 text-[clamp(22px,3.4vw,38px)] italic leading-none text-[var(--brand)]"
            style={{ fontFamily: "var(--font-script)", ["--i" as string]: 0 }}
          >
            {first}
          </p>
          <h1 className="font-display mt-3 mb-0 text-[clamp(30px,6vw,72px)] leading-[1.02] tracking-[0.16em] uppercase">
            <Words text={rest.join(" ") || first} />
          </h1>
          <p
            className="salon-word mt-6 mb-0 max-w-[44ch] text-[15px] leading-relaxed opacity-80"
            style={{ ["--i" as string]: 5 }}
          >
            {section.subline}
          </p>
          <div className="mt-9">
            <HeroActions content={content} />
          </div>
          <div className="mt-7 flex flex-col items-center gap-2">
            <OpenNow content={content} now={now} />
            <RatingLine content={content} />
          </div>
        </div>
      </div>
    </section>
  );
}
