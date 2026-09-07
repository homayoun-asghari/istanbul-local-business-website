import type { SectionOf } from "@/lib/content/schema";
import { Container, Eyebrow, SectionHeading } from "./primitives";

export function About({ section }: { section: SectionOf<"about"> }) {
  return (
    <section id="hakkimizda" className="bg-surface border-line border-y py-16 md:py-24">
      <Container>
        <div className="md:grid md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <div>
            <Eyebrow>Hakkımızda</Eyebrow>
            <div className="mt-4">
              <SectionHeading>{section.title}</SectionHeading>
            </div>
          </div>
          <div className="mt-8 md:mt-0">
            {section.body.map((paragraph) => (
              <p
                key={paragraph.slice(0, 24)}
                className="text-ink-soft mt-0 mb-5 max-w-[62ch] text-[1.0625rem] leading-[1.75] last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
