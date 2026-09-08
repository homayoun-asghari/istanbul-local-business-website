"use client";

import { useEffect, useRef } from "react";
import { formatCount, formatRating } from "@/lib/content/schema";

/**
 * A figure that counts up the first time it is scrolled into view.
 *
 * The server renders the final value, so a page whose JavaScript never runs shows
 * 1.273 rather than 0 — the usual way this effect fails. The client only takes over
 * once the element is on screen, and puts the same string back at the end.
 *
 * The formatter is chosen by `kind` rather than passed in: a function is not a
 * serialisable prop across the server/client boundary, and Turkish separators
 * (4,7 and 1.273) have to survive every intermediate frame, not just the last one.
 */
const FORMAT = {
  rating: (n: number) => formatRating(n),
  count: (n: number) => formatCount(Math.round(n)),
  percent: (n: number) => `%${formatCount(Math.round(n))}`,
} as const;

export function CountUp({
  value,
  kind,
  duration = 1100,
}: {
  value: number;
  kind: keyof typeof FORMAT;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const format = FORMAT[kind];
    const run = () => {
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / duration);
        // Decelerating, so the last digits settle rather than snap.
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = p < 1 ? format(value * eased) : format(value);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        run();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, kind, duration]);

  return <span ref={ref}>{FORMAT[kind](value)}</span>;
}
