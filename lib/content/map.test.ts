import { describe, expect, it } from "vitest";
import { TILE_SIZE, staticMap } from "./map";

// Osmaniye Mahallesi, Bakırköy — the first lead, and the one every screenshot is of.
const LAT = 40.9952757;
const LNG = 28.8810021;

describe("the keyless static map", () => {
  it("puts the business in the middle of the grid", () => {
    const map = staticMap(LAT, LNG);
    // Dead centre would be 640/384; what matters is that the marker lands inside the
    // middle tile, because that is what keeps the pin off a seam.
    expect(map.centerX).toBeGreaterThan(2 * TILE_SIZE);
    expect(map.centerX).toBeLessThan(3 * TILE_SIZE);
    expect(map.centerY).toBeGreaterThan(1 * TILE_SIZE);
    expect(map.centerY).toBeLessThan(2 * TILE_SIZE);
  });

  it("covers the frame with real tiles", () => {
    const map = staticMap(LAT, LNG);
    expect(map.tiles).toHaveLength(15);
    expect(map.width).toBe(5 * TILE_SIZE);
    expect(map.height).toBe(3 * TILE_SIZE);
    for (const tile of map.tiles) {
      expect(tile.src).toMatch(/^https:\/\/tile\.openstreetmap\.org\/16\/\d+\/\d+\.png$/);
    }
  });

  it("places Istanbul where Istanbul is", () => {
    // Slippy-map arithmetic is easy to get subtly wrong, so pin the known tile.
    const map = staticMap(LAT, LNG, { cols: 1, rows: 1 });
    expect(map.tiles[0].src).toBe("https://tile.openstreetmap.org/16/38025/24572.png");
  });

  it("moves east when the longitude does", () => {
    const here = staticMap(LAT, LNG, { cols: 1, rows: 1 });
    const east = staticMap(LAT, LNG + 0.05, { cols: 1, rows: 1 });
    const x = (src: string) => Number(src.split("/")[4]);
    expect(x(east.tiles[0].src)).toBeGreaterThan(x(here.tiles[0].src));
  });

  it("never asks for a tile that does not exist", () => {
    // The poles: rows above and below the world would 404 if they were rendered.
    const north = staticMap(85, 0, { zoom: 2, cols: 3, rows: 3 });
    for (const tile of north.tiles) {
      const [, , , , y] = tile.src.split("/");
      expect(Number(y.replace(".png", ""))).toBeGreaterThanOrEqual(0);
    }
    expect(north.tiles.length).toBeLessThan(9);
  });

  it("wraps around the antimeridian instead of producing a negative tile", () => {
    const map = staticMap(0, 179.99, { zoom: 3, cols: 3, rows: 1 });
    const xs = map.tiles.map((tile) => Number(tile.src.split("/")[4]));
    expect(xs.every((x) => x >= 0 && x < 8)).toBe(true);
  });
});
