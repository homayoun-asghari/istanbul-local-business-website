import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { Container } from "./primitives";
import { CallButton, WhatsAppButton } from "./Cta";

/**
 * A veteriner's site is most often opened in an emergency, at night, by someone who is
 * frightened. This band sits directly under the hero and answers the only question that
 * matters then: can I reach you now, and how fast.
 */
export function Emergency({
  section,
  content,
}: {
  section: SectionOf<"emergency">;
  content: SiteContent;
}) {
  return (
    <section id="acil" className="bg-accent text-brand-ink">
      <Container className="flex flex-col gap-5 py-7 md:flex-row md:items-center md:justify-between md:py-8">
        <div>
          <p className="font-display m-0 text-[clamp(1.5rem,3.5vw,2.25rem)] leading-none font-normal">
            {section.title}
          </p>
          <p className="mt-2.5 mb-0 text-[15px] opacity-90">{section.note}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <CallButton
            business={content.business}
            label="Hemen ara"
            className="border-brand-ink/40 text-brand-ink"
          />
          <WhatsAppButton content={content} label="WhatsApp" className="bg-ink text-brand-ink" />
        </div>
      </Container>
    </section>
  );
}
