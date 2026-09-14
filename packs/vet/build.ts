import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { locative } from "@/lib/content/turkish";
import { ALWAYS_OPEN, WEEKDAYS_9_TO_7, baseBusiness, type BuildInput } from "../build";

/**
 * The vet pack.
 *
 * What a veterinarian may publish is narrower than it looks. Law 6343 m.9 lets a vet
 * announce where they work and what they do, provided it is not advertising, and m.41 —
 * re-enacted by Law 7584 on 11 June 2026 — makes advertising content "on the internet,
 * media and social media" a disciplinary offence, with fines for the heavier cases.
 * TVHB Uygulama Yönetmeliği m.97–98 fill in the detail. So, section by section:
 *
 *   - no Google standing, no testimonials                    (TVHB m.98, 6343 m.41)
 *   - no discount, campaign, "affordable" or savings plan    (TVHB m.97, 6343 m.41/f)
 *   - no shop, no product promotion                          (6343 m.41/l, m.41/aa)
 *   - no adoption listings                                   (6343 m.41/y)
 *   - titles only as earned; "uzman" only with the belge     (6343 m.41/ö)
 *   - no "en iyi", no comparison with other clinics          (6343 m.41/s)
 *
 * What is left is information: where, when, what they do, who does it, what to bring,
 * when to call — which is also exactly what a worried owner came for.
 */

/** Titles a vet site may put under a name. Anything else has to come from the clinic. */
export const VET_TITLES = [
  "Veteriner Hekim",
  "Uzman Veteriner Hekim",
  "Veteriner Sağlık Teknikeri",
  "Veteriner Sağlık Teknisyeni",
] as const;

/**
 * Deliberately no treatment promises and no drug names — a clinic owner reading an
 * invented clinical claim about their own practice stops replying.
 */
const SERVICES: SectionOf<"services"> = {
  type: "services",
  title: "Hizmetlerimiz",
  intro: "Dostunuzun ihtiyacını muayenede birlikte belirliyoruz.",
  items: [
    {
      name: "Muayene ve Kontrol",
      description: "Genel sağlık kontrolü ve rutin takip.",
      icon: "muayene",
      image: {
        src: "/stock/vet/vet-clipboard.webp",
        alt: "Elinde not panosuyla ilaç şişesini inceleyen veteriner hekim",
      },
    },
    {
      name: "Aşı ve Parazit Koruması",
      description: "Aşı takvimi ve düzenli koruma programı.",
      icon: "asi",
      image: { src: "/stock/vet/dog-cat.webp", alt: "Yan yana oturan köpek ve tekir kedi" },
    },
    {
      name: "Laboratuvar ve Görüntüleme",
      description: "Klinik içinde tahlil ve görüntüleme.",
      icon: "laboratuvar",
    },
    {
      name: "Cerrahi Girişimler",
      description: "Randevu ile planlanan operasyonlar.",
      icon: "cerrahi",
    },
    { name: "Diş Sağlığı", description: "Ağız ve diş bakımı, tartar temizliği.", icon: "dis" },
    { name: "Pet Kuaför ve Bakım", description: "Tıraş, tırnak ve kulak bakımı.", icon: "bakim" },
  ],
  placeholder: true,
};

/**
 * The example schedule. Marked as one on the page and badged as a placeholder in the
 * studio: the clinic's own vet sets the real one, and says so.
 */
