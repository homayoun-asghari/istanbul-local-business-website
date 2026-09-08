import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { presetFor } from "@/packs/registry";
import { HeroActions, OpenNow, RatingLine, SalonNav, Words } from "./shared";

/**
 * 06 Sade — the quietest of the six, and the only one whose palette and typefaces were
 * read off a live site rather than invented: Marcellus and DM Sans on #FAF5F3 with
 * #5D3222, taken from sailon.bravisthemes.com.
 *
 * Needs only one good photograph, which matters when a lead's listing has three.
 */
export function Sade({
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
  const strip = (stock?.tiles ?? []).slice(0, 3);

  return (
    <section className="relative" style={{ background: "var(--ground)" }}>
      <SalonNav content={content} />
      <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-[clamp(20px,5vw,60px)] pt-4 pb-16 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:pb-24">
        <div>
          <p
            className="salon-word m-0 text-[11px] tracking-[0.22em] uppercase text-[var(--muted)]"
            style={{ ["--i" as string]: 0 }}
          >
            {content.business.neighborhood} · {content.business.district}
          </p>
          <h1 className="font-display mt-6 mb-0 text-[clamp(34px,5.6vw,64px)] leading-[1.05] tracking-[-0.015em]">
            <Words text={section.headline} />
          </h1>
          <span
            aria-hidden="true"
            className="salon-rule mt-7 block h-px w-24 bg-[var(--brand)] opacity-40"
          />
          <p
            className="salon-word text-ink-soft mt-7 mb-0 max-w-[40ch] text-[16px] leading-[1.75]"
            style={{ ["--i" as string]: 6 }}
          >
            {section.subline}
          </p>
          <div className="mt-9">
            <HeroActions content={content} />
          </div>
          <div className="text-ink-soft mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <OpenNow content={content} now={now} />
            <RatingLine content={content} />
          </div>

          {strip.length > 0 ? (
            <div className="mt-10 flex gap-3">
              {strip.map((image, index) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={image + index}
                  src={image}
                  alt=""
                  className="salon-word rounded-edge h-20 w-20 object-cover sm:h-24 sm:w-24"
                  style={{ ["--i" as string]: 8 + index }}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          className="salon-word h-[48vh] w-full object-cover md:h-[72vh]"
          style={{ borderRadius: "220px 220px 22px 22px", ["--i" as string]: 2 }}
          loading="eager"
          decoding="async"
        />
      </div>
    </section>
  );
}
