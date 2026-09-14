import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { telHref, whatsappHref } from "@/lib/content/schema";
import { presetFor } from "@/packs/registry";
import { Container } from "./primitives";
import { Reveal } from "./Reveal";
import { formatPhone } from "./Cta";
import { PhoneMark, VetIcon, WhatsAppGlyph } from "./VetIcons";

type Skin = "gunes" | "nabiz";

/**
 * "Acil mi?" — Petcute's dark illness-guide card, turned into the list a frightened owner
 * needs at 3 a.m.: the signs that mean "call now", and the number, large.
 *
 * It says when to call. It does not explain, diagnose or advise, and it says so under the
 * list — anything more is a vet's judgement, not a web page's.
 */
export function VetEmergency({
  section,
  content,
  skin,
}: {
  section: SectionOf<"emergency">;
  content: SiteContent;
  skin: Skin;
}) {
  const { business } = content;
  const art = presetFor(content).stock?.extras?.guide;

  return (
    <section id="acil" className={`vem vem-${skin}`}>
      <Container>
        <Reveal className="vem-card">
          <div className="vem-copy">
            <p className="vem-kicker">
              <VetIcon name="acil" />
              7/24 acil
            </p>
            <h2 className="vem-title">{section.title}</h2>
            <p className="vem-note">{section.note}</p>
            <div className="vem-actions">
              <a href={telHref(business)} data-cta="call" className="vem-call">
                <PhoneMark />
                <span>
                  Hemen arayın
                  <b>{formatPhone(business.phone)}</b>
                </span>
              </a>
              <a
                href={whatsappHref(content)}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="whatsapp"
                className="vem-wa"
              >
                <WhatsAppGlyph />
                WhatsApp
              </a>
            </div>
            {/* In the copy column's flow, under the buttons, sitting on the card's bottom
                edge the way Petcute's dog sits on its guide card — never over a button. */}
            {art && skin === "nabiz" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="vem-art" src={art} alt="" aria-hidden="true" loading="lazy" />
            ) : null}
          </div>

          <div className="vem-list">
            <ul>
              {(section.signs ?? []).map((sign, index) => (
                <li key={sign} style={{ ["--i" as string]: index }}>
                  <span aria-hidden="true" />
                  {sign}
                </li>
              ))}
            </ul>
            <p className="vem-disclaimer">Bu liste tanı koymaz. Emin değilseniz de arayın.</p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
