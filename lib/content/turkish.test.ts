import { describe, expect, it } from "vitest";
import { inflectTime, lastSpokenWord, timeSuffix } from "./turkish";

describe("the last word actually spoken", () => {
  it("reads a single digit", () => {
    expect(lastSpokenWord(9)).toBe("dokuz");
    expect(lastSpokenWord(0)).toBe("sıfır");
  });

  it("reads a round ten as the tens word", () => {
    expect(lastSpokenWord(10)).toBe("on");
    expect(lastSpokenWord(20)).toBe("yirmi");
    expect(lastSpokenWord(40)).toBe("kırk");
  });

  it("reads a compound number as its unit, which is what harmonises", () => {
    expect(lastSpokenWord(19)).toBe("dokuz"); // on dokuz
    expect(lastSpokenWord(45)).toBe("beş"); // kırk beş
    expect(lastSpokenWord(23)).toBe("üç"); // yirmi üç
  });
});

describe("vowel harmony on clock times", () => {
  // Back-vowel hours take -a / -da …
  it("harmonises 09:00 and 19:00 as dokuz", () => {
    expect(inflectTime("09:00", "dative")).toBe("09:00’a");
    expect(inflectTime("19:00", "locative")).toBe("19:00’da");
  });

  // … and front-vowel hours take -e / -de. This is the case the old hardcoded
  // suffix got wrong, and the one the veteriner pack will hit.
  it("harmonises 08:00 as sekiz, not as dokuz", () => {
    expect(inflectTime("08:00", "dative")).toBe("08:00’e");
    expect(inflectTime("08:00", "locative")).toBe("08:00’de");
  });

  it("uses the -y- buffer after a number ending in a vowel", () => {
    expect(inflectTime("20:00", "dative")).toBe("20:00’ye"); // yirmi + ye
    expect(inflectTime("06:00", "dative")).toBe("06:00’ya"); // altı + ya
    expect(inflectTime("02:00", "dative")).toBe("02:00’ye"); // iki + ye
  });

  it("hardens the locative to -ta/-te after a voiceless consonant", () => {
    expect(inflectTime("18:45", "locative")).toBe("18:45’te"); // kırk beş
    expect(inflectTime("00:40", "locative")).toBe("00:40’ta"); // kırk
    expect(inflectTime("15:00", "locative")).toBe("15:00’te"); // on beş
  });

  it("lets a non-zero minute govern, because it is said last", () => {
    expect(timeSuffix("09:30", "locative")).toBe("da"); // otuz, not dokuz
    expect(timeSuffix("19:50", "dative")).toBe("ye"); // elli, not dokuz
    expect(timeSuffix("08:10", "dative")).toBe("a"); // on, not sekiz
  });

  it("covers every hour of the day without throwing", () => {
    for (let h = 0; h < 24; h++) {
      for (const m of [0, 5, 15, 30, 45, 59]) {
        const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        expect(() => inflectTime(time, "dative"), time).not.toThrow();
        expect(inflectTime(time, "locative")).toMatch(/’(da|de|ta|te)$/);
      }
    }
  });
});
