import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { telHref, whatsappHref } from "@/lib/content/schema";
import { brandParts } from "@/lib/content/turkish";
import { presetFor } from "@/packs/registry";
import { ScrollScene } from "../ScrollScene";
import { OpenNow, Words, vetLinks } from "./shared";
import { PawMark, PhoneMark, VetIcon, WhatsAppGlyph } from "../VetIcons";

/**
 * 01 Güneş — after VetCare.
 *
 * Cream page, sunflower blobs that break out past the hero's edges, a white navigation
 * bar floating over them, and a person hugging their dog as the whole picture. Under it
 * the first four services sit as a line-icon strip on the hero's lower edge, which is
 * where VetCare puts its feature row.
 *
 * The load is Opet's: the page holds, the blob swells in, the figure rises into place,
 * the paw prints pop one after the other and the headline arrives word by word. On
 * scroll the blobs drift against the copy, driven by ScrollScene's --sy.
 */
export function Gunes({
  section,
  content,
  now,
}: {
  section: SectionOf<"hero">;
  content: SiteContent;
  now: Date;
}) {
  const stock = presetFor(content).stock;
  const figure = stock
    ? { src: stock.hero, alt: stock.heroAlt }
    : { src: section.image.src, alt: section.image.alt };
  const { business } = content;
  const [primary, secondary] = brandParts(business.name);
  const services = content.sections.find((s) => s.type === "services");
  const strip = services?.items.filter((item) => item.icon).slice(0, 4) ?? [];

  return (
    <ScrollScene className="gn-hero">
      <svg
        className="gn-blobs"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path
          className="gn-blob gn-blob-a"
          d="M1600 0H940c-46 74-14 162 70 206 118 62 128 184 64 290-74 124-42 268 96 322 158 62 318 34 430-6Z"
        />
        <path
          className="gn-blob gn-blob-b"
          d="M0 520c96-44 204-12 246 86 48 108 10 216-64 280-64 56-128 94-182 150Z"
        />
        <path
          className="gn-blob gn-blob-c"
          d="M520 1000c64-150 224-246 406-224 150 18 246 118 278 224Z"
        />
      </svg>

      <header className="gn-nav">
        <a href="#" className="gn-brand">
          <PawMark className="gn-brand-mark" />
          <span>
            <b>{primary}</b>
            {secondary ? <small>{secondary}</small> : null}
          </span>
        </a>
        <nav className="gn-links" aria-label="Sayfa bölümleri">
          {vetLinks(content).map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <a href={telHref(business)} data-cta="call" className="gn-navcall" aria-label="Arayın">
          <PhoneMark />
        </a>
      </header>

      <div className="gn-stage">
        <div className="gn-copy">
          <p className="gn-eyebrow">
            {business.neighborhood} · {business.district}
          </p>
          <h1 className="gn-h1">
            <Words text={section.headline} />
          </h1>
          <p className="gn-sub">{section.subline}</p>
          <div className="gn-actions">
            <a
              href={whatsappHref(content)}
              target="_blank"
              rel="noopener noreferrer"
              data-cta="whatsapp"
              className="gn-btn gn-btn-solid"
            >
              <WhatsAppGlyph />
              WhatsApp’tan randevu
            </a>
            <a href="#hizmetler" className="gn-btn gn-btn-line">
              Hizmetler
            </a>
          </div>
          <p className="gn-open">
            <OpenNow content={content} now={now} />
          </p>
        </div>

        <div className="gn-figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={figure.src} alt={figure.alt} loading="eager" decoding="async" />
          <span className="gn-paws" aria-hidden="true">
            <PawMark />
            <PawMark />
          </span>
        </div>
      </div>

      {strip.length > 0 ? (
        <ul className="gn-strip">
          {strip.map((item, index) => (
            <li key={item.name} style={{ ["--i" as string]: index }}>
              <span className="gn-strip-icon">
                <VetIcon name={item.icon!} />
              </span>
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </ScrollScene>
  );
}
