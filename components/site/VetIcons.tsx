import type { SERVICE_ICONS } from "@/lib/content/schema";

type IconName = (typeof SERVICE_ICONS)[number];

/**
 * The vet pack's line icons. Drawn rather than loaded, so they take the section's colour
 * through currentColor and cost no request. One stroke weight, one 24-unit grid, round
 * caps — the same drawing language as the reference themes' feature rows.
 */
const PATHS: Record<IconName, React.ReactNode> = {
  muayene: (
    <>
      <path d="M6 3v5a5 5 0 0 0 10 0V3" />
      <path d="M11 13v3a5 5 0 0 0 10 0v-2" />
      <circle cx="21" cy="12" r="2" />
    </>
  ),
  asi: (
    <>
      <path d="m17 3 4 4M19 5l-9.5 9.5M8 10l6 6M6.5 17.5 3 21M12.5 8.5l3 3" />
      <path d="m9.5 14.5-3 3 1 1 3-3" />
    </>
  ),
  laboratuvar: (
    <>
      <path d="M9 3h6M10 3v6.5L4.6 18.3A1.8 1.8 0 0 0 6.1 21h11.8a1.8 1.8 0 0 0 1.5-2.7L14 9.5V3" />
      <path d="M7 15h10" />
    </>
  ),
  cerrahi: (
    <>
      <path d="M3.5 20.5 13 11" />
      <path d="m13 11 4.6-4.6a2.3 2.3 0 0 1 3.2 3.2L16.2 14.2 13 11Z" />
      <path d="M3 21h6" />
    </>
  ),
  dis: (
    <path d="M7.5 3.5c-2.3 0-3.5 1.7-3.5 4.3 0 3 1.6 5.1 2.2 8.2.4 2.4 1 4.5 2.1 4.5s1.4-2.1 1.8-3.8c.3-1.4 1-2.4 1.9-2.4s1.6 1 1.9 2.4c.4 1.7.7 3.8 1.8 3.8s1.7-2.1 2.1-4.5c.6-3.1 2.2-5.2 2.2-8.2 0-2.6-1.2-4.3-3.5-4.3-1.9 0-2.9 1.1-4.5 1.1S9.4 3.5 7.5 3.5Z" />
  ),
  bakim: (
    <>
      <circle cx="6" cy="6" r="2.6" />
      <circle cx="6" cy="18" r="2.6" />
      <path d="M8.1 7.5 20 17M8.1 16.5 20 7" />
    </>
  ),
  cip: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
    </>
  ),
  parazit: (
    <>
      <path d="M12 3 5 6v5c0 4.6 3 8.4 7 10 4-1.6 7-5.4 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  kontrol: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
      <path d="m9 15 2 2 4-4" />
    </>
  ),
  acil: (
    <>
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
};

export function VetIcon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}

export function PawMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 13c-3.2 0-6 2.6-6 5.3 0 1.7 1.3 2.7 3 2.7 1.1 0 2-.5 3-.5s1.9.5 3 .5c1.7 0 3-1 3-2.7C18 15.6 15.2 13 12 13Zm-6.5-2.3c1.3-.4 1.8-2 1.3-3.6S4.9 4.5 3.6 4.9s-1.8 2-1.3 3.6 1.9 2.6 3.2 2.2Zm13 0c1.3.4 2.7-.6 3.2-2.2s0-3.2-1.3-3.6-2.7.6-3.2 2.2 0 3.2 1.3 3.6ZM9 8.3c1.4 0 2.4-1.5 2.4-3.3S10.4 1.7 9 1.7 6.6 3.2 6.6 5 7.6 8.3 9 8.3Zm6 0c1.4 0 2.4-1.5 2.4-3.3S16.4 1.7 15 1.7 12.6 3.2 12.6 5s1 3.3 2.4 3.3Z"
      />
    </svg>
  );
}

export function PhoneMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1Z"
      />
    </svg>
  );
}

export function ChevronMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="m9 5 7 7-7 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WhatsAppGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.1.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.4 2.5 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.2 1.1Z"
      />
    </svg>
  );
}
