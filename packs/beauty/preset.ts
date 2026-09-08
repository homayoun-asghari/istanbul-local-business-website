import type { Preset } from "../types";

/**
 * Three complete looks, not three colour swaps. Ten demos that differ only in accent hue
 * read as ten copies of one site — exactly the impression that loses the sale — so each
 * preset changes typeface, edge language and rhythm as well.
 */
export const atolye: Preset = {
  id: "atolye",
  label: "Atölye — kemik beyazı, şarap, pirinç",
  fonts: { display: "bodoni-moda", body: "jost" },
  tokens: {
    ground: "#F4F2ED",
    surface: "#FFFFFF",
    ink: "#1B1A17",
    inkSoft: "#3D3A34",
    muted: "#77726A",
    line: "#E2DDD3",
    brand: "#5E2A38",
    brandInk: "#F8F2EF",
    accent: "#A98356",
    radius: "0px",
    radiusPill: "999px",
  },
};

/** Clinical calm: cool greys, deep teal, soft edges. Reads as a medical aesthetics clinic. */
export const klinik: Preset = {
  id: "klinik",
  label: "Klinik — buz grisi, petrol yeşili, yumuşak köşe",
  fonts: { display: "cormorant-garamond", body: "manrope" },
  tokens: {
    ground: "#F5F7F7",
    surface: "#FFFFFF",
    ink: "#141C1D",
    inkSoft: "#37474A",
    muted: "#6E8083",
    line: "#DDE5E6",
    brand: "#12595C",
    brandInk: "#F2FAFA",
    accent: "#C08A5A",
    radius: "14px",
    radiusPill: "999px",
  },
};

/** Evening luxe: near-black ground, warm gold. For salons that trade on glamour. */
export const geceKlasik: Preset = {
  id: "gece-klasik",
  label: "Gece Klasik — koyu zemin, altın, keskin köşe",
  fonts: { display: "cormorant-garamond", body: "jost" },
  tokens: {
    ground: "#14110F",
    surface: "#1D1917",
    ink: "#F3EDE6",
    inkSoft: "#D2C8BC",
    muted: "#968B7E",
    line: "#2C2521",
    brand: "#C2A163",
    brandInk: "#17130F",
    accent: "#8C6A3A",
    radius: "2px",
    radiusPill: "999px",
  },
};

/**
 * "Krom" — the pinned, animated one. Near-black ground, two drifting glows and a molten
 * metal object; the business photograph does not appear until the second screen, which is
 * the whole point. Onest thin at display size, heavy on the last two words.
 */
export const krom: Preset = {
  id: "krom",
  label: "Krom — koyu zemin, sıvı metal, hareketli",
  fonts: { display: "onest", body: "onest" },
  hero: "chrome",
  tokens: {
    ground: "#0A0A0C",
    surface: "#131316",
    ink: "#F4F0EA",
    inkSoft: "#CFC8BF",
    muted: "#8B857E",
    line: "#22222A",
    brand: "#E8A05C",
    brandInk: "#14100C",
    accent: "#B4506B",
    radius: "18px",
    radiusPill: "999px",
  },
};

/* ---------------------------------------------------------------------------
   The salon set. Every ground below was sampled from its own reference render so
   the built page matches the design pixel for pixel rather than approximately.
   --------------------------------------------------------------------------- */

/** 01 — the interleave. A cut-out subject layered into an enormous magenta serif. */
export const kesim: Preset = {
  id: "kesim",
  stock: {
    hero: "/stock/kesim-woman.jpg",
    heroAlt: "Salonumuzun stil çekiminden bir kare",
    tiles: [
      "/stock/thumb-1.jpg",
      "/stock/thumb-3.jpg",
      "/stock/thumb-4.jpg",
      "/stock/thumb-5.jpg",
      "/stock/thumb-6.jpg",
      "/stock/thumb-2.jpg",
    ],
    staff: ["/stock/staff-1.jpg", "/stock/staff-2.jpg", "/stock/staff-3.jpg", "/stock/staff-4.jpg"],
  },
  label: "Kesim — greige, magenta, dev serif",
  fonts: { display: "playfair", body: "dm-sans" },
  hero: "kesim",
  tokens: {
    ground: "#ECD6BF",
    surface: "#FFFFFF",
    ink: "#1A1310",
    inkSoft: "#4A3A31",
    muted: "#8A7364",
    line: "#DCC3A9",
    brand: "#D6207E",
    brandInk: "#FFF4F9",
    accent: "#1A1310",
    radius: "2px",
    radiusPill: "999px",
  },
};

/** 02 — the photograph is the whole page. */
export const gece: Preset = {
  id: "gece",
  stock: {
    hero: "/stock/gece-hair.jpg",
    heroAlt: "Saç bakımı sonrası parlak, hareketli saçlar",
    tiles: [
      "/stock/thumb-5.jpg",
      "/stock/thumb-1.jpg",
      "/stock/thumb-4.jpg",
      "/stock/thumb-3.jpg",
      "/stock/thumb-6.jpg",
      "/stock/thumb-2.jpg",
    ],
    staff: ["/stock/staff-1.jpg", "/stock/staff-2.jpg", "/stock/staff-3.jpg", "/stock/staff-4.jpg"],
  },
  label: "Gece — tam ekran fotoğraf, koyu, ten rengi",
  fonts: { display: "marcellus", body: "dm-sans" },
  hero: "gece",
  tokens: {
    ground: "#0D0E0D",
    surface: "#161715",
    ink: "#F2EBE4",
    inkSoft: "#D6CCC1",
    muted: "#9A8F84",
    line: "#272724",
    brand: "#E4C9A8",
    brandInk: "#17130E",
    accent: "#B98F63",
    radius: "2px",
    radiusPill: "999px",
  },
};

