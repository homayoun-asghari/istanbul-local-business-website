import type { Preset } from "../types";

/**
 * 01 Cam — "glass".
 *
 * Built from the Celestia Smiles study in work/design-v3: a deep blue page, one white
 * card floating on it, and translucent glass dental objects carrying every image on the
 * site. That last part is not decoration — it is the answer to this pack's hardest
 * constraint. A dental lead arrives with one storefront snap from Google Maps and no
 * clinical photography at all, and a glass molar needs no clinic to have photographed
 * anything.
 *
 * The palette is four values plus white, which is what both Ronas case studies publish
 * and the reason those pages look expensive.
 */
export const cam: Preset = {
  id: "cam",
  label: "Cam — derin mavi, cam objeler, büyük serif değil",
  fonts: { display: "manrope", body: "manrope" },
  hero: "cam",
  stock: {
    hero: "/stock/dental/hero-molar.webp",
    heroAlt: "Cam dokulu diş modeli",
    tiles: [
      "/stock/dental/tile-tooth.webp",
      "/stock/dental/tile-aligner.webp",
      "/stock/dental/tile-implant.webp",
      "/stock/dental/tile-arch.webp",
      "/stock/dental/tile-crown.webp",
    ],
    staff: [
      "/stock/dental/doctor-1.webp",
      "/stock/dental/doctor-2.webp",
      "/stock/dental/doctor-3.webp",
    ],
  },
  tokens: {
    ground: "#0B2D5E",
    surface: "#FFFFFF",
    ink: "#12386B",
    inkSoft: "#43618C",
    muted: "#7D93B2",
    line: "#DCE7F5",
    brand: "#1D6FE0",
    brandInk: "#FFFFFF",
    accent: "#2F83E8",
    radius: "18px",
    radiusPill: "999px",
  },
};

export const DENTAL_PRESETS: Record<string, Preset> = { cam };
