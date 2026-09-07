import type { SiteContent } from "@/lib/content/schema";
import { presetCssVars } from "@/packs/types";
import { BEAUTY_PRESETS } from "@/packs/beauty/preset";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Proof } from "./Proof";
import { Services } from "./Services";
import { About } from "./About";
import { Gallery } from "./Gallery";
import { HoursSection } from "./HoursSection";
import { Contact } from "./Contact";
import { ContactBar } from "./ContactBar";
import { Footer } from "./Footer";

/**
 * The whole render layer, entered here. It takes a validated SiteContent object and a
 * clock, and nothing else — no database, no request context, no environment. That is
 * what lets `npm run eject` copy this directory into a client's own repository, where
 * none of those things exist. See docs/ARCHITECTURE.md.
 */
export function Site({ content, now }: { content: SiteContent; now: Date }) {
  const preset = BEAUTY_PRESETS[content.preset] ?? BEAUTY_PRESETS.atolye;

  return (
    <div style={presetCssVars(preset) as React.CSSProperties} className="bg-ground text-ink">
      <Header content={content} />
      <main>
        {content.sections.map((section, index) => {
          const key = `${section.type}-${index}`;
          switch (section.type) {
            case "hero":
              return <Hero key={key} section={section} content={content} now={now} />;
            case "proof":
              return <Proof key={key} content={content} />;
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
    </div>
  );
}
