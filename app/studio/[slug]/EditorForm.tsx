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
          View live site: /{slug} ↗
        </a>
      </p>

      <h2>Business</h2>
      <div className="grid">
        <Field name="business.name" label="Business name" value={business.name} />
        <Field name="business.neighborhood" label="Neighbourhood" value={business.neighborhood} />
        <Field name="business.district" label="District" value={business.district} />
        <Field name="business.phone" label="Phone (+905XXXXXXXXX)" value={business.phone} />
        <Field name="business.whatsapp" label="WhatsApp link" value={business.whatsapp} />
        <Field
          name="business.instagram"
          label="Instagram (optional)"
          value={business.instagram ?? ""}
        />
        <Field name="business.rating" label="Google rating" value={String(business.rating ?? "")} />
        <Field
          name="business.reviewCount"
          label="Review count"
          value={String(business.reviewCount ?? "")}
        />
        <Field
          name="business.fiveStarPct"
          label="Five-star %"
          value={String(business.fiveStarPct ?? "")}
        />
        <Field name="business.lat" label="Latitude" value={String(business.lat)} />
        <Field name="business.lng" label="Longitude" value={String(business.lng)} />
        <Field name="business.mapsUrl" label="Google Maps link" value={business.mapsUrl} />
      </div>

      <h2>Design</h2>
      <label htmlFor="preset">Template</label>
      <select id="preset" name="preset" defaultValue={content.preset}>
        {presets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.label}
          </option>
        ))}
      </select>

      <h2>Opening hours</h2>
      {dayKeys.map((day) => {
        const slot = content.hours[day];
        const closed = slot === "closed";
        return (
          <div className="hours" key={day}>
            <span>{dayNames[day]}</span>
            <div>
              <label htmlFor={`hours.${day}.open`}>Opens</label>
              <input
                id={`hours.${day}.open`}
                type="text"
                name={`hours.${day}.open`}
                defaultValue={closed ? "" : slot.open}
                placeholder="09:00"
              />
            </div>
            <div>
              <label htmlFor={`hours.${day}.close`}>Closes</label>
              <input
                id={`hours.${day}.close`}
                type="text"
                name={`hours.${day}.close`}
                defaultValue={closed ? "" : slot.close}
                placeholder="19:00"
              />
            </div>
            <label style={{ whiteSpace: "nowrap", marginBottom: 9 }}>
              <input type="checkbox" name={`hours.${day}.closed`} defaultChecked={closed} /> Closed
            </label>
          </div>
        );
      })}
      <Field
        name="hours.note"
        label="Note under the hours (shown in Turkish)"
        value={content.hours.note ?? ""}
      />

      <h2>Contact</h2>
      <Area
        name="whatsappMessage"
        label="Prefilled WhatsApp message (Turkish — the customer sees this)"
        value={content.whatsappMessage}
      />

      {content.sections.map((section, index) => {
        const key = `${section.type}-${index}`;
        const badge = section.placeholder ? <span className="badge">draft copy</span> : null;

        if (section.type === "hero") {
          return (
            <section key={key}>
              <h2>Hero{badge}</h2>
              <Field name={`section.${index}.headline`} label="Headline" value={section.headline} />
              <Area name={`section.${index}.subline`} label="Subheading" value={section.subline} />
              <div className="grid">
                <Field
                  name={`section.${index}.image.src`}
                  label="Photo URL"
                  value={section.image.src}
                />
                <Field
                  name={`section.${index}.image.alt`}
                  label="Photo alt text"
                  value={section.image.alt}
                />
              </div>
            </section>
          );
        }

        if (section.type === "services") {
          return (
            <section key={key}>
              <h2>Services{badge}</h2>
              <Field
                name={`section.${index}.title`}
                label="Section heading"
                value={section.title}
              />
              <Field
                name={`section.${index}.intro`}
                label="Intro line"
                value={section.intro ?? ""}
              />
              <p className="note" style={{ marginTop: 14 }}>
                Clearing a name deletes that service.
              </p>
              {[...section.items, { name: "", description: "" }].map((item, itemIndex) => (
                <div className="row" key={itemIndex}>
                  <input
                    type="text"
                    name={`section.${index}.item.${itemIndex}.name`}
                    defaultValue={item.name}
                    placeholder="Service name"
                    aria-label="Service name"
                  />
                  <input
                    type="text"
                    name={`section.${index}.item.${itemIndex}.description`}
                    defaultValue={item.description ?? ""}
                    placeholder="Short description"
                    aria-label="Service description"
                  />
                </div>
              ))}
            </section>
          );
        }

        if (section.type === "about") {
          return (
            <section key={key}>
              <h2>About{badge}</h2>
              <Field
                name={`section.${index}.title`}
                label="Section heading"
                value={section.title}
              />
              <Area
                name={`section.${index}.body`}
                label="Body — separate paragraphs with a blank line"
                value={section.body.join("\n\n")}
              />
            </section>
          );
        }

        if (section.type === "gallery") {
          return (
            <section key={key}>
              <h2>Gallery{badge}</h2>
              <Field
                name={`section.${index}.title`}
                label="Section heading"
                value={section.title}
              />
              <p className="note" style={{ marginTop: 14 }}>
                A photo already used in the hero is not repeated here.
              </p>
              {[...section.images, { src: "", alt: "" }].map((image, imageIndex) => (
                <div className="row" key={imageIndex}>
                  <input
                    type="text"
                    name={`section.${index}.image.${imageIndex}.src`}
                    defaultValue={image.src}
                    placeholder="Photo URL"
                    aria-label="Photo URL"
                  />
                  <input
                    type="text"
                    name={`section.${index}.image.${imageIndex}.alt`}
                    defaultValue={image.alt}
                    placeholder="Photo alt text"
                    aria-label="Photo alt text"
                  />
                </div>
              ))}
            </section>
          );
        }

        if (section.type === "emergency") {
          return (
            <section key={key}>
              <h2>Emergency band{badge}</h2>
              <Field name={`section.${index}.title`} label="Headline" value={section.title} />
              <Field name={`section.${index}.note`} label="Note" value={section.note} />
            </section>
          );
        }

        if (section.type === "proof") return null;

        return (
          <section key={key}>
            <h2>
              {section.type === "hours" ? "Hours section" : "Contact section"}
              {badge}
            </h2>
            <Field name={`section.${index}.title`} label="Section heading" value={section.title} />
          </section>
        );
      })}

      <h2>Search engine</h2>
      <Field name="seo.title" label="Page title (Turkish)" value={content.seo.title} />
      <Area
        name="seo.description"
        label="Page description (Turkish)"
        value={content.seo.description}
      />

      <div className="bar">
        <button type="submit" disabled={pending}>
          {pending ? "Publishing…" : "Publish"}
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
