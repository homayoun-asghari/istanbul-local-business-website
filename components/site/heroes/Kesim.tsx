import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { presetFor } from "@/packs/registry";
import { HeroActions, OpenNow, RatingLine, SalonNav } from "./shared";
import { ScrollScene } from "../ScrollScene";

/**
 * 01 Kesim — the UNICKA hero.
 *
 * Three layers and only three: the salon's name set enormous and sitting *behind* the
 * subject, the subject herself, and a letterspaced second word drawn over her.
 *
 * The earlier version drew the lower half of the big word back over her body, which put
 * a hard horizontal seam across every letter that crossed her — the word looked cut in
 * half rather than layered. The reference does no such thing: the word simply passes
 * behind her, and the only thing in front is SALON, which stays readable over her black
 * dress because it carries an outline in the page's own ground colour.
 *
 * The photograph keeps its own studio backdrop, flattened to exactly --ground, so the
 * image has no visible edge and no transparency is needed. See work notes in
 * docs/DECISIONS.md.
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
  const letters = [...word];

  // The word has to span the frame whatever the business is called, so it is sized from
  // its own length: roughly 84% of the viewport divided by the letters in it. Long names
  // get smaller type rather than an overflowing line.
  const vw = Math.min(24, 140 / Math.max(letters.length, 3));

  return (
    <ScrollScene className="relative overflow-hidden" style={{ background: "var(--ground)" }}>
      <SalonNav content={content} cta={false} />

      {/* The word's size is published to the stage so SALON can be placed relative to
          it — the two have to stay in the same relationship at every viewport. */}
      <div
        className="kesim-stage"
        style={{ ["--kesim-word" as string]: `clamp(64px, ${vw.toFixed(2)}vw, 350px)` }}
      >
        <p aria-hidden="true" className="kesim-word font-display">
          {letters.map((letter, index) => (
            <span key={`${letter}-${index}`} style={{ ["--i" as string]: index }}>
              {letter}
            </span>
          ))}
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          className="kesim-subject"
          loading="eager"
          decoding="async"
        />

        <p aria-hidden="true" className="kesim-sub font-display">
          SALON
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
