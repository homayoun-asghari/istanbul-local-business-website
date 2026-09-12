import type { SiteContent } from "@/lib/content/schema";
import { Container } from "./primitives";
import { formatPhone } from "./Cta";

/** "2026-09-12" reads as "12.09.2026" — the order a Turkish reader expects. */
function formatUpdated(iso: string): string {
  const parts = iso.slice(0, 10).split("-");
  return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : iso;
}

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
        <div className="text-muted flex flex-col gap-1 text-[12px] md:text-right">
          <p className="m-0">
            © {year} {business.name}. Tüm hakları saklıdır.
          </p>
          {/*
            A private health facility has to publish when its site was last updated and
            who to contact about the site itself (m.5/1-i). Rendered only when the pack
            supplies them, because the beauty and vet rows predate the requirement.
          */}
          {content.updatedAt ? (
            <p className="m-0">Son güncelleme: {formatUpdated(content.updatedAt)}</p>
          ) : null}
          {business.editor ? <p className="m-0">Site sorumlusu: {business.editor}</p> : null}
        </div>
      </Container>
    </footer>
  );
}
