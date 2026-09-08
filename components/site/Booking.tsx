"use client";

import { useState } from "react";
import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { DAY_KEYS } from "@/lib/content/schema";
import { DAY_NAMES_TR } from "@/lib/content/hours";
import { Container, Eyebrow, SectionHeading } from "./primitives";

/**
 * A booking panel beside the opening hours — the form every salon theme puts on the page.
 *
 * There is no server: the fields compose a WhatsApp message and hand it to wa.me. That is
 * deliberate. The customer keeps a copy of what they sent, the owner answers from the
 * phone already in their hand, and the delivered site needs no backend at all — which is
 * what lets it be ejected as a static repository.
 */
export function Booking({
  section,
  content,
}: {
  section: SectionOf<"booking">;
  content: SiteContent;
}) {
  const [name, setName] = useState("");
  const [service, setService] = useState("");
  const [when, setWhen] = useState("");

  const services = content.sections.flatMap((s) =>
    s.type === "services"
      ? s.items.map((i) => i.name)
      : s.type === "pricelist"
        ? s.items.map((i) => i.name)
        : [],
  );

  const message = [
    `Merhaba, ${content.business.name} için randevu almak istiyorum.`,
    name && `Adım: ${name}`,
    service && `İşlem: ${service}`,
    when && `Tercih ettiğim zaman: ${when}`,
  ]
    .filter(Boolean)
    .join("\n");

  const href = `${content.business.whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <section id="randevu" className="py-16 md:py-24">
      <Container>
        <div className="md:grid md:grid-cols-[0.9fr_1.1fr] md:gap-14">
          <div>
            <Eyebrow>Randevu</Eyebrow>
            <div className="mt-4">
              <SectionHeading>{section.title}</SectionHeading>
            </div>
            {section.note ? (
              <p className="text-ink-soft mt-4 mb-0 max-w-[42ch] leading-relaxed">{section.note}</p>
            ) : null}

            <dl className="border-line mt-8 grid grid-cols-[auto_1fr] border-t">
              {DAY_KEYS.map((day) => {
                const slot = content.hours[day];
                return (
                  <div key={day} className="contents">
                    <dt className="border-line text-ink-soft border-b py-2.5 pr-8 text-[14px]">
                      {DAY_NAMES_TR[day]}
                    </dt>
                    <dd className="border-line text-ink-soft m-0 border-b py-2.5 text-right text-[14px] tabular-nums">
                      {slot === "closed" ? "Kapalı" : `${slot.open} – ${slot.close}`}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>

          <div className="bg-surface border-line rounded-edge mt-8 border p-6 md:mt-0 md:p-8">
            <div className="grid gap-4">
              <label className="block">
                <span className="text-muted mb-1.5 block text-[12px]">Adınız</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Adınız ve soyadınız"
                  className="border-line text-ink placeholder:text-muted/70 w-full rounded-[8px] border bg-transparent px-3.5 py-3 text-[15px] outline-none focus:border-current"
                />
              </label>
              <label className="block">
                <span className="text-muted mb-1.5 block text-[12px]">Hangi işlem</span>
                <select
                  value={service}
                  onChange={(event) => setService(event.target.value)}
                  className="border-line text-ink w-full rounded-[8px] border bg-transparent px-3.5 py-3 text-[15px] outline-none focus:border-current"
                >
                  <option value="">Seçiniz</option>
                  {services.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-muted mb-1.5 block text-[12px]">Ne zaman</span>
                <input
                  type="text"
                  value={when}
                  onChange={(event) => setWhen(event.target.value)}
                  placeholder="Örn. Cumartesi öğleden sonra"
                  className="border-line text-ink placeholder:text-muted/70 w-full rounded-[8px] border bg-transparent px-3.5 py-3 text-[15px] outline-none focus:border-current"
                />
              </label>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="whatsapp"
                className="bg-brand text-brand-ink mt-1 inline-flex items-center justify-center rounded-[var(--radius-pill)] px-6 py-3.5 text-[14px] font-medium transition-opacity hover:opacity-90"
              >
                WhatsApp&rsquo;tan gönder
              </a>
              <p className="text-muted m-0 text-[12px] leading-relaxed">
                Form doldurulduğunda mesaj WhatsApp&rsquo;ta hazır olarak açılır; göndermeden önce
                düzenleyebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
