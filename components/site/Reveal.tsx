"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll reveal. One IntersectionObserver per element, disconnected as soon as it fires,
 * so a long page does not keep dozens of observers alive.
 *
 * The transition lives in CSS and the element starts *visible* in the stylesheet — the
 * hidden state is only applied here, after mount. A page whose JavaScript never runs
 * therefore shows everything rather than a column of blank sections, which is the usual
 * way this pattern fails.
 */
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

    el.classList.add("reveal-idle");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add("reveal-in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref as never} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
