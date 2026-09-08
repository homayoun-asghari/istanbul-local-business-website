import type { SiteContent } from "@/lib/content/schema";
import {
  ALWAYS_OPEN,
  WEEKDAYS_9_TO_7,
  baseBusiness,
  reviewSentence,
  type BuildInput,
} from "../build";

void ALWAYS_OPEN;

/**
 * Real services a güzellik salonu offers, with descriptions that describe the process
 * rather than promise a result. No prices, no staff names, no clinical claims — the
 * owner reads this before replying, and a wrong specific is worse than a vague one.
 */
/**
 * A price menu. Prices are ranges, written the way a Turkish salon writes them —
 * "₺600'den başlayan" rather than a single number — so the owner is not committed to a
 * figure they never quoted. Every one of the four themes studied publishes prices.
 */
const PRICES = [
  {
    name: "Cilt Bakımı",
    description: "Analiz, temizlik ve bakım",
    price: "₺900’den",
    duration: "60 dk",
  },
  {
    name: "Lazer Epilasyon",
    description: "Bölgeye göre seans",
    price: "₺750’den",
    duration: "30 dk",
  },
  {
    name: "Kaş Tasarımı",
    description: "Yüz hatlarına göre şekillendirme",
    price: "₺350’den",
    duration: "25 dk",
  },
  {
    name: "Kalıcı Makyaj",
    description: "Kaş, eyeliner, dudak",
    price: "₺4.500’den",
    duration: "90 dk",
  },
  {
    name: "Ağda ve Tüy Bakımı",
    description: "Bölgesel ve düzenli bakım",
    price: "₺400’den",
    duration: "40 dk",
  },
  {
    name: "Manikür ve Pedikür",
    description: "El ve ayak bakımı, kalıcı oje",
    price: "₺650’den",
    duration: "45 dk",
  },
];

const TEAM = [
  { name: "Melike", role: "Kurucu · Cilt bakımı" },
  { name: "Ayşe", role: "Kalıcı makyaj" },
  { name: "Zeynep", role: "Lazer epilasyon" },
  { name: "Elif", role: "Manikür ve pedikür" },
];

const SERVICES = [
  { name: "Cilt Bakımı", description: "Cilt tipinize göre planlanan temizlik ve bakım seansları." },
  {
    name: "Lazer Epilasyon",
    description: "Seans aralıkları cilt ve tüy yapınıza göre belirlenir.",
  },
  { name: "Ağda ve Tüy Bakımı", description: "Bölgesel ağda ve düzenli bakım." },
  { name: "Kaş ve Kirpik Tasarımı", description: "Yüz hatlarınıza göre kaş şekillendirme." },
  { name: "Kalıcı Makyaj", description: "Kaş, eyeliner ve dudak uygulamaları." },
  { name: "Manikür ve Pedikür", description: "El ve ayak bakımı, oje ve kalıcı oje." },
];

export function buildBeautySite(lead: BuildInput, preset = "atolye"): SiteContent {
  const business = baseBusiness(lead);
  const about = [
    `${business.neighborhood} Mahallesi’ndeki salonumuzda, ${business.district} ve çevresinden gelen misafirlerimizi ağırlıyoruz.`,
    reviewSentence(lead),
    "Randevu sistemiyle çalışıyoruz; böylece her misafirimize ayrılmış bir zaman diliminde ilgilenebiliyoruz.",
  ].filter((paragraph): paragraph is string => Boolean(paragraph));

  return {
    version: 1,
    slug: lead.slug,
    pack: "beauty",
    preset,
    business,
    hours: WEEKDAYS_9_TO_7,
    whatsappMessage:
      "Merhaba, web sitenizden yazıyorum. Randevu almak istiyorum, uygun saatleriniz nedir?",
    seo: {
      title: `${business.name} — ${business.neighborhood}, ${business.district}`,
      description: `${business.district} ${business.neighborhood}’de güzellik ve bakım hizmetleri. Randevu için WhatsApp’tan yazabilirsiniz.`,
    },
    sections: [
      {
        type: "hero",
        headline: `${business.district}’de kendinizi iyi hissettiren bakım`,
        subline: `${business.neighborhood}’deki salonumuzda cilt bakımından kalıcı makyaja kadar her işlemi, size ayrılmış zaman ve tek tek planlanmış randevularla yapıyoruz.`,
        image: {
          src: lead.photo!,
          alt: `${business.name}’nin ${business.neighborhood}, ${business.district}’deki salonundan bir kare`,
        },
        placeholder: true,
      },
      { type: "proof", placeholder: false },
      {
        type: "services",
        title: "Hizmetlerimiz",
        intro: "Randevunuzda hangi işlemin size uygun olduğunu birlikte belirliyoruz.",
        items: SERVICES,
        placeholder: true,
      },
      { type: "about", title: "Hakkımızda", body: about, placeholder: true },
      {
        type: "gallery",
        title: "Salondan",
        images: [{ src: lead.photo!, alt: `${business.name} iç mekan` }],
        placeholder: true,
      },
      {
        type: "pricelist",
        title: "Fiyat listesi",
        intro:
          "Fiyatlar uygulamanın kapsamına göre değişir; randevuda net tutarı birlikte belirliyoruz.",
        items: PRICES.map((item, index) => ({
          ...item,
          image: { src: `/stock/thumb-${(index % 6) + 1}.jpg`, alt: item.name },
        })),
        placeholder: true,
      },
      {
        type: "team",
        title: "Bizi biz yapan ekip",
        intro: "Randevunuzu hangi arkadaşımızla almak istediğinizi belirtebilirsiniz.",
        members: TEAM.map((member, index) => ({
          ...member,
          image: {
            src: `/stock/thumb-${(index % 6) + 1}.jpg`,
            alt: `${member.name} — ${member.role}`,
          },
        })),
        placeholder: true,
      },
      {
        type: "booking",
        title: "Randevu alın",
        note: "Formu doldurun, mesajınız WhatsApp’ta hazır olarak açılsın. Genellikle aynı gün dönüyoruz.",
        placeholder: false,
      },
      { type: "hours", title: "Çalışma Saatleri", placeholder: false },
      { type: "contact", title: "İletişim ve Konum", placeholder: false },
      {
        type: "instagram",
        title: "Salondan kareler",
        handle:
          lead.social && /instagram/i.test(lead.social) ? "Instagram’da takip edin" : undefined,
        images: Array.from({ length: 6 }, (_, index) => ({
          src: `/stock/thumb-${index + 1}.jpg`,
          alt: `${business.name} — salondan bir kare`,
        })),
        placeholder: true,
      },
    ],
  };
}
