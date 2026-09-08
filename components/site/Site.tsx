import type { SiteContent } from "@/lib/content/schema";
import { presetCssVars } from "@/packs/types";
import { presetFor } from "@/packs/registry";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Proof } from "./Proof";
import { Emergency } from "./Emergency";
import { PriceList } from "./PriceList";
import { Team } from "./Team";
import { InstagramStrip } from "./InstagramStrip";
import { Booking } from "./Booking";
import { Services } from "./Services";
import { About } from "./About";
import { Gallery } from "./Gallery";
import { HoursSection } from "./HoursSection";
import { Contact } from "./Contact";
import { ContactBar } from "./ContactBar";
import { Footer } from "./Footer";
import { Signals } from "./Signals";

/**
 * The whole render layer, entered here. It takes a validated SiteContent object and a
 * clock, and nothing else — no database, no request context, no environment. That is
 * what lets `npm run eject` copy this directory into a client's own repository, where
 * none of those things exist. See docs/ARCHITECTURE.md.
 */
export function Site({
  content,
  now,
  trackAs,
}: {
  content: SiteContent;
  now: Date;
  /** Set on the multi-tenant demo host only. An ejected client site never reports. */
  trackAs?: string;
}) {
  const preset = presetFor(content);
  const sections = withoutRepeatedPhotos(
    withPresetPhotography(content.sections, preset.stock?.tiles, preset.stock?.staff),
  );
  // The chrome hero carries its own navigation, so the shared header would be a second one.
  const SALON_HEROES = new Set(["kesim", "gece", "kemer", "makro", "menu", "sade"]);
  const ownsHeader = preset.hero === "chrome" || SALON_HEROES.has(preset.hero ?? "");

  return (
    <div style={presetCssVars(preset) as React.CSSProperties} className="bg-ground text-ink">
      {ownsHeader ? null : <Header content={content} />}
      <main>
        {sections.map((section, index) => {
          const key = `${section.type}-${index}`;
          switch (section.type) {
            case "hero":
              return <Hero key={key} section={section} content={content} now={now} />;
            case "proof":
              return <Proof key={key} content={content} />;
            case "emergency":
              return <Emergency key={key} section={section} content={content} />;
            case "services":
              return <Services key={key} section={section} />;
            case "about":
              return <About key={key} section={section} />;
            case "gallery":
              return <Gallery key={key} section={section} />;
            case "hours":
              return <HoursSection key={key} section={section} content={content} now={now} />;
            case "contact":
              return <Contact key={key} section={section} content={content} />;
            case "pricelist":
              return <PriceList key={key} section={section} />;
            case "team":
              return <Team key={key} section={section} />;
            case "instagram":
              return <InstagramStrip key={key} section={section} content={content} />;
            case "booking":
              return <Booking key={key} section={section} content={content} />;
          }
        })}
      </main>
      <Footer content={content} year={now.getUTCFullYear()} />
      <ContactBar content={content} />
      {trackAs ? <Signals slug={trackAs} /> : null}
    </div>
  );
}

/**
 * Most leads come with exactly one photo from their Google listing. Showing it in the
 * hero and again in the gallery reads as padding — the owner notices immediately that
 * it is the same picture twice. Drop gallery images already used above, and drop the
 * gallery entirely if nothing is left.
 */
function withoutRepeatedPhotos(sections: SiteContent["sections"]): SiteContent["sections"] {
  const seen = new Set<string>();
  const kept: SiteContent["sections"] = [];

  for (const section of sections) {
    if (section.type === "hero") {
      seen.add(section.image.src);
      kept.push(section);
      continue;
    }
    if (section.type === "gallery") {
      const images = section.images.filter((image) => !seen.has(image.src));
      for (const image of images) seen.add(image.src);
      if (images.length === 0) continue;
      kept.push({ ...section, images });
      continue;
    }
    kept.push(section);
  }
  return kept;
}

/**
 * Swaps the tile imagery for the preset's own.
 *
 * These leads have exactly one usable photograph — a storefront shot from the street —
 * and a gallery, a team grid and an Instagram strip need eight. The preset supplies them,
 * so switching template switches the whole photographic world with it rather than
 * stretching one snapshot into shapes it was never going to fill.
 */
function withPresetPhotography(
  sections: SiteContent["sections"],
  tiles: string[] | undefined,
  staff: string[] | undefined,
): SiteContent["sections"] {
  if (!tiles || tiles.length === 0) return sections;
  const pick = (index: number) => tiles[index % tiles.length];

  return sections.map((section) => {
    if (section.type === "gallery") {
      // These leads have one photograph, so the gallery arrives with a single image and
      // renders as one lonely 16:9 band. Three tiles, offset past the ones the price
      // list already used, fill the grid without repeating a picture on the way down.
      const images = [0, 1, 2].map((i) => ({
        ...section.images[0],
        src: pick(i + 2),
      }));
      return { ...section, images };
    }
    if (section.type === "instagram") {
      return { ...section, images: section.images.map((im, i) => ({ ...im, src: pick(i) })) };
    }
    if (section.type === "team") {
      // Staff portraits when the preset has them: a close-up of a manicure captioned
      // "Melike — Kurucu" reads as a broken page, not as a team.
      const faces = staff && staff.length > 0 ? staff : tiles;
      return {
        ...section,
        members: section.members.map((m, i) => ({
          ...m,
          image: { ...m.image, src: faces[i % faces.length] },
        })),
      };
    }
    if (section.type === "pricelist") {
      return {
        ...section,
        items: section.items.map((item, i) =>
          item.image ? { ...item, image: { ...item.image, src: pick(i) } } : item,
        ),
      };
    }
    return section;
  });
}
