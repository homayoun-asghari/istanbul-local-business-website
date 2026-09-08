import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { presetFor } from "@/packs/registry";
import { HeroActions, OpenNow, RatingLine, SalonNav, Words } from "./shared";

/**
 * 01 Kesim — the UNICKA interleave.
 *
 * The subject is layered INTO the headline: head and shoulders in front of the letters,
 * body behind them. Done with three layers rather than a cut-out PNG — the photograph
 * keeps its own flat ground, the section behind it uses the identical colour, and a
 * clipped copy of the word draws back over the lower body. No transparency needed, which
 * matters because a keyed-out edge on a low-resolution photo looks like a ransom note.
 */
export function Kesim({
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
  const word = content.business.name.split(/\s+/)[0].toLocaleUpperCase("tr-TR");

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--ground)" }}>
      <SalonNav content={content} />

      <div className="relative mx-auto min-h-[74vh] w-full max-w-[1180px] px-[clamp(20px,5vw,60px)] pb-10 md:min-h-[80vh]">
        {/* Layer 1 — the word, behind everything. */}
        <p
          aria-hidden="true"
          className="font-display pointer-events-none absolute inset-x-0 top-[38%] z-10 m-0 text-center leading-[0.8] tracking-[-0.03em] text-[var(--brand)] salon-word"
          style={{ fontSize: "clamp(72px,17vw,232px)", ["--i" as string]: 0 }}
        >
          {word}
        </p>

        {/* Layer 2 — the subject, on her own matching ground. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          className="salon-word relative z-20 mx-auto block h-[52vh] w-auto object-contain object-bottom md:h-[62vh]"
          style={{ ["--i" as string]: 2 }}
          loading="eager"
          decoding="async"
        />

        {/* Layer 3 — the same word again, clipped so its lower half draws over her body. */}
        <p
          aria-hidden="true"
          className="font-display pointer-events-none absolute inset-x-0 top-[38%] z-30 m-0 text-center leading-[0.8] tracking-[-0.03em] text-[var(--brand)] salon-word"
          style={{
            fontSize: "clamp(72px,17vw,232px)",
            clipPath: "inset(46% 0 0 0)",
            ["--i" as string]: 0,
          }}
        >
          {word}
        </p>

        <p
          className="font-display absolute inset-x-0 top-[66%] z-40 m-0 text-center text-[clamp(13px,2.2vw,26px)] tracking-[0.42em] salon-word"
          style={{ ["--i" as string]: 4 }}
        >
          {section.subline}
        </p>
      </div>

      <div className="border-line relative z-40 mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-6 border-t px-[clamp(20px,5vw,60px)] py-6">
        <div className="flex flex-col gap-2">
          <OpenNow content={content} now={now} />
          <RatingLine content={content} />
        </div>
        <HeroActions content={content} />
      </div>
    </section>
  );
}
