import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { isOpenNow, istanbulNow, openStateLabel } from "@/lib/content/hours";
import { presetFor } from "@/packs/registry";
import { Container } from "./primitives";
import { CallButton, WhatsAppButton } from "./Cta";
import { ChromeHero } from "./ChromeHero";
import { Kesim } from "./heroes/Kesim";
import { Gece } from "./heroes/Gece";
import { Kemer } from "./heroes/Kemer";
import { Makro } from "./heroes/Makro";
import { Menu } from "./heroes/Menu";
import { Sade } from "./heroes/Sade";

export function Hero({
  section,
  content,
  now,
}: {
  section: SectionOf<"hero">;
  content: SiteContent;
  now: Date;
}) {
  // A preset may replace the hero entirely rather than only recolour it.
  const variant = presetFor(content).hero;
  if (variant === "chrome") return <ChromeHero section={section} content={content} now={now} />;
  if (variant === "kesim") return <Kesim section={section} content={content} now={now} />;
  if (variant === "gece") return <Gece section={section} content={content} now={now} />;
  if (variant === "kemer") return <Kemer section={section} content={content} now={now} />;
  if (variant === "makro") return <Makro section={section} content={content} now={now} />;
  if (variant === "menu") return <Menu section={section} content={content} now={now} />;
  if (variant === "sade") return <Sade section={section} content={content} now={now} />;

  const { business } = content;
  const state = isOpenNow(content.hours, now);
  const label = openStateLabel(state, istanbulNow(now).day);

  return (
    <section className="border-line border-b">
      <Container className="grid items-center gap-10 py-12 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:py-20">
        {/* On a phone the photo comes first: the owner must see their own salon immediately. */}
        <div className="order-2 md:order-1">
          <p className="eyebrow m-0">
            {business.neighborhood} · {business.district}
          </p>
          <h1 className="font-display text-ink mt-5 mb-0 text-[clamp(2.25rem,6.5vw,4rem)] leading-[1.02] font-normal tracking-[-0.015em]">
            {section.headline}
          </h1>
          <p className="text-ink-soft mt-6 mb-0 max-w-[46ch] text-[1.0625rem] leading-relaxed">
            {section.subline}
          </p>

          <p className="mt-7 mb-0 flex items-center gap-2.5 text-[13px]">
            <span
              aria-hidden="true"
              className={`inline-block h-2 w-2 rounded-full ${state.open ? "bg-[#2F7A4F]" : "bg-muted"}`}
            />
            <span className={state.open ? "text-ink font-medium" : "text-muted"}>{label}</span>
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppButton content={content} label="WhatsApp’tan randevu al" />
            <CallButton business={business} />
          </div>
        </div>

        <div className="order-1 md:order-2">
          {/* Plain <img>: Vercel's Hobby plan meters image transformations, and Google
              already serves a correctly sized variant of this photo for free. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={section.image.src}
            alt={section.image.alt}
            width={section.image.width}
            height={section.image.height}
            className="rounded-edge h-[46vh] w-full object-cover md:h-[560px]"
            loading="eager"
            decoding="async"
          />
        </div>
      </Container>
    </section>
  );
}
