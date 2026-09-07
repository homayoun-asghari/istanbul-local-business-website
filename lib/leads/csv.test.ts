import { describe, expect, it } from "vitest";
import { coordsFromStreetView, leadsFromCsv, normalisePhone, parseCsv } from "./csv";
import { inferIndustry } from "./industry";
import { slugify } from "./slug";

// Two real rows from the operator's sheet, headers verbatim.
const SHEET = `Contacted,Demo built,Demo URL,Reply,business,phone,wa_link,rating,reviews,pct_five,photos,social,maps_place,streetview,photo,neighborhood,district
FALSE,FALSE,,,Melike Adıgüzel Güzellik Salonu,+905515330919,https://wa.me/905515330919,4.7,1273,92,224,,https://www.google.com/maps/place/?q=place_id:ChIJD,https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=40.9952757%2C28.8810021,https://lh3.googleusercontent.com/photo1,Osmaniye,Bakırköy
FALSE,FALSE,,,"KADIKÖY RIHTIM 7/24 VETERİNER",+905360535252,https://wa.me/905360535252,4.9,250,96,55,http://instagram.com/kadikoyrihtimvet,https://www.google.com/maps/place/?q=place_id:ChIJR,"https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=40.9932785,29.0272607",https://lh3.googleusercontent.com/photo2,Rasimpaşa,Kadıköy`;

describe("Turkish slugs", () => {
  it("keeps the owner's name readable in the URL", () => {
    expect(slugify("Melike Adıgüzel Güzellik Salonu")).toBe("melike-adiguzel-guzellik-salonu");
  });

  it("handles the dotted capital İ, which lowercases to a combining sequence", () => {
    expect(slugify("İnönü Veteriner Kliniği")).toBe("inonu-veteriner-klinigi");
  });

  it("collapses punctuation and slashes rather than leaving them in a URL", () => {
    expect(slugify("SOMSA GÜZELLİK (AĞDA/KAŞ DIZAYN)")).toBe("somsa-guzellik-agda-kas-dizayn");
  });

  it("never ends in a hyphen", () => {
    expect(slugify("Kuaför —")).toBe("kuafor");
  });
});

describe("industry inference, since the sheet has no industry column", () => {
  it("recognises beauty businesses", () => {
    expect(inferIndustry("Melike Adıgüzel Güzellik Salonu")).toBe("beauty");
    expect(inferIndustry("Lazer Epilasyon - Bölgesel Zayıflama")).toBe("beauty");
    expect(inferIndustry("Beyhan Ateşoğlu Beauty Center")).toBe("beauty");
    expect(inferIndustry("NFC ESTETİK")).toBe("beauty");
  });

  it("recognises veteriner clinics", () => {
    expect(inferIndustry("KADIKÖY RIHTIM 7/24 VETERİNER")).toBe("vet");
    expect(inferIndustry("Vetterapi Suadiye veteriner kliniği")).toBe("vet");
    expect(inferIndustry("Pettention Veteriner Kliniği")).toBe("vet");
  });

  it("recognises dental clinics", () => {
    expect(inferIndustry("Özel Hesna Ağız ve Diş Sağlığı")).toBe("dental");
  });

  it("leaves anything else alone rather than guessing", () => {
    expect(inferIndustry("Net Emlak")).toBe("other");
    expect(inferIndustry("Mozaik Emlak Hizmetleri - Hüsnü BAŞ")).toBe("other");
  });
});

describe("phone normalisation", () => {
  it("accepts the shapes a Turkish sheet actually contains", () => {
    expect(normalisePhone("+905515330919")).toBe("+905515330919");
    expect(normalisePhone("0551 533 09 19")).toBe("+905515330919");
    expect(normalisePhone("90 551 533 0919")).toBe("+905515330919");
    expect(normalisePhone("(0551) 533-09-19")).toBe("+905515330919");
  });

  it("refuses anything that is not ten local digits", () => {
    expect(normalisePhone("533 09 19")).toBeNull();
    expect(normalisePhone("")).toBeNull();
    expect(normalisePhone(null)).toBeNull();
  });
});

describe("coordinates", () => {
  it("reads them out of the Maps pano link, which is not an image", () => {
    expect(
      coordsFromStreetView(
        "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=40.9952757,28.8810021",
      ),
    ).toEqual({ lat: 40.9952757, lng: 28.8810021 });
  });

  it("reads them through a url-encoded comma too", () => {
    expect(coordsFromStreetView("https://maps.google.com/?viewpoint=40.99%2C28.88")).toEqual({
      lat: 40.99,
      lng: 28.88,
    });
  });

  it("returns nulls rather than throwing when there is no link", () => {
    expect(coordsFromStreetView(null)).toEqual({ lat: null, lng: null });
    expect(coordsFromStreetView("https://example.com")).toEqual({ lat: null, lng: null });
  });
});

describe("parseCsv", () => {
  it("keeps a comma that sits inside quotes", () => {
    expect(parseCsv('a,"b,c",d')).toEqual([["a", "b,c", "d"]]);
  });

  it("unescapes doubled quotes", () => {
    expect(parseCsv('a,"say ""hi""",c')).toEqual([["a", 'say "hi"', "c"]]);
  });

  it("handles CRLF and drops blank lines", () => {
    expect(parseCsv("a,b\r\nc,d\r\n\r\n")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });
});

describe("importing the sheet", () => {
  const { leads, skipped } = leadsFromCsv(SHEET);

  it("reads every row", () => {
    expect(leads).toHaveLength(2);
    expect(skipped).toBe(0);
  });

  it("maps columns by header name, not by position", () => {
    const [melike] = leads;
    expect(melike.business).toBe("Melike Adıgüzel Güzellik Salonu");
    expect(melike.phone).toBe("+905515330919");
    expect(melike.rating).toBe(4.7);
    expect(melike.reviews).toBe(1273);
    expect(melike.pctFive).toBe(92);
    expect(melike.district).toBe("Bakırköy");
    expect(melike.neighborhood).toBe("Osmaniye");
    expect(melike.industry).toBe("beauty");
  });

  it("gives each lead a stable key so re-importing an updated sheet is idempotent", () => {
    const again = leadsFromCsv(SHEET).leads;
    expect(again.map((l) => l.sourceKey)).toEqual(leads.map((l) => l.sourceKey));
    expect(new Set(leads.map((l) => l.sourceKey)).size).toBe(leads.length);
  });

  it("extracts coordinates from the quoted pano link", () => {
    expect(leads[1].lat).toBe(40.9932785);
    expect(leads[1].lng).toBe(29.0272607);
  });

  it("keeps the Instagram handle when the sheet has one", () => {
    expect(leads[1].social).toBe("http://instagram.com/kadikoyrihtimvet");
    expect(leads[0].social).toBeNull();
  });

  it("skips a row with no business name rather than importing a blank", () => {
    const withBlank = `${SHEET}\nFALSE,FALSE,,,,,,,,,,,,,,,`;
    const result = leadsFromCsv(withBlank);
    expect(result.leads).toHaveLength(2);
    expect(result.skipped).toBe(1);
  });

  it("returns nothing for an empty paste rather than throwing", () => {
    expect(leadsFromCsv("").leads).toEqual([]);
    expect(leadsFromCsv("business\n").leads).toEqual([]);
  });
});