const VACCINES: SectionOf<"vaccines"> = {
  type: "vaccines",
  title: "Aşı ve bakım takvimi",
  intro:
    "Dostunuzun türünü ve doğduğu ayı seçin; ilk yılın adımlarını tarihleriyle görün, takvimi WhatsApp’tan bize gönderin.",
  species: [
    {
      id: "kopek",
      label: "Köpek",
      steps: [
        { label: "İlk muayene ve parazit uygulaması", week: 6, icon: "muayene" },
        { label: "Karma aşı · 1. doz", week: 8, icon: "asi" },
        { label: "Karma aşı · 2. doz", week: 11, icon: "asi" },
        { label: "Karma aşı · 3. doz", week: 14, icon: "asi" },
        { label: "Kuduz aşısı ve mikroçip", week: 16, icon: "cip" },
        { label: "Kısırlaştırma görüşmesi", week: 26, icon: "kontrol" },
        { label: "Yıllık kontrol ve aşı tekrarı", week: 52, icon: "kontrol" },
      ],
    },
    {
      id: "kedi",
      label: "Kedi",
      steps: [
        { label: "İlk muayene ve parazit uygulaması", week: 8, icon: "muayene" },
        { label: "Karma aşı · 1. doz", week: 9, icon: "asi" },
        { label: "Karma aşı · 2. doz", week: 12, icon: "asi" },
        { label: "Kuduz aşısı ve mikroçip", week: 16, icon: "cip" },
        { label: "Parazit kontrolü", week: 20, icon: "parazit" },
        { label: "Kısırlaştırma görüşmesi", week: 24, icon: "kontrol" },
        { label: "Yıllık kontrol ve aşı tekrarı", week: 52, icon: "kontrol" },
      ],
    },
  ],
  note: "Örnek takvimdir. Aşı ve uygulama zamanlarını dostunuzu muayene eden hekim belirler.",
  placeholder: true,
};

/**
 * Placeholder people, badged as such in the studio. The owner replaces them before
 * anything is sent; the titles, though, are real ones from VET_TITLES.
 */
const TEAM = [
  { name: "Elif Aydın", role: VET_TITLES[0] },
  { name: "Murat Kaya", role: VET_TITLES[0] },
  { name: "Deniz Yıldız", role: VET_TITLES[0] },
];

/** "7/24" in the name is how the operator's own sheet marks a clinic that never closes. */
export function isAlwaysOpen(businessName: string): boolean {
  return /7\s*[/.]?\s*24/.test(businessName);
}

/**
 * A 7/24 clinic gets nabız, whose headline is its opening hours. The rest split between
 * the two new presets by the same slug hash the demo run uses for salons, so two clinics
 * on one street are unlikely to open on the same page.
 */
export function pickVetPreset(lead: BuildInput): string {
  if (isAlwaysOpen(lead.business)) return "nabiz";
  const seed = [...lead.slug].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return seed % 2 === 0 ? "gunes" : "nabiz";
}

