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
