import type { Business, SiteContent } from "@/lib/content/schema";
import { telHref, whatsappHref } from "@/lib/content/schema";

/**
 * WhatsApp is the booking system in this market, so it gets the primary treatment
 * everywhere and the message is always prefilled. A tap should never land the owner's
 * customer in an empty chat wondering what to type.
 */
export function WhatsAppButton({
  content,
  className = "",
  label = "WhatsApp’tan yaz",
}: {
  content: SiteContent;
  className?: string;
  label?: string;
}) {
  return (
    <a
      href={whatsappHref(content)}
      target="_blank"
      rel="noopener noreferrer"
      data-cta="whatsapp"
      className={`bg-brand text-brand-ink inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] px-6 py-3.5 text-sm font-medium tracking-wide transition-opacity hover:opacity-90 ${className}`}
    >
      <WhatsAppMark />
      {label}
    </a>
  );
}

export function CallButton({
  business,
  className = "",
  label,
}: {
  business: Business;
  className?: string;
  label?: string;
}) {
  return (
    <a
      href={telHref(business)}
      data-cta="call"
      className={`border-ink/20 text-ink inline-flex items-center justify-center rounded-[var(--radius-pill)] border px-6 py-3.5 text-sm font-medium tracking-wide transition-colors hover:border-ink/50 ${className}`}
    >
      {label ?? formatPhone(business.phone)}
    </a>
  );
}

/** +905515330919 reads as 0551 533 09 19 to a Turkish customer. */
export function formatPhone(e164: string): string {
  const digits = e164.replace(/^\+90/, "");
  if (digits.length !== 10) return e164;
  return `0${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
}

function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.4 1.3-1.94 1.34-.5.04-.98.22-3.3-.69-2.78-1.1-4.55-3.94-4.69-4.12-.14-.18-1.13-1.5-1.13-2.86s.72-2.03.97-2.31c.25-.28.55-.35.73-.35.18 0 .37 0 .53.01.17.01.4-.06.62.48.24.57.8 1.96.87 2.1.07.14.12.31.02.49-.09.18-.14.29-.28.45-.14.16-.29.35-.42.47-.14.14-.28.29-.12.57.16.28.72 1.18 1.54 1.91 1.06.94 1.95 1.23 2.23 1.37.28.14.44.12.6-.07.17-.19.7-.81.88-1.09.18-.28.37-.23.62-.14.25.09 1.6.75 1.87.89.28.14.46.21.53.32.07.12.07.66-.17 1.34Z" />
    </svg>
  );
}
