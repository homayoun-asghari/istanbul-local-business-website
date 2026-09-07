import type { SectionOf } from "@/lib/content/schema";
import { Container, Eyebrow, Rule, SectionHeading } from "./primitives";

/**
 * An editorial list, not a grid of icon cards. Icons and rounded cards are what every
 * salon template already looks like; hairlines and a serif read as a printed menu.
 * The list is not a sequence, so it is deliberately not numbered.
 */
export function Services({ section }: { section: SectionOf<"services"> }) {
  return (
    <section id="hizmetler" className="py-16 md:py-24">
      <Container>
        <div className="md:grid md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <div>
            <Eyebrow>Hizmetler</Eyebrow>
            <div className="mt-4">
              <SectionHeading>{section.title}</SectionHeading>
            </div>
            {section.intro ? (
              <p className="text-ink-soft mt-5 mb-0 max-w-[38ch] leading-relaxed">
                {section.intro}
              </p>
            ) : null}
          </div>

          <ul className="mt-10 list-none p-0 md:mt-0">
            {section.items.map((item) => (
              <li key={item.name} className="m-0">
                <Rule />
                <div className="py-6">
                  <h3 className="font-display text-ink m-0 text-[1.375rem] leading-tight font-normal">
                    {item.name}
                  </h3>
                  {item.description ? (
                    <p className="text-muted mt-2 mb-0 max-w-[52ch] text-[15px] leading-relaxed">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
            <li className="m-0">
              <Rule />
            </li>
          </ul>
        </div>
      </Container>
    </section>
  );
}
