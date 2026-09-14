import type { Preset } from "../types";

/**
 * A veteriner's site is opened in a hurry, often at night. These read as calm and
 * medical rather than cute — no paw prints, no pastel — because the person looking is
 * worried, not shopping.
 */
export const klinik: Preset = {
  id: "klinik",
  label: "Klinik — beyaz, petrol mavisi, yumuşak köşe",
  fonts: { display: "manrope", body: "manrope" },
  tokens: {
    ground: "#F6F8F9",
    surface: "#FFFFFF",
    ink: "#111A20",
    inkSoft: "#33454F",
    muted: "#6B7C86",
    line: "#DCE4E8",
    brand: "#12546E",
    brandInk: "#F2F9FC",
    accent: "#B4402F",
    radius: "12px",
    radiusPill: "999px",
  },
};

/** Warmer, for neighbourhood practices that trade on being familiar rather than clinical. */
export const mahalle: Preset = {
  id: "mahalle",
  label: "Mahalle — sıcak bej, yeşil, geniş köşe",
  fonts: { display: "jost", body: "jost" },
  tokens: {
    ground: "#F7F5F0",
    surface: "#FFFFFF",
    ink: "#1A1D16",
    inkSoft: "#3E4436",
    muted: "#767C68",
    line: "#E4E0D5",
    brand: "#3B5B37",
    brandInk: "#F5F8F2",
    accent: "#B4552B",
    radius: "18px",
    radiusPill: "999px",
  },
};

/**
 * Güneş — after VetCare. Cream page, sunflower blobs breaking the section edges, a heavy
 * book serif and a person hugging their dog as the whole hero: the neighbourhood clinic
 * a first-time owner trusts with their animal.
 */
export const gunes: Preset = {
  id: "gunes",
  label: "Güneş — krem, ayçiçeği sarısı, lacivert",
  fonts: { display: "source-serif", body: "source-serif" },
  hero: "gunes",
  stock: {
    hero: "/stock/vet/owner-beagle.webp",
    heroAlt: "Kucağında beagle köpeğiyle yere oturmuş gülümseyen kadın",
    tiles: ["/stock/vet/clinic-exam.webp", "/stock/vet/faq-groom.webp"],
    staff: [
      "/stock/vet/vet-portrait-1.webp",
      "/stock/vet/vet-portrait-2.webp",
      "/stock/vet/vet-portrait-3.webp",
    ],
    extras: {
      cat: "/stock/vet/tabby.webp",
      servicesPet: "/stock/vet/maltese.webp",
    },
  },
  tokens: {
    ground: "#FEF6DF",
    surface: "#FFFFFF",
    ink: "#171717",
    inkSoft: "#474747",
    muted: "#7A7466",
    line: "#EADFC2",
    brand: "#1D2E51",
    brandInk: "#FFFFFF",
    accent: "#F0452D",
    radius: "18px",
    radiusPill: "8px",
  },
};

/**
 * Nabız — after Pampaw. A blue gradient hero with a faint grid and one word set enormous
 * behind a vet and her dog: "7/24" for a clinic that never closes, the district for one
 * that does. Opening hours are the one thing the rules let a clinic put in lights.
 */
export const nabiz: Preset = {
  id: "nabiz",
  label: "Nabız — mavi, lacivert, turuncu",
  fonts: { display: "poppins", body: "poppins" },
  hero: "nabiz",
  stock: {
    hero: "/stock/vet/vet-retriever.webp",
    heroAlt: "Mavi önlüklü veteriner hekim golden retriever köpeğin patisini tutuyor",
    tiles: ["/stock/vet/clinic-exam.webp", "/stock/vet/faq-groom.webp"],
    staff: [
      "/stock/vet/vet-portrait-1.webp",
      "/stock/vet/vet-portrait-2.webp",
      "/stock/vet/vet-portrait-3.webp",
    ],
    extras: {
      cat: "/stock/vet/tabby.webp",
      guide: "/stock/vet/dog-line.webp",
      duo: "/stock/vet/dog-cat.webp",
    },
  },
  tokens: {
    ground: "#FFFFFF",
    surface: "#F4F7FA",
    ink: "#262B4A",
    inkSoft: "#4A5170",
    muted: "#7C839D",
    line: "#E3E8EF",
    brand: "#262B4A",
    brandInk: "#FFFFFF",
    accent: "#F96F3E",
    radius: "16px",
    radiusPill: "10px",
  },
};

export const VET_PRESETS: Record<string, Preset> = { gunes, nabiz, klinik, mahalle };
