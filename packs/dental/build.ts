import type { SiteContent } from "@/lib/content/schema";
import { baseBusiness, requireFacts, WEEKDAYS_9_TO_7, type BuildInput } from "../build";

/**
 * The dental pack.
 *
 * Three of the sections the beauty pack leans on cannot appear here, and it is worth
 * saying why in the file that would otherwise have written them.
 *
 * Sağlıkta Tanıtım ve Bilgilendirme Yönetmeliği (Resmî Gazete 12.11.2025, No. 33075)
 * governs what a private health facility may publish on its own site:
 *
 *   - no price list, no discount, no campaign         (m.5/1-l, m.5/1-m)
 *   - no rating, no review count, no testimonial      (m.5/1-e)
 *   - no superiority or comparative claim             (m.5/1-c, m.5/1-ı)
 *   - only titles that exist in law                   (m.5/1-d)
 *   - before/after is allowed, under conditions       (m.7/1)
 *   - the site must show a last-updated date and
 *     contact details for whoever edits it            (m.5/1-i)
 *
 * So there is no `pricelist` and no `proof` section below, the clinic band carries
 * checkable facts rather than a satisfaction figure, and every role in the team comes
 * from TITLES, which is the list of dental branches recognised under Law 1219.
 */

/** Dental branches recognised in Turkish law. Nothing else may appear as a title. */
export const TITLES = [
  "Diş Hekimi",
  "Ağız, Diş ve Çene Cerrahisi",
  "Ortodonti",
  "Periodontoloji",
  "Endodonti",
  "Protetik Diş Tedavisi",
  "Restoratif Diş Tedavisi",
  "Pedodonti",
  "Ağız, Diş ve Çene Radyolojisi",
] as const;

const TREATMENTS = [
  {
    name: "Dolgu ve kanal tedavisi",
    note: "Çürük temizliği ve kanal tedavisi",
    tile: 0,
  },
  { name: "Şeffaf plak", note: "Görünmez ortodontik tedavi", tile: 1 },
  { name: "İmplant", note: "Eksik dişin yerine vidalı kök", tile: 2 },
  { name: "Ortodonti", note: "Braket ve tel ile düzeltme", tile: 3 },
  { name: "Zirkonyum kaplama", note: "Ölçü alınır, renk birlikte seçilir", tile: 4 },
];

/**
 * The planner's data.
 *
 * Visit counts and durations are information about a procedure — how many times you sit
 * in the chair and over how long. They are not prices, and nothing here may become one.
 * Ranges are wide on purpose: a narrow range read as a promise would be a claim.
 */
