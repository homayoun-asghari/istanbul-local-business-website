import type { SiteContent } from "@/lib/content/schema";
import { Container } from "./primitives";
import { CallButton, WhatsAppButton } from "./Cta";

export function Header({ content }: { content: SiteContent }) {
  const { business } = content;
  return (
    <header className="border-line bg-ground/95 sticky top-0 z-40 border-b backdrop-blur-sm">
      <Container className="flex items-center justify-between gap-6 py-4">
        <a href="#" className="font-display text-ink text-lg leading-tight tracking-[-0.01em]">
          {business.name}
        </a>
        <div className="hidden items-center gap-3 md:flex">
          <CallButton business={business} className="px-5 py-2.5 text-[13px]" />
          <WhatsAppButton content={content} className="px-5 py-2.5 text-[13px]" label="WhatsApp" />
        </div>
      </Container>
    </header>
  );
}
