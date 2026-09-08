import type { SectionOf } from "@/lib/content/schema";
import { Container, Eyebrow, SectionHeading } from "./primitives";
import { Reveal } from "./Reveal";

export function Gallery({ section }: { section: SectionOf<"gallery"> }) {
  const single = section.images.length === 1;
  return (
    <section id="galeri" className="py-16 md:py-24">
      <Container>
        <Eyebrow>Galeri</Eyebrow>
        <div className="mt-4">
          <SectionHeading>{section.title}</SectionHeading>
        </div>
        <div
          className={`mt-10 grid gap-4 ${single ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3"}`}
        >
          {section.images.map((image, index) => (
            <Reveal
              as="figure"
              key={image.src + image.alt}
              delay={index * 60}
              className="photo-hover rounded-edge m-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="lazy"
                decoding="async"
                className={`w-full object-cover ${single ? "aspect-[16/9]" : "aspect-[4/5]"}`}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
