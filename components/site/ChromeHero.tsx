"use client";

import { useEffect, useRef } from "react";
import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { isOpenNow, istanbulNow, openStateLabel } from "@/lib/content/hours";
import { telHref, whatsappHref } from "@/lib/content/schema";
import { formatPhone } from "./Cta";
import { ChromeCanvas } from "./ChromeCanvas";

/**
 * The chrome hero.
 *
 * Three things make it feel alive rather than decorated, all taken from studying how
 * Lime or Lemon actually works rather than how it looks in a screenshot:
 *
 *  1. **The hero is pinned.** The section sticks while a taller parent scrolls past it, so
 *     scroll becomes an input to a scene instead of a page position.
 *  2. **Motion is written per frame.** Scroll progress and pointer position are lerped in a
 *     rAF loop and written to CSS custom properties. No CSS transition eases them — the
 *     same reason Lime or Lemon's ring carries `transition: 0s`.
 *  3. **The headline is split into words** and staggered in, so the first half second of
 *     the page has choreography.
 *
 * The metal itself is SVG: a blob filled with a warm gradient, deformed by turbulence and
 * a displacement map whose seed drifts continuously. No library, no WebGL, no CDN — it
 * has to survive being copied verbatim into a client's own repository.
 */
export function ChromeHero({
  section,
  content,
  now,
}: {
  section: SectionOf<"hero">;
  content: SiteContent;
  now: Date;
}) {
  const scene = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scene.current;
    const wrapper = pin.current;
    if (!root || !wrapper) return;

    // Entrance is CSS. If this effect never runs the hero still looks correct —
    // only the pointer tracking, scroll parallax and molten drift are lost.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let pointerX = 0;
    let pointerY = 0;
    let x = 0;
    let y = 0;
    let progress = 0;
    let drift = 0;
    let raf = 0;

    const onPointer = (event: PointerEvent) => {
      const box = root.getBoundingClientRect();
      pointerX = (event.clientX - box.left) / box.width - 0.5;
      pointerY = (event.clientY - box.top) / box.height - 0.5;
    };

    const turbulence = root.querySelector("feTurbulence");

    const frame = () => {
      // Lerp toward the pointer rather than tracking it — the lag is what reads as weight.
      x += (pointerX - x) * 0.045;
      y += (pointerY - y) * 0.045;

      const box = wrapper.getBoundingClientRect();
      const travel = box.height - window.innerHeight;
      const target = travel > 0 ? Math.min(1, Math.max(0, -box.top / travel)) : 0;
      progress += (target - progress) * 0.12;

      root.style.setProperty("--px", x.toFixed(4));
      root.style.setProperty("--py", y.toFixed(4));
      root.style.setProperty("--p", progress.toFixed(4));

      // Drifting the seed is what makes the metal look molten instead of embossed.
      drift += 0.0025;
      turbulence?.setAttribute("baseFrequency", `${(0.006 + Math.sin(drift) * 0.0022).toFixed(5)}`);

      raf = requestAnimationFrame(frame);
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  const state = isOpenNow(content.hours, now);
  const words = section.headline.split(/\s+/);
  const emphasis = Math.max(0, words.length - 2);

  return (
    <div ref={pin} className="relative h-[190vh]">
      <div ref={scene} className="chrome-scene sticky top-0 h-screen overflow-hidden">
        <div className="chrome-glow" aria-hidden="true" />

        <header className="chrome-nav">
          <span className="chrome-brand">{content.business.name}</span>
          <nav className="chrome-links">
            <a href="#hizmetler">Hizmetler</a>
            <a href="#hakkimizda">Hakkımızda</a>
            <a href="#saatler">Saatler</a>
            <a href="#iletisim">İletişim</a>
          </nav>
          <a
            href={whatsappHref(content)}
            target="_blank"
            rel="noopener noreferrer"
            data-cta="whatsapp"
            className="chrome-pill"
          >
            Randevu al
          </a>
        </header>

        {/*
          The metal is a conic gradient rather than a linear one: bands radiating from a
          point curve with the surface, which is what separates chrome from tiger stripes.
          The blob is a morphing border-radius, and the SVG filter below roughens the
          surface so the bands ripple instead of sitting flat.
        */}
        <div className="chrome-metal" aria-hidden="true">
          {/* The CSS shape is the fallback; the canvas covers it when WebGL2 exists. */}
          <div className="chrome-ball" />
          <ChromeCanvas />
        </div>

        <svg width="0" height="0" aria-hidden="true" focusable="false">
          <defs>
            <filter id="molten" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.007"
                numOctaves="3"
                seed="7"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="26"
                xChannelSelector="R"
                yChannelSelector="G"
              />
              <feGaussianBlur stdDeviation="0.6" />
            </filter>
          </defs>
        </svg>

        <div className="chrome-copy">
          <p className="chrome-eyebrow">
            {content.business.neighborhood} · {content.business.district}
          </p>
          <h1 className="chrome-headline">
            {words.map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="chrome-word"
                style={{ ["--i" as string]: index }}
              >
                <span className={index >= emphasis ? "chrome-strong" : undefined}>{word}</span>{" "}
              </span>
            ))}
          </h1>
          <div className="chrome-actions">
            <a
              href={whatsappHref(content)}
              target="_blank"
              rel="noopener noreferrer"
              data-cta="whatsapp"
              className="chrome-cta"
            >
              WhatsApp&rsquo;tan randevu al
            </a>
            <a href={telHref(content.business)} data-cta="call" className="chrome-ghost">
              {formatPhone(content.business.phone)}
            </a>
          </div>
        </div>

        <p className="chrome-note">{section.subline}</p>

        <div className="chrome-foot">
          <span>
            <i className={state.open ? "chrome-dot on" : "chrome-dot"} />
            {openStateLabel(state, istanbulNow(now).day)}
          </span>
          <span className="chrome-cue">↓ AŞAĞI KAYDIRIN</span>
        </div>
      </div>
    </div>
  );
}
