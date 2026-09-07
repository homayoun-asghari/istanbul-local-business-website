import type { SiteContent } from "@/lib/content/schema";
import { Container } from "./primitives";
import { formatPhone } from "./Cta";

export function Footer({ content, year }: { content: SiteContent; year: number }) {
  const { business } = content;
  return (
    <footer className="border-line border-t py-12 pb-28 md:pb-12">
      <Container className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-ink m-0 text-lg">{business.name}</p>
          <p className="text-muted m-0 mt-2 text-[14px]">
            {business.neighborhood} Mahallesi, {business.district} / İstanbul ·{" "}
            {formatPhone(business.phone)}
          </p>
        </div>
        <p className="text-muted m-0 text-[12px]">
          © {year} {business.name}. Tüm hakları saklıdır.
        </p>
      </Container>
    </footer>
  );
}
