"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SectionOf } from "@/lib/content/schema";
import { Container } from "./primitives";

/**
 * The specialists row: copy on the left, cards running off the right edge.
 *
 * The bleed is the point. A row that ends neatly at the container looks like all there
 * is; a row cut by the edge says the clinic has more people than fit, which is the
 * impression the reference is buying with it.
 *
 * Scrolling is the browser's own — snap points, momentum, a working scrollbar on touch —
 * and the arrows just drive it. Re-implementing that in JavaScript is how a carousel
 * ends up worse than a div with `overflow-x: auto`.
 */
export function Specialists({ section }: { section: SectionOf<"team"> }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [at, setAt] = useState(0);
  const [reach, setReach] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : 1;
    setAt(Math.round(track.scrollLeft / step));
    setReach({
      start: track.scrollLeft < 8,
      end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 8,
    });
  }, []);

  useEffect(() => {
    measure();
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      track.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const nudge = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : track.clientWidth;
    track.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return (
    <section id="hekimler" className="cam-specialists">
      <Container className="cam-spec-grid">
        <div className="cam-spec-copy">
          <h2 className="cam-title cam-title-left">
            {section.title}
            <span className="cam-faces">
              {section.members.slice(0, 3).map((member) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={member.name} src={member.image.src} alt="" aria-hidden="true" />
              ))}
            </span>
          </h2>
          {section.intro ? <p className="cam-intro cam-intro-left">{section.intro}</p> : null}
          <div className="cam-spec-nav">
            <button
              type="button"
              onClick={() => nudge(-1)}
              disabled={reach.start}
              aria-label="Önceki hekim"
            >
              <Arrow direction="left" />
            </button>
            <span className="cam-spec-count">
              {String(Math.min(at + 1, section.members.length)).padStart(2, "0")} /{" "}
              {String(section.members.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => nudge(1)}
              disabled={reach.end}
              aria-label="Sonraki hekim"
            >
              <Arrow direction="right" />
            </button>
          </div>
        </div>

        <ul className="cam-spec-track" ref={trackRef}>
          {section.members.map((member) => (
            <li key={member.name} className="cam-spec-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={member.image.src} alt={member.image.alt} loading="lazy" decoding="async" />
              <span className="cam-spec-role">{member.role}</span>
              <div className="cam-spec-meta">
                <b>{member.name}</b>
                {member.bio ? <p>{member.bio}</p> : null}
                {member.since ? <small>{member.since}</small> : null}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={direction === "right" ? "M3 8h10M9 4l4 4-4 4" : "M13 8H3M7 4L3 8l4 4"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
