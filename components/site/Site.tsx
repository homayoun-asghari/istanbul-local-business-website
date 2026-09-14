import type { SiteContent } from "@/lib/content/schema";
import { presetCssVars } from "@/packs/types";
import { presetFor } from "@/packs/registry";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Proof } from "./Proof";
import { Emergency } from "./Emergency";
import { PriceList } from "./PriceList";
import { Team } from "./Team";
import { Specialists } from "./Specialists";
import { Clinic } from "./Clinic";
import { Treatments } from "./Treatments";
import { Planner } from "./Planner";
import { BeforeAfter } from "./BeforeAfter";
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
import { VetServices } from "./VetServices";
import { VetAbout } from "./VetAbout";
import { VetEmergency } from "./VetEmergency";
import { VetTeam } from "./VetTeam";
import { VetVisit } from "./VetVisit";
import { Vaccines } from "./Vaccines";
import { Faq } from "./Faq";

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
  const SALON_HEROES = new Set([
    "kesim",
    "gece",
    "kemer",
    "makro",
    "menu",
    "sade",
    "cam",
    "gunes",
    "nabiz",
  ]);
  /**
   * The vet presets draw their own services, clinic, team and closing section. Any other
   * preset showing vet content (a ?preset= preview of klinik, say) falls back to the
   * shared components, and the two sections only vet content has take the güneş skin.
   */
  const vet = preset.hero === "gunes" || preset.hero === "nabiz" ? preset.hero : null;
  const ownsHeader = preset.hero === "chrome" || SALON_HEROES.has(preset.hero ?? "");
  /**
   * Cam is one continuous blue page with every section floating on it as a white card —
   * not a stack of alternating full-bleed bands. Wrapping here rather than inside each
   * component is what lets the sections this pack shares with beauty (booking, hours,
   * contact) join the rhythm without being rewritten.
   */
  const sheeted = preset.hero === "cam";
  const sheet = (node: React.ReactNode, key: string) =>
    sheeted ? (
      <div className="cam-sheet" key={key}>
        {node}
      </div>
    ) : (
      node
    );

  return (
    <div
      style={presetCssVars(preset) as React.CSSProperties}
      className={`bg-ground text-ink${sheeted ? " cam-page" : ""}${vet ? ` vet-page ${vet}-page` : ""}`}
    >
      {ownsHeader ? null : <Header content={content} />}
      <main>
        {sections.map((section, index) => {
          const key = `${section.type}-${index}`;
          switch (section.type) {
            case "hero":
              return sheet(<Hero key={key} section={section} content={content} now={now} />, key);
            case "proof":
              return sheet(<Proof key={key} content={content} />, key);
            case "emergency":
              return sheet(
                vet && section.signs?.length ? (
                  <VetEmergency key={key} section={section} content={content} skin={vet} />
                ) : (
                  <Emergency key={key} section={section} content={content} />
                ),
                key,
              );
            case "services":
              return sheet(
                vet ? (
                  <VetServices key={key} section={section} content={content} skin={vet} />
                ) : (
                  <Services key={key} section={section} />
                ),
                key,
              );
            case "about":
              return sheet(
                vet ? (
                  <VetAbout key={key} section={section} content={content} skin={vet} />
                ) : (
                  <About key={key} section={section} />
                ),
                key,
              );
            case "gallery":
              return sheet(<Gallery key={key} section={section} />, key);
            case "hours":
              return sheet(
                vet ? (
                  <VetVisit key={key} section={section} content={content} now={now} skin={vet} />
                ) : (
                  <HoursSection key={key} section={section} content={content} now={now} />
                ),
                key,
              );
            case "contact":
              // VetVisit already carries the address and the map.
              return vet
                ? null
                : sheet(<Contact key={key} section={section} content={content} />, key);
            case "pricelist":
              return sheet(<PriceList key={key} section={section} />, key);
            case "team":
              // Cam runs the same people as a carousel that bleeds off the right edge.
              return sheet(
                vet ? (
                  <VetTeam key={key} section={section} content={content} skin={vet} />
                ) : preset.hero === "cam" ? (
                  <Specialists section={section} />
                ) : (
                  <Team section={section} />
                ),
                key,
              );
            case "clinic":
              return sheet(<Clinic key={key} section={section} />, key);
            case "treatments":
              return sheet(<Treatments key={key} section={section} />, key);
            case "planner":
              return sheet(<Planner key={key} section={section} content={content} />, key);
            case "beforeAfter":
              return sheet(<BeforeAfter key={key} section={section} />, key);
            case "instagram":
              return sheet(<InstagramStrip key={key} section={section} content={content} />, key);
            case "booking":
              return sheet(<Booking key={key} section={section} content={content} />, key);
            case "vaccines":
              return sheet(
                <Vaccines
                  key={key}
                  section={section}
                  content={content}
                  skin={vet ?? "gunes"}
                  today={now.toISOString()}
                />,
                key,
              );
            case "faq":
              return sheet(
                <Faq key={key} section={section} content={content} skin={vet ?? "gunes"} />,
                key,
              );
          }
        })}
      </main>
      {sheet(<Footer content={content} year={now.getUTCFullYear()} />, "footer")}
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
