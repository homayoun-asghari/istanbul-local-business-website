"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * A hero section that knows how far it has been scrolled.
 *
 * It writes one custom property — `--sy`, 0 at rest and 1 once the section has scrolled
 * a full viewport — and the stylesheet does the rest. No transition on `--sy`: the value
 * is written every frame, so the motion is driven rather than eased. That is what makes
 * a parallax feel attached to the finger instead of chasing it.
 *
 * The children are ordinary server components; only this shell is a client component.
 * It touches no data and no environment, so it ejects with the rest of components/site.
 */
export function ScrollScene({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let last = -1;

    const write = () => {
      frame = 0;
      const height = el.offsetHeight || 1;
      // Progress through the section's own height, so a tall hero and a short one
      // travel the same visual distance.
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / height));
      const rounded = Math.round(p * 1000) / 1000;
      if (rounded === last) return;
      last = rounded;
      el.style.setProperty("--sy", String(rounded));
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(write);
    };

    write();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <section ref={ref} className={`scene ${className}`} style={style}>
      {children}
    </section>
  );
}
