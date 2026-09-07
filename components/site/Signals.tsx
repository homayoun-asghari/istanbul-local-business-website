"use client";

import { useEffect } from "react";

/**
 * Fires one "view" on load and one event per contact tap. Deliberately tiny and
 * failure-tolerant: if the beacon errors the demo carries on as if nothing happened.
 */
export function Signals({ slug }: { slug: string }) {
  useEffect(() => {
    const send = (type: string) =>
      navigator.sendBeacon?.(
        "/api/e",
        new Blob([JSON.stringify({ slug, type })], {
          type: "application/json",
        }),
      );

    send("view");

    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest("[data-cta]");
      const cta = target?.getAttribute("data-cta");
      if (cta) send(cta);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [slug]);

  return null;
}
