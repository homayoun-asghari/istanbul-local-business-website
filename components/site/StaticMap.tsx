import type { SiteContent } from "@/lib/content/schema";
import { TILE_ATTRIBUTION, staticMap } from "@/lib/content/map";

/**
 * The location, drawn from raster map tiles rather than embedded from a provider.
 *
 * See lib/content/map.ts for why: every keyless embed available either refuses to be
 * framed or demands WebGL and prints an English apology when it is missing. Tiles are
 * plain images — they cannot fail in either of those ways, they need no key, and the
 * whole thing survives `npm run eject` because it is images and CSS.
 *
 * The panel is a link. Anyone who taps a map wants directions, and directions live in
 * Google Maps, which is where the lead's own listing already is.
 */
export function StaticMap({ business }: { business: SiteContent["business"] }) {
  const map = staticMap(business.lat, business.lng);

  return (
    <figure className="m-0">
      <a
        href={business.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-cta="maps"
        aria-label={`${business.name} konumu — Google Haritalar'da aç`}
        className="rounded-edge border-line relative block h-[320px] w-full overflow-hidden border md:h-[460px]"
      >
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 block"
          style={{
            width: map.width,
            height: map.height,
            marginLeft: -map.centerX,
            marginTop: -map.centerY,
          }}
        >
          {map.tiles.map((tile) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={tile.src}
              src={tile.src}
              alt=""
              width={256}
              height={256}
              loading="lazy"
              decoding="async"
              className="absolute max-w-none"
              style={{ left: tile.x, top: tile.y }}
            />
          ))}
        </span>

        {/* The pin. Drawn rather than loaded, so it inherits the preset's brand colour. */}
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full"
        >
          <svg width="30" height="40" viewBox="0 0 30 40" fill="none">
            <path
              d="M15 39c0 0-13-15.2-13-24A13 13 0 0 1 28 15c0 8.8-13 24-13 24Z"
              fill="var(--brand)"
              stroke="var(--brand-ink)"
              strokeWidth="1.5"
            />
            <circle cx="15" cy="14.5" r="4.5" fill="var(--brand-ink)" />
          </svg>
        </span>
      </a>
      <figcaption className="text-muted mt-2.5 text-[11px]">{TILE_ATTRIBUTION}</figcaption>
    </figure>
  );
}
