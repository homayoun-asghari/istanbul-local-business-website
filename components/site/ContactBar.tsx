import type { SiteContent } from "@/lib/content/schema";
import { telHref, whatsappHref } from "@/lib/content/schema";

/**
 * Fixed to the bottom on phones only. Nearly every visitor to a salon site arrives on a
 * phone, and the one thing they want is to reach the salon — so it is never more than a
 * thumb away, on every scroll position.
 */
export function ContactBar({ content }: { content: SiteContent }) {
  return (
    <div className="border-line bg-ground/95 fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-sm pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-2 gap-2.5 px-4 py-3">
        <a
          href={telHref(content.business)}
          data-cta="call"
          className="border-ink/20 text-ink inline-flex items-center justify-center rounded-[var(--radius-pill)] border py-3 text-sm font-medium"
        >
          Ara
        </a>
        <a
          href={whatsappHref(content)}
          target="_blank"
          rel="noopener noreferrer"
          data-cta="whatsapp"
          className="bg-brand text-brand-ink inline-flex items-center justify-center rounded-[var(--radius-pill)] py-3 text-sm font-medium"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
