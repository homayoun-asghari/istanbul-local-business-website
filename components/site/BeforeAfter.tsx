"use client";

import { useCallback, useRef, useState } from "react";
import type { SectionOf } from "@/lib/content/schema";
import { Container } from "./primitives";

/**
 * Before and after.
 *
 * Prohibited outright on a Turkish clinic's site until 12 November 2025 and permitted
 * since, under conditions (m.7/1). The furniture around the images is not decoration —
 * it is the compliance:
 *
 *   - both dates on the frame: the procedure's and the photograph's
 *   - the same setting and technical conditions in both halves, which is why the pair
 *     is one image split rather than two crops
 *   - no filter or retouching
 *   - "sonuçlar kişiden kişiye değişir" under the block
 *   - comments disabled — there are none to disable here, and none get added
 *
 * A pair marked `illustration` says so on the frame. The demo ships one, because
 * fabricating a patient's result to fill a template is the exact thing the article
 * exists to stop.
 */
export function BeforeAfter({ section }: { section: SectionOf<"beforeAfter"> }) {
  const [active, setActive] = useState(0);
  const [split, setSplit] = useState(52);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const current = section.cases[active] ?? section.cases[0];

  const moveTo = useCallback((clientX: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const box = frame.getBoundingClientRect();
    const next = ((clientX - box.left) / box.width) * 100;
    setSplit(Math.min(98, Math.max(2, next)));
  }, []);

  const onPointerDown = (event: React.PointerEvent) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    moveTo(event.clientX);
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (dragging.current) moveTo(event.clientX);
  };
  const onPointerUp = (event: React.PointerEvent) => {
    dragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <section id="oncesi-sonrasi" className="cam-ba">
      <Container>
        <div className="cam-centred">
          <p className="cam-eyebrow">Öncesi ve sonrası</p>
          <h2 className="cam-title">{section.title}</h2>
          {section.intro ? <p className="cam-intro">{section.intro}</p> : null}
        </div>

        {section.cases.length > 1 ? (
          <div className="cam-tabs" role="tablist">
            {section.cases.map((item, index) => (
              <button
                key={item.treatment}
                type="button"
                role="tab"
                aria-selected={index === active}
                className={`cam-tab${index === active ? " is-on" : ""}`}
                onClick={() => setActive(index)}
              >
                {item.treatment}
              </button>
            ))}
          </div>
        ) : null}

        <div className="cam-ba-grid">
          <div className="cam-ba-copy">
            <h3 className="cam-ba-title">{current.title}</h3>
            <p className="cam-ba-story">{current.story}</p>
            <p className="cam-metric-label">Yapılanlar</p>
            <ul className="cam-ba-did">
              {current.did.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <figure className="cam-ba-figure">
            <div
              ref={frameRef}
              className="cam-ba-frame"
              style={{ ["--split" as string]: `${split}%` }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current.after.src} alt={current.after.alt} draggable={false} />
              <div className="cam-ba-clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.before.src} alt={current.before.alt} draggable={false} />
              </div>

              <span className="cam-ba-stamp is-before">
                Öncesi · {current.procedureDate}
                <em>işlem tarihi</em>
              </span>
              <span className="cam-ba-stamp is-after">
                Sonrası · {current.photoDate}
                <em>çekim tarihi</em>
              </span>

              <input
                className="cam-ba-range"
                type="range"
                min={2}
                max={98}
                value={Math.round(split)}
                aria-label="Öncesi ve sonrası karşılaştırma çizgisi"
                onChange={(event) => setSplit(Number(event.target.value))}
              />
              <span className="cam-ba-handle" aria-hidden="true" style={{ left: `${split}%` }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 4 3 8l3 4M10 4l3 4-3 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>

            <figcaption className="cam-ba-caption">
              {current.illustration ? (
                <b className="cam-ba-flag">Örnek görsel — hasta fotoğrafı değildir.</b>
              ) : null}
              {section.disclaimer}
            </figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
}
