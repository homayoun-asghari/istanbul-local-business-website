"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll reveal.
 *
 * Two things here are deliberate and were both learned the hard way.
 *
 * The element starts *visible* in the stylesheet; the hidden state is applied here,
 * after mount, and only to elements that are still below the fold. A page whose
 * JavaScript never runs therefore shows everything rather than a column of blank
 * sections, and the top of the page does not flash.
 *
 * The trigger is a shared rAF pass over the pending elements rather than an
 * IntersectionObserver. An observer only reports at frame boundaries, so a fling
 * scroll — or a programmatic jump, which is how this was caught — can carry a section
 * from below the fold to above it without ever reporting an intersection, leaving it
 * invisible until the reader happens to scroll back up. Comparing rects each frame
 * cannot miss: anything now above the line is revealed, whether or not we ever saw it
 * cross. The set empties as the page is read, and the listeners come off with it.
 */
type Pending = { el: HTMLElement; delay: number };

const pending = new Set<Pending>();
let frame = 0;
let listening = false;

function flush() {
  frame = 0;
  const line = window.innerHeight * 0.92;
  for (const item of pending) {
    if (item.el.getBoundingClientRect().top >= line) continue;
    item.el.style.transitionDelay = `${item.delay}ms`;
    item.el.classList.add("reveal-in");
    pending.delete(item);
  }
  if (pending.size === 0) stop();
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(flush);
}

function start() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}

function stop() {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
}

export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section" | "li" | "figure";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    el.classList.add("reveal-idle");
    const item: Pending = { el, delay };
    pending.add(item);
    start();
    return () => {
      pending.delete(item);
      if (pending.size === 0) stop();
    };
  }, [delay]);

  return (
    <Tag ref={ref as never} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
