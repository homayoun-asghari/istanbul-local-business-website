import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { Container, Eyebrow, SectionHeading } from "./primitives";
import { CallButton, WhatsAppButton, formatPhone } from "./Cta";

export function Contact({
  section,
  content,
}: {
  section: SectionOf<"contact">;
  content: SiteContent;
}) {
  const { business } = content;
  // The keyless embed endpoint. Google's Maps Embed API needs a billed key; this does not.
  const embed = `https://maps.google.com/maps?q=${business.lat},${business.lng}&z=16&output=embed`;

  return (
    <section id="iletisim" className="py-16 md:py-24">
      <Container>
        <div className="md:grid md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <div>
            <Eyebrow>İletişim</Eyebrow>
            <div className="mt-4">
              <SectionHeading>{section.title}</SectionHeading>
            </div>

            <dl className="mt-8 m-0">
              <dt className="eyebrow m-0">Adres</dt>
              <dd className="text-ink-soft m-0 mt-1.5 text-[15px]">
                {business.neighborhood} Mahallesi, {business.district} / İstanbul
              </dd>

              <dt className="eyebrow m-0 mt-6">Telefon</dt>
              <dd className="m-0 mt-1.5 text-[15px]">
                <a
                  href={`tel:${business.phone}`}
                  data-cta="call"
                  className="text-ink underline-offset-4 hover:underline"
                >
                  {formatPhone(business.phone)}
                </a>
              </dd>

              {business.instagram ? (
                <>
                  <dt className="eyebrow m-0 mt-6">Instagram</dt>
                  <dd className="m-0 mt-1.5 text-[15px]">
                    <a
                      href={business.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink underline-offset-4 hover:underline"
                    >
                      {business.instagram
                        .replace(/^https?:\/\/(www\.)?instagram\.com\//, "@")
                        .replace(/\/$/, "")}
                    </a>
                  </dd>
                </>
              ) : null}
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <WhatsAppButton content={content} />
              <CallButton business={business} label="Ara" />
            </div>

            <p className="mt-6 mb-0">
              <a
                href={business.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="maps"
                className="text-brand text-[14px] underline underline-offset-4"
              >
                Google Haritalar’da aç ve yol tarifi al →
              </a>
            </p>
          </div>

          <div className="mt-10 md:mt-0">
            <iframe
              src={embed}
              title={`${business.name} konumu`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-edge border-line h-[320px] w-full border md:h-[460px]"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
