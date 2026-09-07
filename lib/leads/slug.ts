/**
 * Turkish-aware slugs. A naive slugifier turns "Melike Adıgüzel Güzellik" into
 * "melike-adgzel-gzellik" because ı, ğ and ü are not ASCII — and that slug goes in the
 * URL the owner is asked to open, so it has to read as their name.
 *
 * İ is handled before lowercasing: in Turkish "İ".toLowerCase() is "i̇" (i + combining
 * dot), which then strips to "i" only by accident.
 */
const TURKISH: Record<string, string> = {
  ı: "i",
  İ: "i",
  ş: "s",
  Ş: "s",
  ğ: "g",
  Ğ: "g",
  ç: "c",
  Ç: "c",
  ö: "o",
  Ö: "o",
  ü: "u",
  Ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

/** Turkish letters folded to ASCII, lowercased. Shared with industry inference. */
export function foldTurkish(input: string): string {
  return input
    .split("")
    .map((character) => TURKISH[character] ?? character)
    .join("")
    .toLowerCase();
}

export function slugify(input: string): string {
  return foldTurkish(input)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}
