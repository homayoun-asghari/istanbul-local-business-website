import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { formatCount } from "@/lib/content/schema";
import { presetFor } from "@/packs/registry";
import { HeroActions, OpenNow, SalonNav, Words } from "./shared";

/**
 * 03 Kemer — the GLOWRIA collage.
 *
 * Two-tone heading, roman then italic. The portrait is masked into an arch, small photos
 * and stat cards sit around it, and a cluster of round avatars carries the proof. The
 * softest of the six and the easiest sell to an owner who finds the bold work aggressive.
 */
export function Kemer({
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
  const words = section.headline.split(/\s+/);
  const split = Math.max(1, Math.ceil(words.length / 2));
  const gallery = content.sections.find((s) => s.type === "gallery");
  const extras = gallery ? gallery.images.slice(0, 2) : [];

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--ground)" }}>
      {/* Botanical line work, drawn rather than loaded — one less file in the client repo. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 top-24 h-[420px] w-[420px] opacity-[0.16]"
        viewBox="0 0 200 200"
        fill="none"
        stroke="var(--brand)"
        strokeWidth="1"
      >
        <path d="M100 190C100 120 70 80 30 55M100 190c0-70 30-110 70-135" />
        <ellipse cx="52" cy="70" rx="26" ry="12" transform="rotate(-32 52 70)" />
        <ellipse cx="150" cy="70" rx="26" ry="12" transform="rotate(32 150 70)" />
        <ellipse cx="74" cy="118" rx="22" ry="10" transform="rotate(-24 74 118)" />
        <ellipse cx="128" cy="118" rx="22" ry="10" transform="rotate(24 128 118)" />
      </svg>

      <SalonNav content={content} />

      <div className="relative mx-auto grid max-w-[1180px] items-center gap-10 px-[clamp(20px,5vw,60px)] pt-6 pb-14 md:grid-cols-[1fr_1fr] md:gap-14 md:pt-10 md:pb-20">
        <div>
          <p
            className="salon-word m-0 text-[11px] tracking-[0.2em] uppercase text-[var(--muted)]"
            style={{ ["--i" as string]: 0 }}
          >
            {content.business.neighborhood} · {content.business.district}
          </p>
          <h1 className="font-display mt-5 mb-0 text-[clamp(34px,5.4vw,60px)] leading-[1.06] tracking-[-0.015em]">
            <Words text={words.slice(0, split).join(" ")} />
            <span className="block italic text-[var(--brand)]">
              <Words text={words.slice(split).join(" ")} />
            </span>
          </h1>
          <p
            className="salon-word text-ink-soft mt-6 mb-0 max-w-[38ch] text-[16px] leading-relaxed"
            style={{ ["--i" as string]: 6 }}
          >
            {section.subline}
          </p>
          <div className="mt-8">
            <HeroActions content={content} />
          </div>
          <div className="text-ink-soft mt-6">
            <OpenNow content={content} now={now} />
          </div>
        </div>

        <div className="relative">
          {/* The arch: a doorway, and the signature shape of this whole register. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            className="salon-word ml-auto block h-[46vh] w-full max-w-[420px] object-cover md:h-[62vh]"
            style={{ borderRadius: "50% 50% 18px 18px / 32% 32% 4% 4%", ["--i" as string]: 2 }}
            loading="eager"
            decoding="async"
          />

          {extras[0] ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={extras[0].src}
              alt={extras[0].alt}
              className="salon-word rounded-edge absolute -bottom-4 -left-2 hidden h-[168px] w-[188px] object-cover shadow-[0_18px_44px_rgba(45,20,10,.13)] sm:block"
              style={{ ["--i" as string]: 4 }}
              loading="lazy"
              decoding="async"
            />
          ) : null}

          <div
            className="salon-word bg-surface rounded-edge absolute top-[18%] -right-1 px-5 py-4 shadow-[0_14px_36px_rgba(45,20,10,.10)]"
            style={{ ["--i" as string]: 5 }}
          >
            <p className="font-display text-ink m-0 text-[26px] leading-none">
              {formatCount(content.business.reviewCount)}
            </p>
            <p className="text-muted m-0 mt-1 text-[11px] tracking-wide">değerlendirme</p>
          </div>

          <div
            className="salon-word bg-surface rounded-edge absolute -bottom-6 right-6 flex items-center gap-3 px-4 py-3 shadow-[0_14px_36px_rgba(45,20,10,.10)]"
            style={{ ["--i" as string]: 6 }}
          >
            <div className="flex -space-x-2.5">
              {["/stock/thumb-1.jpg", "/stock/thumb-4.jpg", "/stock/thumb-5.jpg"].map((src) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="border-surface h-8 w-8 rounded-full border-2 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
            <p className="text-ink m-0 text-[12.5px] leading-tight">
              %{content.business.fiveStarPct} beş yıldız
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
