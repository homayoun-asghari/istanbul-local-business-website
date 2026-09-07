import { inferIndustry, type Industry } from "./industry";
import { slugify } from "./slug";

/**
 * Parses the operator's own leads sheet, exported as CSV and pasted into the studio.
 *
 * Column-mapped by header name rather than by position, because the sheet grows columns.
 * Importing is idempotent on `sourceKey`, so re-pasting an updated export is safe.
 */
export type Lead = {
  sourceKey: string;
  business: string;
  slug: string;
  industry: Industry;
  phone: string | null;
  waLink: string | null;
  rating: number | null;
  reviews: number | null;
  pctFive: number | null;
  photos: number | null;
  social: string | null;
  mapsPlace: string | null;
  photo: string | null;
  neighborhood: string | null;
  district: string | null;
  lat: number | null;
  lng: number | null;
  contacted: boolean;
  demoBuilt: boolean;
  demoUrl: string | null;
};

/** RFC-4180 enough for a Google Sheets export: quoted fields, doubled quotes, CRLF. */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < input.length; i++) {
    const character = input[i];
    if (quoted) {
      if (character === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += character;
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && input[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += character;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((entry) => entry.some((cell) => cell.trim() !== ""));
}

const clean = (value: string | undefined): string | null => {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
};

const num = (value: string | undefined): number | null => {
  const text = clean(value);
  if (text === null) return null;
  const parsed = Number(text.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

const truthy = (value: string | undefined) => /^(true|yes|evet|1|x)$/i.test((value ?? "").trim());

/** The sheet stores a Maps pano link, not an image; the coordinates inside it are usable. */
export function coordsFromStreetView(url: string | null): {
  lat: number | null;
  lng: number | null;
} {
  if (!url) return { lat: null, lng: null };
  // Sheets exports the separator as "," or "%2C" depending on how the link was built.
  const match = decodeURIComponent(url).match(/viewpoint=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (!match) return { lat: null, lng: null };
  return { lat: Number(match[1]), lng: Number(match[2]) };
}

/** +90 555 123 45 67, 0555…, 90555… all normalise to +905551234567. */
export function normalisePhone(raw: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  const local = digits.startsWith("90") ? digits.slice(2) : digits.replace(/^0/, "");
  return local.length === 10 ? `+90${local}` : null;
}

export function leadsFromCsv(csv: string): { leads: Lead[]; skipped: number } {
  const rows = parseCsv(csv);
  if (rows.length < 2) return { leads: [], skipped: 0 };

  const header = rows[0].map((cell) => cell.trim().toLowerCase().replace(/\s+/g, "_"));
  const at = (row: string[], name: string) => {
    const index = header.indexOf(name);
    return index === -1 ? undefined : row[index];
  };

  const leads: Lead[] = [];
  let skipped = 0;

  for (const row of rows.slice(1)) {
    const business = clean(at(row, "business"));
    if (!business) {
      skipped++;
      continue;
    }
    const { lat, lng } = coordsFromStreetView(clean(at(row, "streetview")));
    const phone = normalisePhone(clean(at(row, "phone")));
    leads.push({
      sourceKey: slugify(business) || business,
      business,
      slug: slugify(business),
      industry: inferIndustry(business),
      phone,
      waLink:
        clean(at(row, "wa_link")) ?? (phone ? `https://wa.me/${phone.replace("+", "")}` : null),
      rating: num(at(row, "rating")),
      reviews: num(at(row, "reviews")),
      pctFive: num(at(row, "pct_five")),
      photos: num(at(row, "photos")),
      social: clean(at(row, "social")),
      mapsPlace: clean(at(row, "maps_place")),
      photo: clean(at(row, "photo")),
      neighborhood: clean(at(row, "neighborhood")),
      district: clean(at(row, "district")),
      lat,
      lng,
      contacted: truthy(at(row, "contacted")),
      demoBuilt: truthy(at(row, "demo_built")),
      demoUrl: clean(at(row, "demo_url")),
    });
  }
  return { leads, skipped };
}
