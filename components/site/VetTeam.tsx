import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { whatsappHref } from "@/lib/content/schema";
import { Container } from "./primitives";
import { Reveal } from "./Reveal";
import { PawMark, WhatsAppGlyph } from "./VetIcons";

type Skin = "gunes" | "nabiz";

/**
 * The team.
 *
 * Güneş is VetCare's card: a white face with the portrait inside a cream ring, standing on
 * a navy or coral base that shows beneath it — alternating, so a row of three reads as a
 * team rather than a grid. Nabız puts each portrait on a blue gradient back.
 *
 * Only the name and the title. The title comes from a fixed list in the pack, because
 * presenting as a specialist without the certificate is a fine (Law 6343 m.41/ö).
 */
export function VetTeam({
  section,
  content,
  skin,
}: {
  section: SectionOf<"team">;
  content: SiteContent;
  skin: Skin;
}) {
  if (skin === "nabiz") {
    return (
      <section id="hekimler" className="nb-team">
        <Container>
          <Reveal className="nb-head">
            <span className="nb-pill">Ekibimiz</span>
            <h2 className="nb-title">{section.title}</h2>
            {section.intro ? <p className="nb-intro">{section.intro}</p> : null}
          </Reveal>
          <ul className="nb-team-row">
            {section.members.map((member, index) => (
              <Reveal as="li" key={member.name} delay={index * 100} className="nb-tm">
                <div className="nb-tm-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={member.image.src} alt={member.image.alt} loading="lazy" />
                </div>
                <b>{member.name}</b>
                <small>{member.role}</small>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>
    );
  }

  return (
    <section id="hekimler" className="gn-team">
      <Container className="gn-team-grid">
        <ul className="gn-team-cards">
          {section.members.map((member, index) => (
            <Reveal
              as="li"
              key={member.name}
              delay={index * 100}
              className={`gn-tcard ${index % 2 === 1 ? "is-coral" : "is-navy"}`}
            >
              <div className="gn-tcard-face">
                <span className="gn-tcard-ring">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={member.image.src} alt={member.image.alt} loading="lazy" />
                </span>
                <b>{member.name}</b>
                <small>{member.role}</small>
              </div>
              <span className="gn-tcard-base" aria-hidden="true">
                <PawMark />
              </span>
            </Reveal>
          ))}
        </ul>
        <Reveal delay={120} className="gn-team-copy">
          <p className="gn-kicker">Ekibimiz</p>
          <h2 className="gn-title">{section.title}</h2>
          {section.intro ? <p className="gn-body">{section.intro}</p> : null}
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
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
