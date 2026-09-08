import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { Container } from "./primitives";
import { Reveal } from "./Reveal";

/** The strip of squares above the footer that every salon theme ships. */
export function InstagramStrip({
  section,
  content,
}: {
  section: SectionOf<"instagram">;
  content: SiteContent;
}) {
  const href = content.business.instagram;
  return (
    <section className="py-14 md:py-20">
      <Container className="flex flex-wrap items-baseline justify-between gap-3 pb-6">
        <p className="font-display text-ink m-0 text-[clamp(1.25rem,2.4vw,1.75rem)]">
          {section.title}
        </p>
        {section.handle ? (
          href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand text-[14px] underline underline-offset-4"
            >
              {section.handle}
            </a>
          ) : (
            <span className="text-muted text-[14px]">{section.handle}</span>
          )
        ) : null}
      </Container>
      <div className="grid grid-cols-3 gap-1.5 px-1.5 sm:grid-cols-6">
        {section.images.map((image, index) => (
          <Reveal as="figure" key={image.src + index} delay={index * 45} className="m-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              className="aspect-square w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