export function buildVetSite(lead: BuildInput, preset = pickVetPreset(lead)): SiteContent {
  const business = {
    ...baseBusiness(lead),
    // Not just unrendered: content is serialised into the page's hydration payload, so a
    // rating that is merely not shown is still published. The fields have to be absent.
    rating: undefined,
    reviewCount: undefined,
    fiveStarPct: undefined,
  };
  const alwaysOpen = isAlwaysOpen(lead.business);
  const { district, neighborhood } = business;

  const emergency: SiteContent["sections"] = alwaysOpen
    ? [
        {
          type: "emergency",
          title: "Acil mi? Gece gündüz açığız.",
          note: "Aşağıdakilerden biri varsa beklemeyin. Yola çıkmadan önce arayın, sizi hazır bekleyelim.",
          signs: [
            "Nefes almakta zorlanıyor ya da dişetleri morarıyor",
            "Bayılma, nöbet ya da ayakta duramama",
            "Durmayan kanama, düşme ya da araç çarpması",
            "Zehirlenme şüphesi: çikolata, üzüm, fare zehiri, zambak",
            "Kusmaya çalışıyor ama kusamıyor, karnı şişiyor",
            "Tuvalete çıkamıyor, özellikle erkek kedide",
            "Sıcakta aşırı soluma ya da bilinç bulanıklığı",
          ],
          placeholder: false,
        },
      ]
    : [];

  return {
    version: 1,
    slug: lead.slug,
    pack: "vet",
    preset,
    business,
    hours: alwaysOpen ? ALWAYS_OPEN : WEEKDAYS_9_TO_7,
    whatsappMessage:
      "Merhaba, web sitenizden yazıyorum. Dostum için randevu almak istiyorum, uygun musunuz?",
    seo: {
      title: `${business.name} — ${neighborhood}, ${district}`,
      description: `${district} ${locative(neighborhood)} veteriner kliniği.${
        alwaysOpen ? " 7/24 acil hizmet." : ""
      } Randevu için WhatsApp’tan yazabilirsiniz.`,
    },
    sections: [
      {
        type: "hero",
        headline: alwaysOpen
          ? `${locative(district)} gece gündüz açık veteriner kliniği`
          : `${locative(district)} dostunuzun veteriner hekimi`,
        subline: `Muayene, aşı takvimi, laboratuvar ve cerrahi aynı çatı altında. Randevunuzu WhatsApp’tan alın.`,
        image: {
          src: lead.photo!,
          alt: `${business.name}, ${neighborhood} / ${district}`,
        },
        placeholder: true,
      },
      ...emergency,
      SERVICES,
      {
        type: "about",
        title: "Kliniğimiz",
        body: [
          `${locative(neighborhood)}ki kliniğimizde ${district} ve çevresindeki dostlarımıza bakıyoruz.`,
          alwaysOpen
            ? "Acil durumlar için gece gündüz açığız; yola çıkmadan önce arayarak bilgi verebilirsiniz."
            : "Muayene randevu ile yapılır; acil durumlarda önce telefonla ulaşmanızı rica ederiz.",
        ],
        facts: [
          `${neighborhood} Mahallesi, ${district}`,
          alwaysOpen ? "7 gün 24 saat açık" : "Pazartesi – Cumartesi, 09:00 – 19:00",
          "Kedi ve köpek dostlarımız",
          "Randevu WhatsApp’tan",
        ],
        image: {
          src: "/stock/vet/clinic-exam.webp",
          alt: "Muayene masasında gri bir kediyi inceleyen veteriner hekim",
        },
        placeholder: true,
      },
      VACCINES,
      {
        type: "team",
        title: "Hekimlerimiz",
        intro: "Dostunuzu muayene edecek ekibimizle tanışın.",
        members: TEAM.map((member) => ({
          ...member,
          image: { src: "/stock/vet/vet-portrait-1.webp", alt: member.name },
        })),
        placeholder: true,
      },
      {
        type: "faq",
        title: "Sık sorulanlar",
        intro: "Kliniğe gelmeden önce en çok merak edilenler.",
        image: {
          src: "/stock/vet/faq-groom.webp",
          alt: "Masada oturan kıvırcık tüylü köpeği tarayan veteriner asistanı",
        },
        items: [
          {
            q: "İlk muayeneye gelirken yanımda ne olmalı?",
            a: "Varsa aşı karnesi, önceki tahlil sonuçları ve kullandığı ilaçların adları. Kedinizi taşıma çantasında, köpeğinizi kayışla getirmeniz yeterli.",
          },
          alwaysOpen
            ? {
                q: "Gece de gelebilir miyim?",
                a: "Gece gündüz açığız. Yola çıkmadan önce arayıp dostunuzun durumunu anlatın, sizi hazır bekleyelim.",
              }
            : {
                q: "Randevusuz gelebilir miyim?",
                a: "Muayeneler randevuyla yapılır. Acil bir durumda önce telefonla ulaşın, size yol gösterelim.",
              },
          {
            q: "Hangi hayvanlara bakıyorsunuz?",
            a: "Kedi ve köpek dostlarımıza bakıyoruz. Başka bir tür için gelmeden önce telefonla bilgi almanızı rica ederiz.",
          },
          {
            q: "Aşı takvimini nasıl takip edeceğim?",
            a: "İlk muayenede dostunuza özel takvimi birlikte çıkarıyoruz. Sitemizdeki takvimle bir sonraki adımın yaklaşık tarihini de görebilirsiniz.",
          },
          {
            q: "Ödemeyi nasıl yapabilirim?",
            a: "Nakit ve kredi kartıyla ödeme alıyoruz. Yapılacak işlemleri muayeneden sonra birlikte konuşuyoruz.",
          },
          {
            q: "Kısırlaştırma için doğru zaman ne?",
            a: "Türüne, ırkına ve sağlık durumuna göre değişir. Muayenede dostunuzu değerlendirip birlikte karar veriyoruz.",
          },
        ],
        placeholder: true,
      },
      { type: "hours", title: "Çalışma Saatleri", placeholder: false },
      { type: "contact", title: "İletişim ve Konum", placeholder: false },
    ],
  };
}
