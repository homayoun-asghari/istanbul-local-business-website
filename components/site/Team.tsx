import type { SectionOf } from "@/lib/content/schema";
import { Container, Eyebrow, SectionHeading } from "./primitives";
import { Reveal } from "./Reveal";

/** Named people with portraits — the trust signal that cannot be mistaken for stock. */
export function Team({ section }: { section: SectionOf<"team"> }) {
  return (
    <section id="ekip" className="bg-surface border-line border-y py-16 md:py-24">
      <Container>
        <Reveal>
          <Eyebrow>Ekibimiz</Eyebrow>
          <div className="mt-4">
            <SectionHeading>{section.title}</SectionHeading>
          </div>
          {section.intro ? (
            <p className="text-ink-soft mt-4 mb-0 max-w-[56ch] leading-relaxed">{section.intro}</p>
          ) : null}
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {section.members.map((member, index) => (
            <Reveal as="figure" key={member.name} delay={index * 70} className="m-0">
              <div className="photo-hover rounded-edge">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.image.src}
                  alt={member.image.alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <figcaption className="mt-4">
                <p className="font-display text-ink m-0 text-[17px]">{member.name}</p>
                <p className="text-muted m-0 mt-1 text-[13px]">{member.role}</p>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
