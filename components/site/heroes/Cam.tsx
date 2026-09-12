import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { telHref, whatsappHref } from "@/lib/content/schema";
import { presetFor } from "@/packs/registry";
import { ScrollScene } from "../ScrollScene";
import { OpenNow } from "./shared";
import { formatPhone } from "../Cta";

/**
 * 01 Cam — the Celestia hero.
 *
 * Three columns around a central object rather than a headline with a picture beside it:
 * the promise on the left, a glass molar in the middle, the clinic and its appointment
 * button on the right, and the clinic's own name ghosted across the base with the molar
 * standing in front of it.
 *
 * The molar is doing a job no photograph could do here. A dental lead arrives with one
 * storefront snap from Google Maps; it has no clinical photography, and a clinic that
 * has not consented to publish a patient's mouth cannot borrow one. A rendered object
 * belongs to the pack, ships with it, and needs nobody's permission.
 */

/** Only the sections this site actually has — a nav link that scrolls nowhere is worse
 *  than no nav link, and the dental pack's sections differ per lead. */
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
  const tiles = stock?.tiles ?? [];
  const treatments = content.sections.find((s) => s.type === "treatments");
  const present = new Set(content.sections.map((s) => s.type));
  const links = NAV.filter(([, , type]) => present.has(type));
  const { business } = content;

  return (
    <ScrollScene className="cam-scene">
      <span aria-hidden="true" className="cam-glow" />

      <div className="cam-card">
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
                WhatsApp’tan randevu al
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

        {tiles.length > 0 && treatments ? (
          <div className="cam-strip">
            {treatments.items.slice(0, 5).map((item, index) => (
              <a
                key={item.name}
                href="#tedaviler"
                className={`cam-tile${index === 2 ? " is-lifted" : ""}`}
                style={{ ["--i" as string]: index }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image.src} alt={item.image.alt} loading="lazy" decoding="async" />
                <b>{item.name}</b>
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </ScrollScene>
  );
}

/** Drawn rather than loaded, so it takes the preset's brand colour and costs no request. */
function ToothMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path
        d="M13 3.4c-2.2 0-3 .9-5 .9S4.2 3.6 3.3 5.2c-1 1.9-.4 5.1.6 8.1 1 3 2 6.6 3.6 8.3 1.3 1.4 2.6.4 3.1-1.5.4-1.6.6-3.6 2.4-3.6s2 2 2.4 3.6c.5 1.9 1.8 2.9 3.1 1.5 1.6-1.7 2.6-5.3 3.6-8.3 1-3 1.6-6.2.6-8.1-.9-1.6-2.7-.9-4.7-.9s-2.8-.9-5-.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CalendarMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
