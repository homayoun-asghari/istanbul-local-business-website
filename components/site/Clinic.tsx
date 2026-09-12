import type { SectionOf } from "@/lib/content/schema";
import { Container } from "./primitives";
import { Reveal } from "./Reveal";

/**
 * The clinic band: the business's own photograph under a flood of the brand colour, with
 * four figures in frosted cards along the bottom.
 *
 * The flood is not a style choice. These leads have one low-resolution storefront snap
 * from Google Maps, and a full-bleed crop of it at this size looks exactly as poor as it
 * is. Under a heavy duotone it reads as a deliberate treatment instead.
 *
 * The figures are deliberately not a rating. A private health facility may not publish
 * review counts, star ratings or satisfaction figures (m.5/1-e), which is the single
 * biggest difference between this pack and beauty — so what sits here is checkable and
 * neutral, and the operator is expected to replace it with the clinic's own facts.
 */
export function Clinic({ section }: { section: SectionOf<"clinic"> }) {
  return (
    <section id="klinik" className="cam-clinic">
      <Container>
        <div className="cam-clinic-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={section.image.src}
            alt={section.image.alt}
            className="cam-clinic-photo"
            loading="lazy"
            decoding="async"
          />
          <span aria-hidden="true" className="cam-clinic-wash" />

          <div className="cam-clinic-copy">
            <p className="cam-clinic-eyebrow">Kliniğimiz</p>
            <Reveal>
              <h2 className="cam-clinic-title">{section.title}</h2>
              <p className="cam-clinic-body">{section.body}</p>
            </Reveal>
          </div>

          <dl className="cam-facts">
            {section.facts.map((fact, index) => (
              <Reveal key={fact.label} delay={index * 70} className="cam-fact">
                <dt className="cam-fact-value">{fact.value}</dt>
                <dd className="cam-fact-label">{fact.label}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
