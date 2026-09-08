/**
 * A map with no API key, no JavaScript and no WebGL.
 *
 * Two earlier attempts failed in ways that only showed up on the rendered page:
 * Google retired its keyless `maps.google.com/maps?output=embed` endpoint — it answers
 * 301 and sends `X-Frame-Options: SAMEORIGIN`, so the iframe drew an empty box — and
 * OpenStreetMap's own `export/embed.html` has moved to a vector renderer that prints
 * "your browser does not support WebGL" in English when WebGL is unavailable. On a
 * Turkish salon's contact section that is worse than no map at all.
 *
 * So the tiles are composed here instead: a small grid of raster PNGs positioned so the
 * business sits dead centre. Nothing to load but images, nothing to break. Attribution
 * is required by the tile usage policy and is rendered next to the map.
 */
export const TILE_SIZE = 256;
export const TILE_ATTRIBUTION = "© OpenStreetMap katkıda bulunanlar";

export type MapTile = { src: string; x: number; y: number };

export type StaticMap = {
  tiles: MapTile[];
  /** Grid dimensions in pixels. */
  width: number;
  height: number;
  /** Where the business sits inside that grid, in pixels from its top-left corner. */
  centerX: number;
  centerY: number;
};

/** Web Mercator, fractional so the marker can land between tiles rather than on a seam. */
function project(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const n = 2 ** zoom;
  const rad = (lat * Math.PI) / 180;
  return {
    x: ((lng + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n,
  };
}

export function staticMap(
  lat: number,
  lng: number,
  { zoom = 16, cols = 5, rows = 3 }: { zoom?: number; cols?: number; rows?: number } = {},
): StaticMap {
  const point = project(lat, lng, zoom);
  const n = 2 ** zoom;
  const originX = Math.floor(point.x) - Math.floor(cols / 2);
  const originY = Math.floor(point.y) - Math.floor(rows / 2);

  const tiles: MapTile[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tileY = originY + row;
      // Off the top or bottom of the world: no tile exists, and requesting one 404s.
      if (tileY < 0 || tileY >= n) continue;
      // Longitude wraps, so a business near the antimeridian still gets its neighbours.
      const tileX = (((originX + col) % n) + n) % n;
      tiles.push({
        src: `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`,
        x: col * TILE_SIZE,
        y: row * TILE_SIZE,
      });
    }
  }

  return {
    tiles,
    width: cols * TILE_SIZE,
    height: rows * TILE_SIZE,
    centerX: (point.x - originX) * TILE_SIZE,
    centerY: (point.y - originY) * TILE_SIZE,
  };
}
