import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { presetFor } from "@/packs/registry";
import { HeroActions, OpenNow, RatingLine, SalonNav } from "./shared";
import { ScrollScene } from "../ScrollScene";

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
    <ScrollScene className="relative overflow-hidden" style={{ background: "var(--ground)" }}>
      <SalonNav content={content} />

      <p
        className="salon-word m-0 px-[clamp(20px,5vw,60px)] pt-2 text-[11px] tracking-[0.22em] uppercase text-[var(--muted)]"
        style={{ ["--i" as string]: 0 }}
      >
        {content.business.neighborhood} · {content.business.district}
      </p>

      {/*
        The interleave, in one grid cell so the word and the subject share an axis.
        Three layers: the word, the subject on her own matching ground, then the word
        again clipped so its lower half draws back over her body.
      */}
      <div className="relative mx-auto grid w-full max-w-[1180px] place-items-center px-[clamp(20px,5vw,60px)] pb-8">
        <p
          aria-hidden="true"
          className="salon-word scene-word font-display pointer-events-none col-start-1 row-start-1 m-0 self-center text-center leading-[0.78] tracking-[-0.035em] text-[var(--brand)]"
          style={{ fontSize: "clamp(64px,14.5vw,196px)", ["--i" as string]: 0 }}
        >
          {word}
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          className="salon-in scene-subject col-start-1 row-start-1 block h-[54vh] w-auto self-end object-contain md:h-[66vh]"
          style={{ ["--i" as string]: 2 }}
          loading="eager"
          decoding="async"
        />

        <p
          aria-hidden="true"
          className="salon-word scene-word font-display pointer-events-none col-start-1 row-start-1 m-0 self-center text-center leading-[0.78] tracking-[-0.035em] text-[var(--brand)]"
          style={{
            fontSize: "clamp(64px,14.5vw,196px)",
            clipPath: "inset(52% 0 0 0)",
            ["--i" as string]: 0,
          }}
        >
          {word}
        </p>
      </div>

      <div className="border-line relative z-40 mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-6 border-t px-[clamp(20px,5vw,60px)] py-6">
        <div className="flex max-w-[46ch] flex-col gap-2">
          <p className="text-ink-soft m-0 text-[14px] leading-relaxed">{section.subline}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1">
            <OpenNow content={content} now={now} />
            <RatingLine content={content} />
          </div>
        </div>
        <HeroActions content={content} />
      </div>
    </ScrollScene>
  );
}
