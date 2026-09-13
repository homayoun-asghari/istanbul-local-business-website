import type { SectionOf } from "@/lib/content/schema";
import { Container } from "./primitives";
import { Reveal } from "./Reveal";

/**
 * Treatment tiles — the five glass objects, centred heading above them.
 *
 * Unlike `services`, every item here carries an image, because this pack ships its own
 * photography.
 *
 * At rest the five are equal. Hovering one expands it and slides its description in
 * beside the object while the others compress — which is what the reference does, and
 * why a permanently lifted middle tile read as a bug rather than as emphasis.
 */
export function Treatments({ section }: { section: SectionOf<"treatments"> }) {
  return (
    <section id="tedaviler" className="cam-treatments">
      <Container>
        <Reveal className="cam-centred">
          <p className="cam-eyebrow">Tedaviler</p>
          <h2 className="cam-title">{section.title}</h2>
          {section.intro ? <p className="cam-intro">{section.intro}</p> : null}
        </Reveal>

        <ul className="cam-treat-grid">
          {section.items.map((item, index) => (
            <Reveal as="li" key={item.name} delay={index * 60} className="cam-treat">
              <figure className="cam-treat-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image.src} alt={item.image.alt} loading="lazy" decoding="async" />
                <figcaption>
                  <b>{item.name}</b>
                </figcaption>
                {item.note ? (
                  <div className="cam-treat-reveal" aria-hidden="true">
                    <b>{item.name}</b>
                    <p>{item.note}</p>
                  </div>
                ) : null}
              </figure>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
