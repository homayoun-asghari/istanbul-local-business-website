import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { telHref } from "@/lib/content/schema";
import { Container } from "./primitives";
import { Reveal } from "./Reveal";
import { formatPhone } from "./Cta";

type Skin = "gunes" | "nabiz";

/**
 * Frequently asked questions — Opet's accordion beside a photograph, with a frosted
 * "got questions?" card on the photo carrying the phone number.
 *
 * Native <details>, sharing one name so opening a question closes the last one. It works
 * with no JavaScript at all, and a screen reader already knows what it is.
 */
export function Faq({
  section,
  content,
  skin,
}: {
  section: SectionOf<"faq">;
  content: SiteContent;
  skin: Skin;
}) {
  const { business } = content;

  return (
    <section id="sss" className={`fq fq-${skin}`}>
      <Container className={`fq-grid${section.image ? "" : " is-plain"}`}>
        {section.image ? (
          <Reveal className="fq-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={section.image.src} alt={section.image.alt} loading="lazy" decoding="async" />
            <div className="fq-ask">
              <span className="fq-ask-mark" aria-hidden="true">
                ?
              </span>
              <span>
                <b>Sorunuz mu var?</b>
                <a href={telHref(business)} data-cta="call">
                  {formatPhone(business.phone)}
                </a>
              </span>
            </div>
          </Reveal>
        ) : null}

        <div className="fq-copy">
          <Reveal className="fq-head">
            <p className="fq-kicker">Merak edilenler</p>
            <h2 className="fq-title">{section.title}</h2>
            {section.intro ? <p className="fq-intro">{section.intro}</p> : null}
          </Reveal>
          <div className="fq-list">
            {section.items.map((item, index) => (
              <Reveal key={item.q} delay={index * 60}>
                <details className="fq-item" name={`sss-${skin}`} open={index === 0}>
                  <summary>
                    <span>{item.q}</span>
                    <i aria-hidden="true" />
                  </summary>
                  <p>{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