const GOALS = [
  {
    id: "eksik",
    label: "Eksik dişim var",
    methods: [
      {
        id: "implant",
        label: "İmplant",
        visits: [3, 5] as [number, number],
        weeks: [12, 24] as [number, number],
        perTooth: true,
        specialist: "Ağız, Diş ve Çene Cerrahisi",
        steps: [
          "Muayene ve 3B tomografi ile planlama",
          "İmplantın yerleştirilmesi",
          "Kaynama süresi boyunca kontroller",
          "Üst yapının ölçüsü ve takılması",
        ],
      },
      {
        id: "kopru",
        label: "Köprü",
        visits: [2, 4] as [number, number],
        weeks: [2, 4] as [number, number],
        perTooth: false,
        specialist: "Protetik Diş Tedavisi",
        steps: [
          "Muayene ve komşu dişlerin değerlendirilmesi",
          "Ölçü alınması ve renk seçimi",
          "Provalar ve yapıştırma",
        ],
      },
      {
        id: "protez",
        label: "Protez",
        visits: [3, 5] as [number, number],
        weeks: [3, 6] as [number, number],
        perTooth: false,
        specialist: "Protetik Diş Tedavisi",
        steps: ["Ağız içi ölçü ve planlama", "Prova seansları", "Teslim ve uyum kontrolleri"],
      },
    ],
  },
  {
    id: "caprasik",
    label: "Dişlerim çapraşık",
    methods: [
      {
        id: "plak",
        label: "Şeffaf plak",
        visits: [6, 10] as [number, number],
        weeks: [26, 78] as [number, number],
        perTooth: false,
        specialist: "Ortodonti",
        steps: [
          "Ağız içi tarama ve tedavi simülasyonu",
          "Plakların hazırlanması",
          "Her plak değişiminde kontrol",
          "Pekiştirme dönemi",
        ],
      },
      {
        id: "braket",
        label: "Braket ve tel",
        visits: [10, 18] as [number, number],
        weeks: [52, 104] as [number, number],
        perTooth: false,
        specialist: "Ortodonti",
        steps: [
          "Röntgen ve ortodontik ölçüm",
          "Braketlerin yapıştırılması",
          "Dört-altı haftada bir tel ayarı",
          "Pekiştirme apareyi",
        ],
      },
    ],
  },
  {
    id: "renk",
    label: "Dişlerimin rengi ve görünümü",
    methods: [
      {
        id: "beyazlatma",
        label: "Beyazlatma",
        visits: [1, 2] as [number, number],
        weeks: [1, 2] as [number, number],
        perTooth: false,
        specialist: "Restoratif Diş Tedavisi",
        steps: ["Diş taşı temizliği", "Ofis tipi beyazlatma seansı", "Ev tipi destek ve kontrol"],
      },
      {
        id: "zirkonyum",
        label: "Zirkonyum kaplama",
        visits: [2, 4] as [number, number],
        weeks: [2, 4] as [number, number],
        perTooth: true,
        specialist: "Protetik Diş Tedavisi",
        steps: ["Muayene ve renk seçimi", "Dişlerin hazırlanması ve ölçü", "Prova ve yapıştırma"],
      },
      {
        id: "lamina",
        label: "Lamina (yaprak porselen)",
        visits: [2, 4] as [number, number],
        weeks: [2, 5] as [number, number],
        perTooth: true,
        specialist: "Restoratif Diş Tedavisi",
        steps: [
          "Gülüş tasarımı ve dijital önizleme",
          "Minimum düzeyde diş hazırlığı",
          "Laminaların yapıştırılması",
        ],
      },
    ],
  },
  {
    id: "agri",
    label: "Ağrım var",
    methods: [
      {
        id: "kanal",
        label: "Kanal tedavisi",
        visits: [1, 3] as [number, number],
        weeks: [1, 3] as [number, number],
        perTooth: true,
        specialist: "Endodonti",
        steps: ["Muayene ve röntgen", "Kanalların temizlenmesi ve doldurulması", "Üst dolgu"],
      },
      {
        id: "dolgu",
        label: "Dolgu",
        visits: [1, 2] as [number, number],
        weeks: [1, 1] as [number, number],
        perTooth: true,
        specialist: "Restoratif Diş Tedavisi",
        steps: ["Çürüğün temizlenmesi", "Dolgunun yapılması ve cila"],
      },
    ],
  },
  {
    id: "kontrol",
    label: "Genel kontrol istiyorum",
    methods: [
      {
        id: "muayene",
        label: "Muayene ve diş taşı temizliği",
        visits: [1, 2] as [number, number],
        weeks: [1, 1] as [number, number],
        perTooth: false,
        specialist: "Periodontoloji",
        steps: ["Ağız içi muayene", "Gerekirse röntgen", "Diş taşı temizliği ve cila"],
      },
    ],
  },
];

/**
 * Placeholder people, badged as such in the studio.
 *
 * A demo with an empty team reads as unfinished, and the owner replaces these before
 * anything is sent. The titles, though, are not placeholders: they come from TITLES, and
 * inventing one — "estetik diş hekimliği uzmanı" is the usual offender — is precisely
 * what m.5/1-d prohibits.
 */
const TEAM = [
  { name: "Dt. Mert Kaya", role: TITLES[1], since: "2013" },
  { name: "Dt. Selin Arslan", role: TITLES[2], since: "2016" },
  { name: "Dt. Nihan Yalçın", role: TITLES[4], since: "2011" },
];

