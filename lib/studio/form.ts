import {
  DAY_KEYS,
  SiteContentSchema,
  type DayKey,
  type Section,
  type SiteContent,
} from "@/lib/content/schema";

/**
 * Turns the studio's flat form fields back into a SiteContent object.
 *
 * Pure and separate from React on purpose: this is where an edit can silently corrupt a
 * live demo, so it is the piece that gets tested. The existing content is the base, so a
 * field the form does not carry is preserved rather than dropped.
 */

type Fields = Record<string, string>;

export function fieldsFromFormData(data: FormData): Fields {
  const fields: Fields = {};
  for (const [key, value] of data.entries()) {
    if (typeof value === "string") fields[key] = value;
  }
  return fields;
}

const text = (fields: Fields, key: string, fallback: string) => {
  const value = fields[key];
  return value === undefined ? fallback : value.trim();
};

const number = (fields: Fields, key: string, fallback: number) => {
  const raw = fields[key];
  if (raw === undefined || raw.trim() === "") return fallback;
  const parsed = Number(raw.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Rows arrive as `services.0.name`, `services.1.name`, … in form order. */
function rows(fields: Fields, prefix: string): Fields[] {
  const collected = new Map<number, Fields>();
  for (const [key, value] of Object.entries(fields)) {
    const match = key.match(new RegExp(`^${prefix}\\.(\\d+)\\.(.+)$`));
    if (!match) continue;
    const index = Number(match[1]);
    const row = collected.get(index) ?? {};
    row[match[2]] = value;
    collected.set(index, row);
  }
  return [...collected.entries()].sort(([a], [b]) => a - b).map(([, row]) => row);
}

function sectionFromFields(section: Section, index: number, fields: Fields): Section {
  const at = (name: string, fallback: string) => text(fields, `section.${index}.${name}`, fallback);

  switch (section.type) {
    case "hero":
      return {
        ...section,
        headline: at("headline", section.headline),
        subline: at("subline", section.subline),
        image: {
          ...section.image,
          src: at("image.src", section.image.src),
          alt: at("image.alt", section.image.alt),
        },
      };
    case "services": {
      const edited = rows(fields, `section.${index}.item`)
        .map((row) => ({
          name: (row.name ?? "").trim(),
          description: (row.description ?? "").trim() || undefined,
        }))
        // An emptied name is how the operator deletes a service.
        .filter((item) => item.name.length > 0);
      return {
        ...section,
        title: at("title", section.title),
        intro: at("intro", section.intro ?? "") || undefined,
        items: edited.length > 0 ? edited : section.items,
      };
    }
    case "about": {
      const body = at("body", section.body.join("\n\n"))
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
      return {
        ...section,
        title: at("title", section.title),
        body: body.length ? body : section.body,
      };
    }
    case "gallery": {
      const images = rows(fields, `section.${index}.image`)
        .map((row) => ({ src: (row.src ?? "").trim(), alt: (row.alt ?? "").trim() }))
        .filter((image) => image.src.length > 0 && image.alt.length > 0);
      return {
        ...section,
        title: at("title", section.title),
        images: images.length > 0 ? images : section.images,
      };
    }
    case "pricelist": {
      const edited = rows(fields, `section.${index}.item`)
        .map((row) => ({
          name: (row.name ?? "").trim(),
          description: (row.description ?? "").trim() || undefined,
          price: (row.price ?? "").trim(),
          duration: (row.duration ?? "").trim() || undefined,
        }))
        .filter((item) => item.name.length > 0 && item.price.length > 0);
      return {
        ...section,
        title: at("title", section.title),
        intro: at("intro", section.intro ?? "") || undefined,
        items: edited.length > 0 ? edited : section.items,
      };
    }
    case "team": {
      const edited = rows(fields, `section.${index}.member`)
        .map((row, i) => ({
          name: (row.name ?? "").trim(),
          role: (row.role ?? "").trim(),
          image: section.members[i]?.image ?? section.members[0].image,
        }))
        .filter((m) => m.name.length > 0);
      return {
        ...section,
        title: at("title", section.title),
        intro: at("intro", section.intro ?? "") || undefined,
        members: edited.length > 0 ? edited : section.members,
      };
    }
    case "instagram":
      return {
        ...section,
        title: at("title", section.title),
        handle: at("handle", section.handle ?? "") || undefined,
      };
    case "booking":
      return {
        ...section,
        title: at("title", section.title),
        note: at("note", section.note ?? "") || undefined,
      };
    case "emergency":
      return { ...section, title: at("title", section.title), note: at("note", section.note) };
    case "proof":
      // Renders entirely from business.rating / reviewCount — nothing to edit here.
      return section;
    case "clinic": {
      const edited = rows(fields, `section.${index}.fact`)
        .map((row) => ({ value: (row.value ?? "").trim(), label: (row.label ?? "").trim() }))
        .filter((fact) => fact.value.length > 0 && fact.label.length > 0);
      return {
        ...section,
        title: at("title", section.title),
        body: at("body", section.body),
        image: {
          ...section.image,
          src: at("image.src", section.image.src),
          alt: at("image.alt", section.image.alt),
        },
        facts: edited.length > 0 ? edited : section.facts,
      };
    }
    case "treatments": {
      const edited = rows(fields, `section.${index}.item`)
        .map((row, position) => ({
          name: (row.name ?? "").trim(),
          note: (row.note ?? "").trim() || undefined,
          image: section.items[position]?.image ?? section.items[0].image,
        }))
        .filter((item) => item.name.length > 0);
      return {
        ...section,
        title: at("title", section.title),
        intro: at("intro", section.intro ?? "") || undefined,
        items: edited.length > 0 ? edited : section.items,
      };
    }
    // The planner's goals and the before/after pairs are structured data, not prose. The
    // studio edits what surrounds them; the shapes themselves come from the pack.
    case "planner":
      return {
        ...section,
        title: at("title", section.title),
        intro: at("intro", section.intro ?? "") || undefined,
        note: at("note", section.note),
      };
    case "beforeAfter":
      return {
        ...section,
        title: at("title", section.title),
        intro: at("intro", section.intro ?? "") || undefined,
        disclaimer: at("disclaimer", section.disclaimer),
      };
    case "hours":
    case "contact":
      return { ...section, title: at("title", section.title) };
  }
}

export function contentFromFields(base: SiteContent, fields: Fields): SiteContent {
  const hours = Object.fromEntries(
    DAY_KEYS.map((day) => {
      if (fields[`hours.${day}.closed`] === "on") return [day, "closed" as const];
      const existing = base.hours[day];
      const fallbackOpen = existing === "closed" ? "09:00" : existing.open;
      const fallbackClose = existing === "closed" ? "18:00" : existing.close;
      return [
        day,
        {
          open: text(fields, `hours.${day}.open`, fallbackOpen),
          close: text(fields, `hours.${day}.close`, fallbackClose),
        },
      ];
    }),
  ) as Record<DayKey, SiteContent["hours"][DayKey]>;

  const instagram = text(fields, "business.instagram", base.business.instagram ?? "");

  return {
    ...base,
    preset: text(fields, "preset", base.preset),
    business: {
      ...base.business,
      name: text(fields, "business.name", base.business.name),
      district: text(fields, "business.district", base.business.district),
      neighborhood: text(fields, "business.neighborhood", base.business.neighborhood),
      phone: text(fields, "business.phone", base.business.phone),
      whatsapp: text(fields, "business.whatsapp", base.business.whatsapp),
      rating: number(fields, "business.rating", base.business.rating ?? 0),
      reviewCount: Math.round(
        number(fields, "business.reviewCount", base.business.reviewCount ?? 0),
      ),
      fiveStarPct: Math.round(
        number(fields, "business.fiveStarPct", base.business.fiveStarPct ?? 0),
      ),
      lat: number(fields, "business.lat", base.business.lat),
      lng: number(fields, "business.lng", base.business.lng),
      mapsUrl: text(fields, "business.mapsUrl", base.business.mapsUrl),
      instagram: instagram || undefined,
    },
    hours: { ...hours, note: text(fields, "hours.note", base.hours.note ?? "") || undefined },
    whatsappMessage: text(fields, "whatsappMessage", base.whatsappMessage),
    seo: {
      title: text(fields, "seo.title", base.seo.title),
      description: text(fields, "seo.description", base.seo.description),
    },
    sections: base.sections.map((section, index) => sectionFromFields(section, index, fields)),
  };
}

export type ValidationResult =
  { ok: true; content: SiteContent } | { ok: false; errors: { field: string; message: string }[] };

/** Turkish labels, because the only person who reads these is the operator. */
const FIELD_LABELS: Record<string, string> = {
  "business.name": "İşletme adı",
  "business.phone": "Telefon (+90 ile, 10 hane)",
  "business.whatsapp": "WhatsApp bağlantısı",
  "business.mapsUrl": "Google Haritalar bağlantısı",
  "business.rating": "Google puanı",
  "business.reviewCount": "Değerlendirme sayısı",
  "business.fiveStarPct": "Beş yıldız yüzdesi",
  "business.instagram": "Instagram bağlantısı",
  whatsappMessage: "WhatsApp mesajı",
  "seo.title": "Sayfa başlığı",
  "seo.description": "Sayfa açıklaması",
  slug: "Adres (slug)",
};

export function validate(candidate: SiteContent): ValidationResult {
  const parsed = SiteContentSchema.safeParse(candidate);
  if (parsed.success) return { ok: true, content: parsed.data };

  return {
    ok: false,
    errors: parsed.error.issues.map((issue) => {
      const path = issue.path.join(".");
      return { field: FIELD_LABELS[path] ?? path, message: issue.message };
    }),
  };
}

/**
 * Sections whose copy came from the industry pack rather than from the business. The
 * studio badges these so a site is never handed to a client still describing services
 * the pack guessed at.
 */
export function placeholderCount(content: SiteContent): number {
  return content.sections.filter((section) => section.placeholder).length;
}
