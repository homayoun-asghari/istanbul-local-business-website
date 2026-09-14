/**
 * Turkish suffixes obey vowel harmony, and a time label inflects the *spoken* form of
 * the last number said. "19:00'a kadar" is right because nineteen ends in "dokuz";
 * "08:00'a kadar" is wrong, because eight is "sekiz" and takes 'e.
 *
 * Getting this wrong is the kind of mistake a Turkish reader notices instantly and a
 * non-Turkish reader never sees — which makes it exactly the mistake that tells a salon
 * owner the site was generated. So the suffix is derived, never hardcoded.
 */

type Harmony = {
  /** Dative ("-a/-e"), with the buffer -y- after a word ending in a vowel. */
  dative: string;
  /** Locative ("-da/-de"), hardened to "-ta/-te" after a voiceless consonant. */
  locative: string;
};

// Keyed by the last word actually spoken. 19 is "on dokuz", so it harmonises as "dokuz";
// 45 is "kırk beş", so it harmonises as "beş".
const HARMONY: Record<string, Harmony> = {
  sıfır: { dative: "a", locative: "da" },
  bir: { dative: "e", locative: "de" },
  iki: { dative: "ye", locative: "de" },
  üç: { dative: "e", locative: "te" },
  dört: { dative: "e", locative: "te" },
  beş: { dative: "e", locative: "te" },
  altı: { dative: "ya", locative: "da" },
  yedi: { dative: "ye", locative: "de" },
  sekiz: { dative: "e", locative: "de" },
  dokuz: { dative: "a", locative: "da" },
  on: { dative: "a", locative: "da" },
  yirmi: { dative: "ye", locative: "de" },
  otuz: { dative: "a", locative: "da" },
  kırk: { dative: "a", locative: "ta" },
  elli: { dative: "ye", locative: "de" },
};

const UNITS = [
  "sıfır",
  "bir",
  "iki",
  "üç",
  "dört",
  "beş",
  "altı",
  "yedi",
  "sekiz",
  "dokuz",
] as const;
const TENS: Record<number, string> = { 1: "on", 2: "yirmi", 3: "otuz", 4: "kırk", 5: "elli" };

/** The final word said aloud for a number 0–59. 19 → "dokuz", 40 → "kırk", 45 → "beş". */
export function lastSpokenWord(n: number): string {
  if (n < 10) return UNITS[n];
  const unit = n % 10;
  return unit === 0 ? TENS[Math.floor(n / 10)] : UNITS[unit];
}

/**
 * The apostrophe-suffix for a "HH:MM" clock time.
 * A non-zero minute is the last thing said, so it governs: 09:30 harmonises as "otuz".
 */
export function timeSuffix(hhmm: string, kind: keyof Harmony): string {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const spoken = lastSpokenWord(minutes === 0 ? hours : minutes);
  return HARMONY[spoken][kind];
}

/** e.g. "19:00’a", "08:00’e", "20:00’de" — with the typographic apostrophe Turkish uses. */
export function inflectTime(hhmm: string, kind: keyof Harmony): string {
  return `${hhmm}’${timeSuffix(hhmm, kind)}`;
}

const BACK_VOWELS = "aıou";
const FRONT_VOWELS = "eiöü";
const VOICELESS = "fstkçşhp";

/**
 * The locative of a place name, with the apostrophe Turkish writes after a proper noun:
 * "Beşiktaş’ta", "Kadıköy’de", "Esenyurt’ta", "Şişli’de".
 *
 * Harmony follows the last vowel, and the d hardens to t after a voiceless consonant.
 * Writing "’de" by hand is right for Ataşehir and wrong for Beşiktaş — the same mistake
 * inflectTime exists to prevent, for words instead of clock times.
 */
export function locative(word: string): string {
  const lower = word.toLocaleLowerCase("tr");
  const vowel = [...lower]
    .reverse()
    .find((c) => BACK_VOWELS.includes(c) || FRONT_VOWELS.includes(c));
  const a = vowel && BACK_VOWELS.includes(vowel) ? "a" : "e";
  // A compound that already carries the possessive — Nişantaşı, Feneryolu, Sakızağacı —
  // takes the buffer n: "Nişantaşı’nda", never "Nişantaşı’da".
  if (COMPOUND_ENDINGS.some((ending) => lower.endsWith(ending))) return `${word}’n${"d"}${a}`;
  const d = VOICELESS.includes(lower.at(-1) ?? "") ? "t" : "d";
  return `${word}’${d}${a}`;
}

/** Istanbul place names built as noun compounds, whose last word is already possessed. */
const COMPOUND_ENDINGS = [
  "yolu",
  "taşı",
  "ağacı",
  "suyu",
  "başı",
  "pınarı",
  "dağı",
  "deresi",
  "çeşmesi",
  "bahçesi",
  "caddesi",
  "meydanı",
  "köprüsü",
  "iskelesi",
  "hisarı",
  "kapısı",
  "bayırı",
  "yokuşu",
  "sırtı",
];

/**
 * How a business name reads in a nav or a wordmark.
 *
 * The sheet often has names in capitals — "KADIKÖY RIHTIM 7/24 VETERİNER" — which shout
 * in a navigation bar. Title-case those with the Turkish locale, so RIHTIM becomes Rıhtım
 * and not Rihtim, and leave abbreviations and anything with a digit exactly as written.
 */
export function displayName(name: string): string {
  const letters = name.replace(/[^\p{L}]/gu, "");
  if (letters.length === 0 || letters !== letters.toLocaleUpperCase("tr")) return name;
  return name
    .split(/\s+/)
    .map((word) => {
      if (/[\d.]/.test(word) || word.length <= 2) return word;
      const lower = word.toLocaleLowerCase("tr");
      return lower.charAt(0).toLocaleUpperCase("tr") + lower.slice(1);
    })
    .join(" ");
}

/**
 * Splits a clinic's name into the part people say and the part that says what it is:
 * "Taurus Veteriner Kliniği" → ["Taurus", "Veteriner Kliniği"]. A name with no such
 * word stays whole.
 */
export function brandParts(name: string): [primary: string, secondary: string] {
  const shown = displayName(name);
  const match = shown.match(/\s(veteriner|vet\.|hayvan hastanesi|pet)\b/iu);
  if (!match || match.index === undefined || match.index === 0) return [shown, ""];
  return [shown.slice(0, match.index), shown.slice(match.index + 1)];
}
