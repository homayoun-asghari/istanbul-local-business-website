import type { SiteContent } from "@/lib/content/schema";
import { presetCssVars } from "@/packs/types";
import { presetFor } from "@/packs/registry";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Proof } from "./Proof";
import { Emergency } from "./Emergency";
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
  const sections = withoutRepeatedPhotos(content.sections);
  // The chrome hero carries its own navigation, so the shared header would be a second one.
  const ownsHeader = preset.hero === "chrome";

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
