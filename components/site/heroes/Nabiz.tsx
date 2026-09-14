import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { telHref, whatsappHref } from "@/lib/content/schema";
import { brandParts } from "@/lib/content/turkish";
import { presetFor } from "@/packs/registry";
import { ScrollScene } from "../ScrollScene";
import { OpenNow, isAlwaysOpenHours, vetLinks } from "./shared";
import { ChevronMark, PhoneMark } from "../VetIcons";

/**
 * 02 Nabız — after Pampaw.
 *
 * A blue gradient with a faint grid, and one word set enormous behind a vet and her dog.
 * For a clinic that never closes the word is "7/24"; for one that does, it is the
 * district. The figure stands in front of the letters — the interleave Kesim already
 * ships — so the word reads as a backdrop rather than a headline.
 *
 * The word is decoration and hidden from assistive technology; the real headline is in
 * the h1, visually hidden, so the page still says what it is.
 *
 * On scroll the blue panel rounds its lower corners and pulls in from the edges, lifting
 * off the white page underneath the way Pampaw's hero does.
 */
export function Nabiz({
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
  const alwaysOpen = isAlwaysOpenHours(content);
  const word = alwaysOpen ? "7/24" : business.district;
  const links = vetLinks(content);
  const hasEmergency = content.sections.some((s) => s.type === "emergency");
  const hasVaccines = content.sections.some((s) => s.type === "vaccines");

  return (
    <ScrollScene className="nb-hero">
      <div className="nb-panel">
        <header className="nb-nav">
          <a href="#" className="nb-brand">
            <b>{primary}</b>
            {secondary ? <small>{secondary}</small> : null}
          </a>
          <nav className="nb-links" aria-label="Sayfa bölümleri">
            {links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <a href={telHref(business)} data-cta="call" className="nb-callbtn">
            Ara
            <i>
              <PhoneMark />
            </i>
          </a>
        </header>

        <h1 className="sr-only">
          {section.headline}. {section.subline}
        </h1>

        <div className="nb-stage">
          <p className="nb-word" aria-hidden="true" style={{ ["--len" as string]: word.length }}>
            {word}
          </p>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="nb-figure"
            src={figure.src}
            alt={figure.alt}
            loading="eager"
            decoding="async"
          />

          {hasVaccines ? (
            <a href="#asi-takvimi" className="nb-chip">
              <VialMark />
              <b>Aşı takvimi</b>
              <span>Doğum tarihine göre</span>
            </a>
          ) : null}

          <svg className="nb-arrow" viewBox="0 0 60 150" fill="none" aria-hidden="true">
            <path d="M30 4C4 40 8 100 50 136" />
            <path d="m36 138 15-1-3-15" />
          </svg>

          <div className="nb-side">
            {hasEmergency ? (
              <a href="#acil" className="nb-card">
                <span className="nb-card-photo">
                  {stock?.extras?.cat ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={stock.extras.cat} alt="" aria-hidden="true" />
                  ) : null}
                </span>
                <b>Acil belirtiler</b>
                <span>Ne zaman aramalı?</span>
              </a>
            ) : (
              <a href="#hizmetler" className="nb-card">
                <span className="nb-card-photo">
                  {stock?.extras?.duo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={stock.extras.duo} alt="" aria-hidden="true" />
                  ) : null}
                </span>
                <b>Hizmetlerimiz</b>
                <span>Muayeneden cerrahiye</span>
              </a>
            )}
            {hasEmergency ? (
              <a href={telHref(business)} data-cta="call" className="nb-go">
                Hemen ara
                <i>
                  <ChevronMark />
                </i>
              </a>
            ) : (
              <a
                href={whatsappHref(content)}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="whatsapp"
                className="nb-go"
              >
                Randevu al
                <i>
                  <ChevronMark />
                </i>
              </a>
            )}
          </div>

          <p className="nb-open">
            {alwaysOpen ? (
              <span className="nb-open-state">
                <i aria-hidden="true" />7 gün 24 saat açık
              </span>
            ) : (
              <span className="nb-open-state nb-open-live">
                <OpenNow content={content} now={now} />
              </span>
            )}
            <span className="nb-open-where">
              {business.neighborhood}, {business.district}
            </span>
          </p>
        </div>
      </div>
    </ScrollScene>
  );
}

/** Pampaw's vaccine vial, drawn: an orange cap on a white bottle with a blue fill line. */
function VialMark() {
  return (
    <svg className="nb-vial" viewBox="0 0 48 48" aria-hidden="true">
      <rect x="16" y="3" width="16" height="8" rx="2" fill="#F96F3E" />
      <rect x="18" y="11" width="12" height="4" fill="#D9E4EF" />
      <rect x="12" y="15" width="24" height="30" rx="6" fill="#FFFFFF" />
      <rect x="12" y="28" width="24" height="10" fill="#CFE3F3" />
    </svg>
  );
}