export function buildDentalSite(lead: BuildInput, preset = "cam"): SiteContent {
  const facts = requireFacts(lead);
  const business = baseBusiness(lead);
  const tiles = [
    "/stock/dental/tile-tooth.webp",
    "/stock/dental/tile-aligner.webp",
    "/stock/dental/tile-implant.webp",
    "/stock/dental/tile-arch.webp",
    "/stock/dental/tile-crown.webp",
  ];
  const portraits = [
    "/stock/dental/doctor-1.webp",
    "/stock/dental/doctor-2.webp",
    "/stock/dental/doctor-3.webp",
  ];

  return {
    version: 1,
    slug: lead.slug,
    pack: "dental",
    preset,
    business: {
      ...business,
      // m.5/1-i: the site has to say who to contact about the site itself.
      editor: `${lead.business} · ${facts.phone}`,
    },
    hours: WEEKDAYS_9_TO_7,
    updatedAt: new Date().toISOString().slice(0, 10),
    whatsappMessage:
      "Merhaba, web sitenizden yazıyorum. Randevu almak istiyorum, uygun saatleriniz nedir?",
    seo: {
      title: `${business.name} — ${business.neighborhood}, ${business.district}`,
      description: `${business.district} ${business.neighborhood}’de ağız ve diş sağlığı. Randevu için WhatsApp’tan yazabilirsiniz.`,
    },
    sections: [
      {
        type: "hero",
        headline: "Her gülüş ayrı planlanır",
        subline: `${business.neighborhood}’deki kliniğimizde implant, ortodonti ve estetik diş hekimliği. Randevunuz size ayrılmış bir zaman dilimidir.`,
        image: {
          src: facts.photo,
          alt: `${business.name}’nin ${business.neighborhood}, ${business.district}’deki kliniği`,
        },
        placeholder: true,
      },
      {
        type: "clinic",
        title: `${business.neighborhood}’de ağız ve diş sağlığı`,
        body: `${business.neighborhood} Mahallesi’ndeki kliniğimizde muayeneden implanta, ortodontiden estetik uygulamalara kadar ağız ve diş sağlığınızı tek yerde sürdürüyoruz. Her tedavi önce muayenede planlanır.`,
        image: {
          src: facts.photo,
          alt: `${business.name} kliniğinden bir görünüm`,
        },
        // Checkable or true by construction. Never a rating (m.5/1-e), never a
        // superiority claim (m.5/1-c) — and badged, so the operator swaps in the real
        // founding year and dentist count before anything is sent.
        facts: [
          { value: String(TREATMENTS.length), label: "tedavi başlığı" },
          { value: "Pzt – Cmt", label: "açık günler" },
          { value: business.neighborhood, label: business.district },
          { value: "Randevulu", label: "çalışma düzeni" },
        ],
        placeholder: true,
      },
      {
        type: "treatments",
        title: "Tedaviler",
        intro: "Hangi tedavinin size uygun olduğunu muayenede birlikte belirliyoruz.",
        items: TREATMENTS.map((treatment) => ({
          name: treatment.name,
          note: treatment.note,
          image: { src: tiles[treatment.tile], alt: treatment.name },
        })),
        placeholder: true,
      },
      {
        type: "team",
        title: "Hekimlerimiz",
        intro:
          "Randevunuzu hangi hekimimizle almak istediğinizi belirtebilirsiniz. Uzmanlık adları 1219 sayılı Kanun’da tanımlı branşlardır.",
        members: TEAM.map((member, index) => ({
          name: member.name,
          role: member.role,
          since: `${member.since}’ten beri`,
          image: { src: portraits[index % portraits.length], alt: member.name },
        })),
        placeholder: true,
      },
      {
        type: "planner",
        title: "Tedavi planınızı görün",
        intro:
          "Ne yaptırmak istediğinizi seçin, tedavinin kaç seans ve ne kadar sürdüğünü görün. Plan WhatsApp’a hazır gelir.",
        goals: GOALS,
        // The sentence that keeps this section on the right side of m.5/1-l.
        note: "Bu bir tahmindir, fiyat bilgisi içermez. Kesin plan ve ücret muayenede belirlenir.",
        placeholder: false,
      },
      {
        type: "beforeAfter",
        title: "Öncesi ve sonrası",
        intro:
          "Onaylı hasta fotoğraflarınız buraya gelir: aynı ışıkta, aynı açıdan, işlem ve çekim tarihleriyle birlikte.",
        disclaimer:
          "Sonuçlar kişiden kişiye değişir. Tedavi kararı için diş hekiminize danışın. Görseller hastanın yazılı onayıyla yayımlanır.",
        cases: [
          {
            treatment: "Beyazlatma",
            title: "Beyazlatmada ne değişir",
            story:
              "Aynı model, aynı ışık ve aynı açıdan iki kare. Beyazlatmada değişen tek şey mine rengidir; diş dizilimi ve diş eti aynı kalır.",
            did: [
              "Diş taşı temizliği ve mine yüzeyinin hazırlanması",
              "Klinikte beyazlatma seansı",
              "Ev tipi destek ve iki hafta sonra kontrol",
            ],
            before: {
              src: "/stock/dental/whitening-before.webp",
              alt: "Beyazlatma öncesi diş modeli",
            },
            after: {
              src: "/stock/dental/whitening-after.webp",
              alt: "Beyazlatma sonrası diş modeli",
            },
            procedureDate: "Mart 2026 (örnek)",
            photoDate: "Nisan 2026 (örnek)",
            illustration: true,
          },
        ],
        placeholder: true,
      },
      {
        type: "booking",
        title: "Randevu alın",
        note: "Formu doldurun, mesajınız WhatsApp’ta hazır olarak açılsın.",
        placeholder: false,
      },
      { type: "hours", title: "Çalışma Saatleri", placeholder: false },
      { type: "contact", title: "İletişim ve Konum", placeholder: false },
    ],
  };
}
