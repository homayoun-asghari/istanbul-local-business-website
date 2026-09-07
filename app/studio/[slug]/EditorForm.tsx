"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import type { DayKey, SiteContent } from "@/lib/content/schema";
import { publish } from "../actions";

/**
 * Field names are flat dotted paths — `business.name`, `section.2.item.0.name` — and
 * lib/studio/form.ts turns them back into a SiteContent. That mapping is where an edit
 * could corrupt a live demo, so it is pure and separately tested.
 */
export function EditorForm({
  content,
  slug,
  dayKeys,
  dayNames,
  presets,
  backLink,
}: {
  content: SiteContent;
  slug: string;
  dayKeys: DayKey[];
  dayNames: Record<DayKey, string>;
  presets: { id: string; label: string }[];
  backLink: ReactNode;
}) {
  const [message, action, pending] = useActionState(publish, null);
  const { business } = content;

  return (
    <form action={action}>
      <input type="hidden" name="slug" value={slug} />
      <p className="note">{backLink}</p>
      <h1>{business.name}</h1>
      <p className="note">
        <a href={`/${slug}`} target="_blank" rel="noreferrer">
          /{slug} ↗
        </a>
      </p>

      <h2>İşletme</h2>
      <div className="grid">
        <Field name="business.name" label="İşletme adı" value={business.name} />
        <Field name="business.neighborhood" label="Mahalle" value={business.neighborhood} />
        <Field name="business.district" label="İlçe" value={business.district} />
        <Field name="business.phone" label="Telefon (+905XXXXXXXXX)" value={business.phone} />
        <Field name="business.whatsapp" label="WhatsApp bağlantısı" value={business.whatsapp} />
        <Field
          name="business.instagram"
          label="Instagram (opsiyonel)"
          value={business.instagram ?? ""}
        />
        <Field name="business.rating" label="Google puanı" value={String(business.rating)} />
        <Field
          name="business.reviewCount"
          label="Değerlendirme sayısı"
          value={String(business.reviewCount)}
        />
        <Field
          name="business.fiveStarPct"
          label="Beş yıldız %"
          value={String(business.fiveStarPct)}
        />
        <Field name="business.lat" label="Enlem" value={String(business.lat)} />
        <Field name="business.lng" label="Boylam" value={String(business.lng)} />
        <Field
          name="business.mapsUrl"
          label="Google Haritalar bağlantısı"
          value={business.mapsUrl}
        />
      </div>

      <h2>Tasarım</h2>
      <label htmlFor="preset">Tasarım seçimi</label>
      <select id="preset" name="preset" defaultValue={content.preset}>
        {presets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.label}
          </option>
        ))}
      </select>

      <h2>Çalışma saatleri</h2>
      {dayKeys.map((day) => {
        const slot = content.hours[day];
        const closed = slot === "closed";
        return (
          <div className="hours" key={day}>
            <span>{dayNames[day]}</span>
            <div>
              <label htmlFor={`hours.${day}.open`}>Açılış</label>
              <input
                id={`hours.${day}.open`}
                type="text"
                name={`hours.${day}.open`}
                defaultValue={closed ? "" : slot.open}
                placeholder="09:00"
              />
            </div>
            <div>
              <label htmlFor={`hours.${day}.close`}>Kapanış</label>
              <input
                id={`hours.${day}.close`}
                type="text"
                name={`hours.${day}.close`}
                defaultValue={closed ? "" : slot.close}
                placeholder="19:00"
              />
            </div>
            <label style={{ whiteSpace: "nowrap", marginBottom: 9 }}>
              <input type="checkbox" name={`hours.${day}.closed`} defaultChecked={closed} /> Kapalı
            </label>
          </div>
        );
      })}
      <Field name="hours.note" label="Saatlerin altındaki not" value={content.hours.note ?? ""} />

      <h2>WhatsApp ve arama</h2>
      <Area
        name="whatsappMessage"
        label="Müşteri WhatsApp'a bastığında hazır gelen mesaj"
        value={content.whatsappMessage}
      />

      {content.sections.map((section, index) => {
        const key = `${section.type}-${index}`;
        const badge = section.placeholder ? <span className="badge">taslak içerik</span> : null;

        if (section.type === "hero") {
          return (
            <section key={key}>
              <h2>Üst bölüm{badge}</h2>
              <Field name={`section.${index}.headline`} label="Başlık" value={section.headline} />
              <Area name={`section.${index}.subline`} label="Alt başlık" value={section.subline} />
              <div className="grid">
                <Field
                  name={`section.${index}.image.src`}
                  label="Fotoğraf adresi"
                  value={section.image.src}
                />
                <Field
                  name={`section.${index}.image.alt`}
                  label="Fotoğraf açıklaması"
                  value={section.image.alt}
                />
              </div>
            </section>
          );
        }

        if (section.type === "services") {
          return (
            <section key={key}>
              <h2>Hizmetler{badge}</h2>
              <Field name={`section.${index}.title`} label="Bölüm başlığı" value={section.title} />
              <Field
                name={`section.${index}.intro`}
                label="Giriş cümlesi"
                value={section.intro ?? ""}
              />
              <p className="note" style={{ marginTop: 14 }}>
                Adı boş bırakılan hizmet silinir.
              </p>
              {[...section.items, { name: "", description: "" }].map((item, itemIndex) => (
                <div className="row" key={itemIndex}>
                  <input
                    type="text"
                    name={`section.${index}.item.${itemIndex}.name`}
                    defaultValue={item.name}
                    placeholder="Hizmet adı"
                    aria-label="Hizmet adı"
                  />
                  <input
                    type="text"
                    name={`section.${index}.item.${itemIndex}.description`}
                    defaultValue={item.description ?? ""}
                    placeholder="Kısa açıklama"
                    aria-label="Hizmet açıklaması"
                  />
                </div>
              ))}
            </section>
          );
        }

        if (section.type === "about") {
          return (
            <section key={key}>
              <h2>Hakkımızda{badge}</h2>
              <Field name={`section.${index}.title`} label="Bölüm başlığı" value={section.title} />
              <Area
                name={`section.${index}.body`}
                label="Metin — paragrafları boş satırla ayırın"
                value={section.body.join("\n\n")}
              />
            </section>
          );
        }

        if (section.type === "gallery") {
          return (
            <section key={key}>
              <h2>Galeri{badge}</h2>
              <Field name={`section.${index}.title`} label="Bölüm başlığı" value={section.title} />
              <p className="note" style={{ marginTop: 14 }}>
                Üst bölümdeki fotoğraf burada tekrar gösterilmez.
              </p>
              {[...section.images, { src: "", alt: "" }].map((image, imageIndex) => (
                <div className="row" key={imageIndex}>
                  <input
                    type="text"
                    name={`section.${index}.image.${imageIndex}.src`}
                    defaultValue={image.src}
                    placeholder="Fotoğraf adresi"
                    aria-label="Fotoğraf adresi"
                  />
                  <input
                    type="text"
                    name={`section.${index}.image.${imageIndex}.alt`}
                    defaultValue={image.alt}
                    placeholder="Fotoğraf açıklaması"
                    aria-label="Fotoğraf açıklaması"
                  />
                </div>
              ))}
            </section>
          );
        }

        if (section.type === "emergency") {
          return (
            <section key={key}>
              <h2>Acil bandı{badge}</h2>
              <Field name={`section.${index}.title`} label="Başlık" value={section.title} />
              <Field name={`section.${index}.note`} label="Açıklama" value={section.note} />
            </section>
          );
        }

        if (section.type === "proof") return null;

        return (
          <section key={key}>
            <h2>
              {section.type === "hours" ? "Saatler bölümü" : "İletişim bölümü"}
              {badge}
            </h2>
            <Field name={`section.${index}.title`} label="Bölüm başlığı" value={section.title} />
          </section>
        );
      })}

      <h2>Arama motoru</h2>
      <Field name="seo.title" label="Sayfa başlığı" value={content.seo.title} />
      <Area name="seo.description" label="Sayfa açıklaması" value={content.seo.description} />

      <div className="bar">
        <button type="submit" disabled={pending}>
          {pending ? "Yayınlanıyor…" : "Yayınla"}
        </button>
        {message ? <span className="msg">{message}</span> : null}
      </div>
    </form>
  );
}

function Field({ name, label, value }: { name: string; label: string; value: string }) {
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input id={name} type="text" name={name} defaultValue={value} />
    </div>
  );
}

function Area({ name, label, value }: { name: string; label: string; value: string }) {
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <textarea id={name} name={name} defaultValue={value} />
    </div>
  );
}