/** 03 — blush, terracotta, arches. The softest sell. */
export const kemer: Preset = {
  id: "kemer",
  stock: {
    hero: "/stock/kemer-portrait.jpg",
    heroAlt: "Cilt bakımı sonrası ışıldayan bir müşterimiz",
    tiles: [
      "/stock/kemer-nails.jpg",
      "/stock/kemer-hands.jpg",
      "/stock/thumb-4.jpg",
      "/stock/thumb-1.jpg",
      "/stock/thumb-6.jpg",
      "/stock/thumb-5.jpg",
    ],
    staff: ["/stock/staff-1.jpg", "/stock/staff-2.jpg", "/stock/staff-3.jpg", "/stock/staff-4.jpg"],
  },
  label: "Kemer — pudra, terrakota, kemerli fotoğraf",
  fonts: { display: "cormorant-garamond", body: "dm-sans" },
  hero: "kemer",
  tokens: {
    ground: "#FFF3EE",
    surface: "#FFFFFF",
    ink: "#2B1A14",
    inkSoft: "#5A4038",
    muted: "#9A7C70",
    line: "#F0DED6",
    brand: "#B4552B",
    brandInk: "#FFF6F2",
    accent: "#D89A78",
    radius: "16px",
    radiusPill: "999px",
  },
};

/** 04 — the macro crop with a script line. */
export const makro: Preset = {
  id: "makro",
  stock: {
    hero: "/stock/makro-hand.jpg",
    heroAlt: "Kalıcı oje uygulanmış eller, yakın çekim",
    tiles: [
      "/stock/thumb-3.jpg",
      "/stock/thumb-1.jpg",
      "/stock/thumb-2.jpg",
      "/stock/thumb-4.jpg",
      "/stock/thumb-6.jpg",
      "/stock/thumb-5.jpg",
    ],
    staff: ["/stock/staff-1.jpg", "/stock/staff-2.jpg", "/stock/staff-3.jpg", "/stock/staff-4.jpg"],
  },
  label: "Makro — yakın çekim, el yazısı, koyu",
  fonts: { display: "marcellus", body: "dm-sans" },
  hero: "makro",
  tokens: {
    ground: "#0C0804",
    surface: "#171008",
    ink: "#EFE3DA",
    inkSoft: "#D2C2B4",
    muted: "#9C8A7C",
    line: "#251A11",
    brand: "#C8443F",
    brandInk: "#FFF2EF",
    accent: "#E0B486",
    radius: "2px",
    radiusPill: "999px",
  },
};

/** 05 — half photograph, half price list. */
export const menu: Preset = {
  id: "menu",
  stock: {
    hero: "/stock/menu-salon.jpg",
    heroAlt: "Salonumuzda saç şekillendirme uygulaması",
    tiles: [
      "/stock/thumb-6.jpg",
      "/stock/thumb-1.jpg",
      "/stock/thumb-3.jpg",
      "/stock/thumb-4.jpg",
      "/stock/thumb-5.jpg",
      "/stock/thumb-2.jpg",
    ],
    staff: ["/stock/staff-1.jpg", "/stock/staff-2.jpg", "/stock/staff-3.jpg", "/stock/staff-4.jpg"],
  },
  label: "Menü — fiyat listesi, krem, kahve",
  fonts: { display: "marcellus", body: "dm-sans" },
  hero: "menu",
  tokens: {
    ground: "#FFFBF2",
    surface: "#FFFFFF",
    ink: "#241713",
    inkSoft: "#5D4038",
    muted: "#8C7268",
    line: "#EADFD0",
    brand: "#5D3222",
    brandInk: "#FFF8F2",
    accent: "#C9A227",
    radius: "8px",
    radiusPill: "999px",
  },
};

/** 06 — the verified palette, read off a live salon site. */
export const sade: Preset = {
  id: "sade",
  stock: {
    hero: "/stock/sade-facial.jpg",
    heroAlt: "Yüz bakımı seansında maske uygulaması",
    tiles: [
      "/stock/thumb-4.jpg",
      "/stock/thumb-1.jpg",
      "/stock/thumb-6.jpg",
      "/stock/thumb-3.jpg",
      "/stock/thumb-5.jpg",
      "/stock/thumb-2.jpg",
    ],
    staff: ["/stock/staff-1.jpg", "/stock/staff-2.jpg", "/stock/staff-3.jpg", "/stock/staff-4.jpg"],
  },
  label: "Sade — sıcak krem, kahve, tek fotoğraf",
  fonts: { display: "marcellus", body: "dm-sans" },
  hero: "sade",
  tokens: {
    ground: "#FFF8EB",
    surface: "#FFFFFF",
    ink: "#241713",
    inkSoft: "#5D4038",
    muted: "#8C7268",
    line: "#EDE0CE",
    brand: "#5D3222",
    brandInk: "#FDF7EF",
    accent: "#D9C4B4",
    radius: "10px",
    radiusPill: "999px",
  },
};

export const BEAUTY_PRESETS: Record<string, Preset> = {
  kesim,
  gece,
  kemer,
  makro,
  menu,
  sade,
  atolye,
  klinik,
  krom,
  "gece-klasik": geceKlasik,
};
