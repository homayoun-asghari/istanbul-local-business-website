import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { presetFor } from "@/packs/registry";
import { HeroActions, OpenNow, RatingLine, SalonNav } from "./shared";
import { ScrollScene } from "../ScrollScene";

/**
 * 01 Kesim — the UNICKA hero.
 *
 * The name is woven through the subject rather than laid behind her. In the reference
 * the A of BEAUTY crosses in front of the model's sleeve while the U immediately after
 * it disappears behind her body; that one detail is what gives the composition depth,
 * and it is the whole trick. The first half of the letters is in front of her, the
 * second half behind, and because she stands in the middle the changeover always lands
 * on her — so the word reads as passing around a person rather than stacked with one.
 *
 * It is drawn as two identical copies of the word, one in front of the photograph and
 * one behind it, each hiding the half that belongs to the other. Identical layout in
 * both means the letters line up exactly; `visibility: hidden` keeps the metrics.
 *
 * SALON blends rather than outlines: `mix-blend-mode: difference` against the ground
 * colour renders pure black over the beige and the beige itself over her black dress,
 * which is precisely the two-tone the reference has.
 *
 * The photograph keeps its own studio backdrop, flattened to exactly --ground, so it
 * has no visible edge and needs no transparency. See docs/DECISIONS.md.
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
  const split = Math.ceil(letters.length / 2);

  const copy = (side: "front" | "back") => (
    <p aria-hidden="true" className={`kesim-word kesim-word-${side} font-display`}>
      {letters.map((letter, index) => {
        const belongsHere = side === "front" ? index < split : index >= split;
        return (
          <span
            key={`${letter}-${index}`}
            className={belongsHere ? undefined : "kesim-ghost"}
            style={{ ["--i" as string]: index }}
          >
            {letter}
          </span>
        );
      })}
    </p>
  );

  return (
    <ScrollScene className="relative overflow-hidden" style={{ background: "var(--ground)" }}>
      <SalonNav content={content} cta={false} />

      {/* The word's size is published to the stage so SALON can be placed relative to
          it — the two have to stay in the same relationship at every viewport. */}
      <div
        className="kesim-stage"
        style={{ ["--kesim-word" as string]: `clamp(64px, ${vw.toFixed(2)}vw, 350px)` }}
      >
        <h1 className="sr-only">{section.headline}</h1>

        {copy("back")}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          className="kesim-subject"
          loading="eager"
          decoding="async"
        />

        {copy("front")}

        <p aria-hidden="true" className="kesim-sub">
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
