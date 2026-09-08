import type { SiteContent } from "@/lib/content/schema";
import { formatCount, formatRating, telHref, whatsappHref } from "@/lib/content/schema";
import { isOpenNow, istanbulNow, openStateLabel } from "@/lib/content/hours";
import { formatPhone } from "../Cta";

/** Splits a headline into words so each can arrive on its own beat. */
export function Words({ text, className = "" }: { text: string; className?: string }) {
  return (
    <>
      {text.split(/\s+/).map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={`salon-word ${className}`}
          style={{ ["--i" as string]: index }}
        >
          {word}
          {index < text.split(/\s+/).length - 1 ? "\u00a0" : ""}
        </span>
      ))}
    </>
  );
}

export function OpenNow({ content, now }: { content: SiteContent; now: Date }) {
  const state = isOpenNow(content.hours, now);
  return (
    <span className="inline-flex items-center gap-2.5 text-[13px]">
      <i
        aria-hidden="true"
        className={`inline-block h-[7px] w-[7px] rounded-full ${state.open ? "bg-[#3F9E5F]" : "bg-current opacity-40"}`}
      />
      {openStateLabel(state, istanbulNow(now).day)}
    </span>
  );
}

/**
 * Only the sections this site actually has. A lead with no price list used to get a
 * "Fiyatlar" link that scrolled nowhere — the first thing an owner clicks, and the
 * fastest way to look like a template.
 */
const NAV: [href: string, label: string, section: SiteContent["sections"][number]["type"]][] = [
  ["#hizmetler", "Hizmetler", "services"],
  ["#fiyatlar", "Fiyatlar", "pricelist"],
  ["#ekip", "Ekip", "team"],
  ["#randevu", "Randevu", "booking"],
  ["#iletisim", "İletişim", "contact"],
];

export function SalonNav({
  content,
  dark = false,
  cta = true,
}: {
  content: SiteContent;
  dark?: boolean;
  /** Kesim turns this off: its hero already carries the appointment button, and two of
      them on one screen reads as a template that was not thought about. */
  cta?: boolean;
}) {
  const present = new Set(content.sections.map((section) => section.type));
  const links = NAV.filter(([, , section]) => present.has(section));
  return (
    <header className="relative z-30 flex items-center justify-between gap-6 px-[clamp(20px,5vw,60px)] py-5">
      <a href="#" className="font-display text-[15px] leading-tight tracking-[0.01em]">
        {content.business.name}
      </a>
      <nav className={`hidden gap-7 text-[12.5px] lg:flex ${dark ? "opacity-70" : "text-muted"}`}>
        {links.map(([href, label]) => (
          <a key={href} href={href} className="hover:opacity-100">
            {label}
          </a>
        ))}
      </nav>
      {cta ? (
        <a
          href={whatsappHref(content)}
          target="_blank"
          rel="noopener noreferrer"
          data-cta="whatsapp"
          className="bg-brand text-brand-ink shrink-0 rounded-[var(--radius-pill)] px-5 py-2.5 text-[12.5px] font-medium whitespace-nowrap"
        >
          Randevu al
        </a>
      ) : null}
    </header>
  );
}

export function HeroActions({ content }: { content: SiteContent }) {
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={whatsappHref(content)}
        target="_blank"
        rel="noopener noreferrer"
        data-cta="whatsapp"
        className="bg-brand text-brand-ink rounded-[var(--radius-pill)] px-6 py-3.5 text-[14px] font-medium transition-opacity hover:opacity-90"
      >
        WhatsApp&rsquo;tan randevu al
      </a>
      <a
        href={telHref(content.business)}
        data-cta="call"
        className="rounded-[var(--radius-pill)] border border-current/25 px-6 py-3.5 text-[14px] font-medium"
      >
        {formatPhone(content.business.phone)}
      </a>
    </div>
  );
}

export function RatingLine({ content }: { content: SiteContent }) {
  const { rating, reviewCount } = content.business;
  if (!reviewCount) return null;
  return (
    <p className="m-0 text-[13px] opacity-75">
      Google&rsquo;da <b className="font-medium">{formatRating(rating)}</b> ·{" "}
      {formatCount(reviewCount)} değerlendirme
    </p>
  );
}
