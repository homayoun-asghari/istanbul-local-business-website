import { describe, expect, it } from "vitest";
import {
  brandParts,
  displayName,
  inflectTime,
  lastSpokenWord,
  locative,
  timeSuffix,
} from "./turkish";

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

describe("locative of a place name", () => {
  it("harmonises with the last vowel and hardens after a voiceless consonant", () => {
    expect(locative("Beşiktaş")).toBe("Beşiktaş’ta");
    expect(locative("Kadıköy")).toBe("Kadıköy’de");
    expect(locative("Ataşehir")).toBe("Ataşehir’de");
    expect(locative("Şişli")).toBe("Şişli’de");
    expect(locative("Bakırköy")).toBe("Bakırköy’de");
    expect(locative("Esenyurt")).toBe("Esenyurt’ta");
    expect(locative("Üsküdar")).toBe("Üsküdar’da");
    expect(locative("Suadiye")).toBe("Suadiye’de");
    expect(locative("Sarıyer")).toBe("Sarıyer’de");
  });
});

describe("compound place names and clinic names", () => {
  it("buffers the locative of a compound that already carries the possessive", () => {
    expect(locative("Sakızağacı")).toBe("Sakızağacı’nda");
    expect(locative("Nişantaşı")).toBe("Nişantaşı’nda");
    expect(locative("Feneryolu")).toBe("Feneryolu’nda");
  });

  it("title-cases a name written in capitals, the Turkish way", () => {
    expect(displayName("KADIKÖY RIHTIM 7/24 VETERİNER")).toBe("Kadıköy Rıhtım 7/24 Veteriner");
    expect(displayName("KADIKÖY A.T.G VETERİNER KLİNİĞİ")).toBe("Kadıköy A.T.G Veteriner Kliniği");
    expect(displayName("Vetwise Veteriner Kliniği")).toBe("Vetwise Veteriner Kliniği");
  });

  it("splits the name people say from the words that say what it is", () => {
    expect(brandParts("Taurus Veteriner Kliniği")).toEqual(["Taurus", "Veteriner Kliniği"]);
    expect(brandParts("ESATPAŞA VETERİNER KLİNİĞİ 7/24")).toEqual([
      "Esatpaşa",
      "Veteriner Kliniği 7/24",
    ]);
    expect(brandParts("Capitol Veteriner Kliniği Bakırköy 7/24")).toEqual([
      "Capitol",
      "Veteriner Kliniği Bakırköy 7/24",
    ]);
    expect(brandParts("Pettention")).toEqual(["Pettention", ""]);
  });
});
