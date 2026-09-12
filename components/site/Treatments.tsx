import type { SectionOf } from "@/lib/content/schema";
import { Container } from "./primitives";
import { Reveal } from "./Reveal";

/**
 * Treatment tiles — the five glass objects, centred heading above them.
 *
 * Unlike `services`, every item here carries an image, because this pack ships its own
 * photography. The middle tile sits lifted, which is how the reference marks the
 * treatment the clinic most wants booked without writing "most popular" on it — a
 * comparative claim a clinic may not make (m.5/1-c).
 */
export function Treatments({ section }: { section: SectionOf<"treatments"> }) {
  const middle = Math.floor(section.items.length / 2);

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
            <Reveal
              as="li"
              key={item.name}
              delay={index * 60}
              className={`cam-treat${index === middle ? " is-lifted" : ""}`}
            >
              <figure className="cam-treat-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image.src} alt={item.image.alt} loading="lazy" decoding="async" />
                <figcaption>
                  <b>{item.name}</b>
                  {item.note ? <span>{item.note}</span> : null}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
