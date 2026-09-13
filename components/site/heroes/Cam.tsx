import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { telHref, whatsappHref } from "@/lib/content/schema";
import { presetFor } from "@/packs/registry";
import { ScrollScene } from "../ScrollScene";
import { OpenNow } from "./shared";
import { formatPhone } from "../Cta";

/**
 * 01 Cam — the Celestia hero, measured off the reference rather than approximated.
 *
 * Three columns around a central object: the promise on the left, a glass molar in the
 * middle, the clinic and its appointment button on the right, and the clinic's own name
 * ghosted enormous across the base, clipped by the card's bottom edge.
 *
 * The proportions are all fractions of the card's width, taken from the reference frame:
 * both headings are 5% of it and the same size as each other, the molar is 50% of it and
 * overlaps the headline rather than clearing it, and the ghost is 9.5%. Getting those
 * three relationships wrong is what made the first pass read as a smaller, politer
 * version of the same layout.
 *
 * There are no treatment tiles here. The reference puts them in their own section, and
 * crowding them into the hero is what forced everything above them to shrink.
 */
const NAV: [href: string, label: string, section: SiteContent["sections"][number]["type"]][] = [
  ["#klinik", "Kliniğimiz", "clinic"],
  ["#tedaviler", "Tedaviler", "treatments"],
  ["#hekimler", "Hekimlerimiz", "team"],
  ["#plan", "Tedavi planı", "planner"],
  ["#oncesi-sonrasi", "Öncesi / Sonrası", "beforeAfter"],
];

export function Cam({
  section,
  content,
  now,
}: {
  section: SectionOf<"hero">;
  content: SiteContent;
  now: Date;
}) {
  const stock = presetFor(content).stock;
  const molar = stock
    ? { src: stock.hero, alt: stock.heroAlt }
    : { src: section.image.src, alt: section.image.alt };
  const present = new Set(content.sections.map((s) => s.type));
  const links = NAV.filter(([, , type]) => present.has(type));
  const { business } = content;

  return (
    <ScrollScene className="cam-hero">
      <span aria-hidden="true" className="cam-glow" />

      <header className="cam-nav">
        <a href="#" className="cam-brand">
          <ToothMark />
          <span>{business.name}</span>
        </a>
        <nav className="cam-links">
          {links.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a href="#iletisim" className="cam-contact">
          İletişim
        </a>
      </header>

      <div className="cam-stage">
        <div className="cam-left scene-copy">
          <h1 className="cam-h1">{section.headline}</h1>
          <p className="cam-lede">{section.subline}</p>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={molar.src}
          alt={molar.alt}
          className="cam-molar"
          loading="eager"
          decoding="async"
        />

        <div className="cam-right scene-copy">
          <h2 className="cam-h2">
            {business.district}’de
            <br />
            ağız ve diş sağlığı
          </h2>
          <div className="cam-actions">
            <a
              href={whatsappHref(content)}
              target="_blank"
              rel="noopener noreferrer"
              data-cta="whatsapp"
              className="cam-cta"
            >
              <CalendarMark />
              Randevu alın
            </a>
            <a href={telHref(business)} data-cta="call" className="cam-call">
              {formatPhone(business.phone)}
            </a>
          </div>
          <div className="cam-open">
            <OpenNow content={content} now={now} />
          </div>
        </div>

        <p aria-hidden="true" className="cam-ghost">
          {business.name} · {business.neighborhood}, {business.district}
        </p>
      </div>
    </ScrollScene>
  );
}

/** Drawn rather than loaded, so it takes the preset's brand colour and costs no request. */
function ToothMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path
        d="M13 3.4c-2.2 0-3 .9-5 .9S4.2 3.6 3.3 5.2c-1 1.9-.4 5.1.6 8.1 1 3 2 6.6 3.6 8.3 1.3 1.4 2.6.4 3.1-1.5.4-1.6.6-3.6 2.4-3.6s2 2 2.4 3.6c.5 1.9 1.8 2.9 3.1 1.5 1.6-1.7 2.6-5.3 3.6-8.3 1-3 1.6-6.2.6-8.1-.9-1.6-2.7-.9-4.7-.9s-2.8-.9-5-.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CalendarMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3.2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2 6.6h12M5.6 1.8v2.6M10.4 1.8v2.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
