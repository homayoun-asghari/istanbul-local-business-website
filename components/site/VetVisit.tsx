import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { DAY_KEYS, telHref, whatsappHref } from "@/lib/content/schema";
import { DAY_NAMES_TR, istanbulNow } from "@/lib/content/hours";
import { presetFor } from "@/packs/registry";
import { Container } from "./primitives";
import { Reveal } from "./Reveal";
import { StaticMap } from "./StaticMap";
import { formatPhone } from "./Cta";
import { OpenNow, isAlwaysOpenHours } from "./heroes/shared";
import { ChevronMark, PawMark, PhoneMark, WhatsAppGlyph } from "./VetIcons";

type Skin = "gunes" | "nabiz";

/**
 * Hours, address and map as one closing section, rendered where the hours section sits.
 * These presets show the contact block here too, so the separate contact section renders
 * nothing and the page does not say the address twice.
 *
 * Güneş is VetCare's footer card: the week on a white card with a tabby cat peeking over
 * its top edge and two paw prints beside it. Nabız opens with Pampaw's call to action in
 * a notched blue frame, then the week and the map side by side.
 */
export function VetVisit({
  section,
  content,
  now,
  skin,
}: {
  section: SectionOf<"hours">;
  content: SiteContent;
  now: Date;
  skin: Skin;
}) {
  const { business } = content;
  const today = istanbulNow(now).day;
  const alwaysOpen = isAlwaysOpenHours(content);
  const cat = presetFor(content).stock?.extras?.cat;

  const week = (
    <dl className="vv-week">
      {DAY_KEYS.map((day) => {
        const slot = content.hours[day];
        return (
          <div key={day} className={`vv-day${day === today ? " is-today" : ""}`}>
            <dt>
              {DAY_NAMES_TR[day]}
              {day === today ? <em>bugün</em> : null}
            </dt>
            <dd>
              {slot === "closed"
                ? "Kapalı"
                : alwaysOpen
                  ? "24 saat"
                  : `${slot.open} – ${slot.close}`}
            </dd>
          </div>
        );
      })}
    </dl>
  );

  const address = (
    <dl className="vv-address">
      <div>
        <dt>Adres</dt>
        <dd>
          {business.neighborhood} Mahallesi, {business.district} / İstanbul
        </dd>
      </div>
      <div>
        <dt>Telefon</dt>
        <dd>
          <a href={telHref(business)} data-cta="call">
            {formatPhone(business.phone)}
          </a>
        </dd>
      </div>
    </dl>
  );

  if (skin === "nabiz") {
    return (
      <section id="iletisim" className="nb-visit">
        <Container>
          <Reveal className="nb-cta">
            <span className="nb-cta-tag">Beklemeyin</span>
            <h2 className="nb-cta-title">Dostunuz için bugün randevu alın</h2>
            <div className="nb-cta-actions">
              <a
                href={whatsappHref(content)}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="whatsapp"
                className="nb-btn nb-btn-orange"
              >
                WhatsApp’tan yazın
                <i>
                  <ChevronMark />
                </i>
              </a>
              <a href={telHref(business)} data-cta="call" className="nb-cta-call">
                <PhoneMark />
                {formatPhone(business.phone)}
              </a>
            </div>
          </Reveal>

          <div className="nb-visit-grid">
            <Reveal className="nb-hours">
              <span className="nb-pill">{section.title}</span>
              <p className="nb-hours-state">
                {alwaysOpen ? "7 gün 24 saat açık" : <OpenNow content={content} now={now} />}
              </p>
              {week}
              {content.hours.note ? <p className="vv-note">{content.hours.note}</p> : null}
            </Reveal>
            <Reveal delay={120} className="nb-where">
              {address}
              <StaticMap business={business} />
            </Reveal>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section id="iletisim" className="gn-visit">
      <Container className="gn-visit-grid">
        <Reveal className="gn-visit-copy">
          <p className="gn-kicker">Bizi ziyaret edin</p>
          <h2 className="gn-title">İletişim ve konum</h2>
          <p className="gn-visit-state">
            <OpenNow content={content} now={now} />
          </p>
          {address}
          <div className="gn-actions">
            <a
              href={whatsappHref(content)}
              target="_blank"
              rel="noopener noreferrer"
              data-cta="whatsapp"
              className="gn-btn gn-btn-solid"
            >
              <WhatsAppGlyph />
              WhatsApp’tan yazın
            </a>
            <a href={telHref(business)} data-cta="call" className="gn-btn gn-btn-line">
              Arayın
            </a>
          </div>
        </Reveal>

        <Reveal delay={120} className="gn-hours">
          {cat ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="gn-hours-cat" src={cat} alt="" aria-hidden="true" loading="lazy" />
          ) : null}
          <span className="gn-hours-paws" aria-hidden="true">
            <PawMark />
            <PawMark />
          </span>
          <div className="gn-hours-card">
            <h3>{section.title}</h3>
            {week}
            {content.hours.note ? <p className="vv-note">{content.hours.note}</p> : null}
          </div>
        </Reveal>
      </Container>
      <Container className="gn-visit-map">
        <Reveal>
          <StaticMap business={business} />
        </Reveal>
      </Container>
    </section>
  );
}
