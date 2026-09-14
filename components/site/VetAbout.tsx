import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { telHref, whatsappHref } from "@/lib/content/schema";
import { presetFor } from "@/packs/registry";
import { Container } from "./primitives";
import { Reveal } from "./Reveal";
import { isAlwaysOpenHours } from "./heroes/shared";
import { PawMark, VetIcon, WhatsAppGlyph } from "./VetIcons";

type Skin = "gunes" | "nabiz";

/**
 * "Kliniğimiz".
 *
 * Güneş is VetCare's "We keep your pet happy" block: two photographs tilted against each
 * other — the business's own storefront and one of ours — with small white cards floating
 * over them, and the copy beside. Where VetCare draws progress bars ("Positive reviews
 * 84%"), this draws a checklist of facts, because a percentage there is a claim.
 *
 * Nabız is Pampaw's "why choose us": a dog and a cat breaking out of the top of a blue
 * notched panel, the neighbourhood on the tab below it, and the one number that is a fact
 * — 7/24, or the opening hours — on a grey card beside the copy.
 */
export function VetAbout({
  section,
  content,
  skin,
}: {
  section: SectionOf<"about">;
  content: SiteContent;
  skin: Skin;
}) {
  const { business } = content;
  const hero = content.sections.find((s) => s.type === "hero");
  const extras = presetFor(content).stock?.extras;
  const alwaysOpen = isAlwaysOpenHours(content);

  if (skin === "nabiz") {
    return (
      <section id="klinik" className="nb-about">
        <Container className="nb-about-grid">
          <Reveal className="nb-ab-visual">
            {/* One shape, not two boxes: the panel and the tab under it meet in inverted
                corners, which two rounded rectangles side by side cannot draw. */}
            <svg
              className="nb-ab-shape"
              viewBox="0 0 840 610"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="nb-ab-fill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#8FD7EE" />
                  <stop offset="0.5" stopColor="#3AA8D6" />
                  <stop offset="1" stopColor="#1C86C1" />
                </linearGradient>
              </defs>
              <path
                fill="url(#nb-ab-fill)"
                d="M276 0H814a26 26 0 0 1 26 26V394a26 26 0 0 1-26 26H286a26 26 0 0 0-26 26V584a26 26 0 0 1-26 26H26a26 26 0 0 1-26-26V446a26 26 0 0 1 26-26H224a26 26 0 0 0 26-26V26a26 26 0 0 1 26-26Z"
              />
            </svg>
            <span className="nb-ab-tile">
              <PawMark />
            </span>
            {extras?.duo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="nb-ab-pets" src={extras.duo} alt="" aria-hidden="true" />
            ) : null}
            <div className="nb-ab-chip">
              <PawMark />
              <span>
                <b>{business.neighborhood}</b>
                {business.district}
              </span>
            </div>
          </Reveal>

          <Reveal delay={120} className="nb-ab-copy">
            <span className="nb-pill">{section.title}</span>
            <h2 className="nb-title">Dostunuzun sağlığı, bizim işimiz</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="nb-body">
                {paragraph}
              </p>
            ))}
            <div className="nb-ab-row">
              <div className="nb-ab-fact">
                <b>{alwaysOpen ? "7/24" : "09–19"}</b>
                <span>{alwaysOpen ? "Acil hizmet" : "Pazartesi – Cumartesi"}</span>
              </div>
              {section.facts ? (
                <ul className="nb-ab-list">
                  {section.facts.map((fact) => (
                    <li key={fact}>
                      <VetIcon name="kontrol" />
                      {fact}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Reveal>
        </Container>
      </section>
    );
  }

  return (
    <section id="klinik" className="gn-about">
      <Container className="gn-about-grid">
        <Reveal className="gn-collage">
          {hero ? (
            <figure className="gn-collage-a">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.image.src} alt={hero.image.alt} loading="lazy" decoding="async" />
            </figure>
          ) : null}
          {section.image ? (
            <figure className="gn-collage-b">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={section.image.src}
                alt={section.image.alt}
                loading="lazy"
                decoding="async"
              />
            </figure>
          ) : null}
          <span className="gn-collage-tag is-one">
            <VetIcon name="muayene" />
            Muayene
          </span>
          <span className="gn-collage-tag is-two">
            <VetIcon name="asi" />
            Aşı takvimi
          </span>
        </Reveal>

        <Reveal delay={120} className="gn-about-copy">
          <p className="gn-kicker">
            {business.neighborhood} · {business.district}
          </p>
          <h2 className="gn-title">{section.title}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph} className="gn-body">
              {paragraph}
            </p>
          ))}
          {section.facts ? (
            <ul className="gn-facts">
              {section.facts.map((fact) => (
                <li key={fact}>
                  <span aria-hidden="true">
                    <PawMark />
                  </span>
                  {fact}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="gn-actions">
            <a
              href={whatsappHref(content)}
              target="_blank"
              rel="noopener noreferrer"
              data-cta="whatsapp"
              className="gn-btn gn-btn-solid"
            >
              <WhatsAppGlyph />
              Randevu alın
            </a>
            <a href={telHref(business)} data-cta="call" className="gn-btn gn-btn-line">
              Arayın
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
