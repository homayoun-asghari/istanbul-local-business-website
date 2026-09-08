import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { presetFor } from "@/packs/registry";
import { HeroActions, OpenNow, RatingLine, SalonNav, Words } from "./shared";
import { ScrollScene } from "../ScrollScene";

/**
 * 02 Gece — the KOSA canvas.
 *
 * The photograph is the whole page. A slow drift keeps it alive without asking for
 * attention, thin letterspaced capitals sit centred over it, and the salon's own name is
 * ghosted enormous across the lower third. Darkness and a warm grade are also the most
 * forgiving treatment of a mediocre photograph, which matters for these leads.
 */
export function Gece({
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
  return (
    <ScrollScene
      className="relative min-h-[86vh] overflow-hidden"
      style={{ background: "var(--ground)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        className="salon-drift scene-bg absolute inset-0 h-full w-full object-cover opacity-80"
        loading="eager"
        decoding="async"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg,rgba(13,14,13,.72) 0%,rgba(13,14,13,.28) 34%,rgba(13,14,13,.55) 72%,rgba(13,14,13,.94) 100%)",
        }}
      />

      <p
        aria-hidden="true"
        className="font-display scene-ghost pointer-events-none absolute inset-x-0 bottom-[6%] m-0 text-center leading-[0.78] tracking-[0.06em] text-white/[0.07]"
        style={{ fontSize: "clamp(76px,15vw,210px)" }}
      >
        {content.business.name.split(/\s+/)[0].toLocaleUpperCase("tr-TR")}
      </p>

      <div className="relative z-20 flex min-h-[86vh] flex-col">
        <SalonNav content={content} dark />
        <div className="scene-copy-fade flex flex-1 flex-col items-center justify-center px-[clamp(20px,5vw,60px)] text-center">
          <p
            className="salon-word m-0 text-[11px] tracking-[0.28em] uppercase opacity-70"
            style={{ ["--i" as string]: 0 }}
          >
            {content.business.neighborhood} · {content.business.district}
          </p>
          <h1 className="font-display mt-6 mb-0 text-[clamp(28px,5.4vw,62px)] leading-[1.06] tracking-[0.14em] uppercase">
            <Words text={section.headline} />
          </h1>
          <p
            className="salon-word mt-6 mb-0 max-w-[46ch] text-[15px] leading-relaxed opacity-75"
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
    </ScrollScene>
  );
}
